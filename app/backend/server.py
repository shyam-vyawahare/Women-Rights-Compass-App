from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from typing import List, Optional
from datetime import datetime
import socketio

# Import models and auth
from models import (
    UserCreate, UserLogin, User, TokenResponse, UserRole,
    AdvocateProfileCreate, AdvocateProfile, AdvocateProfileUpdate, AdvocateListItem,
    ArticleCreate, Article, ArticleCategory, VerificationStatus,
    EmergencyContacts, EmergencyContactsUpdate,
    Chat, ChatCreate, ChatMessage, MessageCreate,
    AppointmentCreate, Appointment, AppointmentStatus,
    ChatbotQuery, ChatbotResponse
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role
)

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.getenv('DB_NAME', 'women_rights_compass')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Create FastAPI app
app = FastAPI(title="Women Legal Rights API")
api_router = APIRouter(prefix="/api", tags=["API"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== Helper Functions ==============

def user_doc_to_model(doc: dict) -> User:
    """Convert user document to User model"""
    return User(
        id=str(doc["_id"]),
        email=doc["email"],
        full_name=doc["full_name"],
        phone=doc["phone"],
        role=UserRole(doc["role"]),
        created_at=doc.get("created_at", datetime.utcnow())
    )

# ============== Authentication Routes ==============

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "role": user_data.role.value,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    # Create JWT token
    token_data = {
        "sub": str(result.inserted_id),
        "email": user_data.email,
        "role": user_data.role.value
    }
    access_token = create_access_token(token_data)
    
    user = user_doc_to_model(user_dict)
    
    return TokenResponse(
        access_token=access_token,
        user=user
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create JWT token
    token_data = {
        "sub": str(user_doc["_id"]),
        "email": user_doc["email"],
        "role": user_doc["role"]
    }
    access_token = create_access_token(token_data)
    
    user = user_doc_to_model(user_doc)
    
    return TokenResponse(
        access_token=access_token,
        user=user
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    from bson import ObjectId
    user_doc = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc_to_model(user_doc)

# ============== Advocate Routes ==============

@api_router.post("/advocates/profile", response_model=AdvocateProfile)
async def create_advocate_profile(
    profile_data: AdvocateProfileCreate,
    current_user: dict = Depends(require_role([UserRole.ADVOCATE]))
):
    """Create advocate profile"""
    from bson import ObjectId
    user_id = current_user["sub"]
    
    # Check if profile already exists
    existing = await db.advocates.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    profile_dict = {
        "user_id": user_id,
        **profile_data.dict(),
        "verification_status": VerificationStatus.PENDING.value,
        "contact_enabled": True,
        "chat_enabled": True,
        "rating": 0.0,
        "created_at": datetime.utcnow()
    }
    
    result = await db.advocates.insert_one(profile_dict)
    profile_dict["_id"] = result.inserted_id
    
    return AdvocateProfile(
        id=str(result.inserted_id),
        **profile_dict
    )

@api_router.get("/advocates/profile/me", response_model=AdvocateProfile)
async def get_my_advocate_profile(
    current_user: dict = Depends(require_role([UserRole.ADVOCATE]))
):
    """Get current advocate's profile"""
    profile = await db.advocates.find_one({"user_id": current_user["sub"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return AdvocateProfile(id=str(profile["_id"]), **profile)

@api_router.put("/advocates/profile/me", response_model=AdvocateProfile)
async def update_my_advocate_profile(
    update_data: AdvocateProfileUpdate,
    current_user: dict = Depends(require_role([UserRole.ADVOCATE]))
):
    """Update advocate profile"""
    # Get existing profile
    profile = await db.advocates.find_one({"user_id": current_user["sub"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update only provided fields
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    if update_dict:
        await db.advocates.update_one(
            {"user_id": current_user["sub"]},
            {"$set": update_dict}
        )
    
    # Get updated profile
    updated_profile = await db.advocates.find_one({"user_id": current_user["sub"]})
    return AdvocateProfile(id=str(updated_profile["_id"]), **updated_profile)

@api_router.get("/advocates", response_model=List[AdvocateListItem])
async def get_advocates(
    city: Optional[str] = None,
    state: Optional[str] = None,
    practice_area: Optional[str] = None,
    language: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get list of approved advocates with filters"""
    from bson import ObjectId
    
    query = {"verification_status": VerificationStatus.APPROVED.value}
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if state:
        query["state"] = {"$regex": state, "$options": "i"}
    if practice_area:
        query["practice_areas"] = {"$regex": practice_area, "$options": "i"}
    if language:
        query["languages"] = {"$regex": language, "$options": "i"}
    
    advocates = await db.advocates.find(query).to_list(100)
    
    # Get user names
    result = []
    for advocate in advocates:
        user = await db.users.find_one({"_id": ObjectId(advocate["user_id"])})
        if user:
            result.append(AdvocateListItem(
                id=str(advocate["_id"]),
                user_id=advocate["user_id"],
                full_name=user["full_name"],
                experience_years=advocate["experience_years"],
                practice_areas=advocate["practice_areas"],
                languages=advocate["languages"],
                city=advocate["city"],
                state=advocate["state"],
                profile_photo=advocate.get("profile_photo"),
                rating=advocate.get("rating", 0.0),
                verification_status=VerificationStatus(advocate["verification_status"])
            ))
    
    return result

@api_router.get("/advocates/{advocate_id}", response_model=AdvocateProfile)
async def get_advocate_by_id(
    advocate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get advocate profile by ID"""
    from bson import ObjectId
    try:
        advocate = await db.advocates.find_one({"_id": ObjectId(advocate_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid advocate ID")
    
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return AdvocateProfile(id=str(advocate["_id"]), **advocate)

# ============== Admin Routes - Advocate Approval ==============

@api_router.get("/admin/advocates/pending", response_model=List[AdvocateListItem])
async def get_pending_advocates(
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Get pending advocates for approval"""
    from bson import ObjectId
    
    advocates = await db.advocates.find({
        "verification_status": VerificationStatus.PENDING.value
    }).to_list(100)
    
    result = []
    for advocate in advocates:
        user = await db.users.find_one({"_id": ObjectId(advocate["user_id"])})
        if user:
            result.append(AdvocateListItem(
                id=str(advocate["_id"]),
                user_id=advocate["user_id"],
                full_name=user["full_name"],
                experience_years=advocate["experience_years"],
                practice_areas=advocate["practice_areas"],
                languages=advocate["languages"],
                city=advocate["city"],
                state=advocate["state"],
                profile_photo=advocate.get("profile_photo"),
                rating=advocate.get("rating", 0.0),
                verification_status=VerificationStatus(advocate["verification_status"])
            ))
    
    return result

@api_router.put("/admin/advocates/{advocate_id}/verify")
async def verify_advocate(
    advocate_id: str,
    approve: bool,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Approve or reject advocate"""
    from bson import ObjectId
    try:
        result = await db.advocates.update_one(
            {"_id": ObjectId(advocate_id)},
            {"$set": {
                "verification_status": VerificationStatus.APPROVED.value if approve else VerificationStatus.REJECTED.value
            }}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid advocate ID")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return {"message": f"Advocate {'approved' if approve else 'rejected'} successfully"}

# ============== Article Routes ==============

@api_router.post("/articles", response_model=Article)
async def create_article(
    article_data: ArticleCreate,
    current_user: dict = Depends(require_role([UserRole.ADVOCATE, UserRole.ADMIN]))
):
    """Create a new article"""
    from bson import ObjectId
    
    # Get user name
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    
    article_dict = {
        **article_data.dict(),
        "author_id": current_user["sub"],
        "author_name": user["full_name"] if user else "Unknown",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "views": 0
    }
    
    result = await db.articles.insert_one(article_dict)
    article_dict["_id"] = result.inserted_id
    
    return Article(id=str(result.inserted_id), **article_dict)

@api_router.get("/articles", response_model=List[Article])
async def get_articles(
    category: Optional[ArticleCategory] = None,
    author_id: Optional[str] = None
):
    """Get articles with optional filters"""
    query = {}
    if category:
        query["category"] = category.value
    if author_id:
        query["author_id"] = author_id
    
    articles = await db.articles.find(query).sort("created_at", -1).to_list(100)

    return [Article(id=str(a["_id"]), **a) for a in articles]

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """Get article by ID and increment views"""
    from bson import ObjectId
    try:
        # Increment view count
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$inc": {"views": 1}}
        )
        
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid article ID")
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return Article(id=str(article["_id"]), **article)

# ============== Emergency Contacts Routes ==============

@api_router.get("/emergency-contacts", response_model=EmergencyContacts)
async def get_emergency_contacts(
    current_user: dict = Depends(require_role([UserRole.USER]))
):
    """Get user's emergency contacts"""
    contacts = await db.emergency_contacts.find_one({"user_id": current_user["sub"]})
    
    if not contacts:
        # Create empty contacts
        contacts_dict = {
            "user_id": current_user["sub"],
            "contacts": []
        }
        result = await db.emergency_contacts.insert_one(contacts_dict)
        contacts_dict["_id"] = result.inserted_id
        return EmergencyContacts(id=str(result.inserted_id), **contacts_dict)
    
    return EmergencyContacts(id=str(contacts["_id"]), **contacts)

@api_router.put("/emergency-contacts", response_model=EmergencyContacts)
async def update_emergency_contacts(
    update_data: EmergencyContactsUpdate,
    current_user: dict = Depends(require_role([UserRole.USER]))
):
    """Update emergency contacts"""
    # Limit to 3 contacts
    if len(update_data.contacts) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 emergency contacts allowed"
        )
    
    result = await db.emergency_contacts.update_one(
        {"user_id": current_user["sub"]},
        {"$set": {"contacts": [c.dict() for c in update_data.contacts]}},
        upsert=True
    )
    
    contacts = await db.emergency_contacts.find_one({"user_id": current_user["sub"]})
    return EmergencyContacts(id=str(contacts["_id"]), **contacts)

# ============== Chat Routes ==============

@api_router.post("/chats", response_model=Chat)
async def create_chat(
    chat_data: ChatCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create or get existing chat with an advocate"""
    from bson import ObjectId
    
    # Check if chat already exists
    existing_chat = await db.chats.find_one({
        "user_id": current_user["sub"],
        "advocate_id": chat_data.advocate_id
    })
    
    if existing_chat:
        return Chat(id=str(existing_chat["_id"]), **existing_chat)
    
    # Get user and advocate names
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    advocate_user = await db.users.find_one({"_id": ObjectId(chat_data.advocate_id)})
    
    if not advocate_user:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    chat_dict = {
        "user_id": current_user["sub"],
        "user_name": user["full_name"],
        "advocate_id": chat_data.advocate_id,
        "advocate_name": advocate_user["full_name"],
        "last_message": None,
        "last_message_time": None,
        "unread_count": 0,
        "created_at": datetime.utcnow()
    }
    
    result = await db.chats.insert_one(chat_dict)
    chat_dict["_id"] = result.inserted_id
    
    return Chat(id=str(result.inserted_id), **chat_dict)

@api_router.get("/chats", response_model=List[Chat])
async def get_my_chats(current_user: dict = Depends(get_current_user)):
    """Get all chats for current user"""
    query = {}
    if current_user["role"] == UserRole.USER.value:
        query["user_id"] = current_user["sub"]
    elif current_user["role"] == UserRole.ADVOCATE.value:
        query["advocate_id"] = current_user["sub"]
    
    chats = await db.chats.find(query).sort("last_message_time", -1).to_list(100)
    
    return [Chat(id=str(c["_id"]), **c) for c in chats]

@api_router.get("/chats/{chat_id}/messages", response_model=List[ChatMessage])
async def get_chat_messages(
    chat_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get messages for a chat"""
    from bson import ObjectId
    try:
        # Verify user has access to this chat
        chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid chat ID")
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if chat["user_id"] != current_user["sub"] and chat["advocate_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Get messages
    messages = await db.messages.find({"chat_id": chat_id}).sort("timestamp", 1).to_list(1000)
    
    # Mark messages as read if user is receiver
    if current_user["sub"] != chat.get("last_sender_id"):
        await db.messages.update_many(
            {"chat_id": chat_id, "sender_id": {"$ne": current_user["sub"]}, "read": False},
            {"$set": {"read": True}}
        )
        # Reset unread count
        await db.chats.update_one(
            {"_id": ObjectId(chat_id)},
            {"$set": {"unread_count": 0}}
        )
    
    return [ChatMessage(id=str(m["_id"]), **m) for m in messages]

# ============== Appointment Routes ==============

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: dict = Depends(require_role([UserRole.USER]))
):
    """Request consultation appointment with advocate"""
    from bson import ObjectId
    
    # Get user and advocate names
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    advocate_user = await db.users.find_one({"_id": ObjectId(appointment_data.advocate_id)})
    
    if not advocate_user:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    appointment_dict = {
        "user_id": current_user["sub"],
        "user_name": user["full_name"],
        "advocate_id": appointment_data.advocate_id,
        "advocate_name": advocate_user["full_name"],
        "status": AppointmentStatus.PENDING.value,
        "notes": appointment_data.notes,
        "requested_at": datetime.utcnow()
    }
    
    result = await db.appointments.insert_one(appointment_dict)
    appointment_dict["_id"] = result.inserted_id
    
    return Appointment(id=str(result.inserted_id), **appointment_dict)

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    """Get appointments for current user"""
    query = {}
    if current_user["role"] == UserRole.USER.value:
        query["user_id"] = current_user["sub"]
    elif current_user["role"] == UserRole.ADVOCATE.value:
        query["advocate_id"] = current_user["sub"]
    
    appointments = await db.appointments.find(query).sort("requested_at", -1).to_list(100)
    
    return [Appointment(id=str(a["_id"]), **a) for a in appointments]

# ============== AI Chatbot Routes ==============

@api_router.post("/chatbot/ask", response_model=ChatbotResponse)
async def ask_chatbot(
    query: ChatbotQuery,
    current_user: dict = Depends(get_current_user)
):
    """Ask AI chatbot a legal question"""
    from emergentintegrations import generate_completion
    
    # Create context-aware prompt
    system_prompt = (
        "You are a helpful AI assistant specializing in Indian women's legal rights. "
        "Provide accurate, compassionate, and helpful information about legal matters affecting women in India. "
        "Always encourage users to consult with qualified legal advocates for specific cases. "
        "Focus on areas like: Indian Constitution & Women's Rights, Reproductive Rights, BNSS (Bharatiya Nyaya Suraksha Sanhita), "
        "Sexual Offences, Marriage-related Offences, and Cyber Crimes Against Women."
    )

    user_prompt = f"Question: {query.question}"
    if query.context:
        user_prompt += f"\n\nContext: {query.context}"
    
    try:
        # Use Emergent Universal LLM Key
        response = await generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            api_key=os.getenv("EMERGENT_LLM_KEY", "sk-emergent-a779b41E0E5E9C9D31"),
            model="gpt-4o-mini",
            max_tokens=500
        )
        
        return ChatbotResponse(
            answer=response,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get response from AI chatbot"
        )

# ============== Socket.IO Events ==============

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_chat(sid, data):
    """Join a chat room"""
    chat_id = data.get('chat_id')
    await sio.enter_room(sid, chat_id)
    logger.info(f"Client {sid} joined chat {chat_id}")

@sio.event
async def send_message(sid, data):
    """Send a message in real-time"""
    from bson import ObjectId
    
    chat_id = data.get('chat_id')
    sender_id = data.get('sender_id')
    message_text = data.get('message')
    
    # Get sender name
    user = await db.users.find_one({"_id": ObjectId(sender_id)})
    sender_name = user["full_name"] if user else "Unknown"
    
    # Save message to database
    message_dict = {
        "chat_id": chat_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "message": message_text,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    
    result = await db.messages.insert_one(message_dict)
    message_dict["_id"] = result.inserted_id
    
    # Update chat last message
    await db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {
            "$set": {
                "last_message": message_text,
                "last_message_time": datetime.utcnow(),
                "last_sender_id": sender_id
            },
            "$inc": {"unread_count": 1}
        }
    )
    
    # Emit to room
    message_response = ChatMessage(
        id=str(message_dict["_id"]),
        **message_dict
    )
    
    await sio.emit('new_message', message_response.dict(), room=chat_id)

# ============== Root Route ==============

@api_router.get("/")
async def root():
    return {
        "message": "Women Legal Rights API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/signup, /api/auth/login",
            "advocates": "/api/advocates",
            "articles": "/api/articles",
            "chats": "/api/chats",
            "emergency": "/api/emergency-contacts",
            "chatbot": "/api/chatbot/ask"
        }
    }

# Include router
app.include_router(api_router)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Export for uvicorn
app = socket_app
