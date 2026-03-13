from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADVOCATE = "advocate"
    ADMIN = "admin"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    role: UserRole = UserRole.USER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Advocate Models
class AdvocateProfileCreate(BaseModel):
    bar_registration_no: str
    experience_years: int
    practice_areas: List[str]
    languages: List[str]
    state: str
    city: str
    availability_hours: str
    qualification: str
    profile_photo: Optional[str] = None  # base64
    documents: List[str] = []  # base64 documents

class AdvocateProfile(BaseModel):
    id: str
    user_id: str
    bar_registration_no: str
    experience_years: int
    practice_areas: List[str]
    languages: List[str]
    state: str
    city: str
    availability_hours: str
    qualification: str
    profile_photo: Optional[str] = None
    documents: List[str] = []
    verification_status: VerificationStatus = VerificationStatus.PENDING
    contact_enabled: bool = True
    chat_enabled: bool = True
    rating: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdvocateProfileUpdate(BaseModel):
    experience_years: Optional[int] = None
    practice_areas: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    state: Optional[str] = None
    city: Optional[str] = None
    availability_hours: Optional[str] = None
    qualification: Optional[str] = None
    profile_photo: Optional[str] = None
    contact_enabled: Optional[bool] = None
    chat_enabled: Optional[bool] = None

class AdvocateListItem(BaseModel):
    id: str
    user_id: str
    full_name: str
    experience_years: int
    practice_areas: List[str]
    languages: List[str]
    city: str
    state: str
    profile_photo: Optional[str] = None
    rating: float
    verification_status: VerificationStatus

# Article Models
class ArticleCategory(str, Enum):
    CONSTITUTION = "Indian Constitution & Women"
    REPRODUCTIVE = "Reproductive Rights"
    BNSS = "Women Rights under BNSS"
    SEXUAL_OFFENCES = "Sexual Offences Against Women"
    MARRIAGE = "Offences Relating to Marriage"
    CYBER_CRIMES = "Cyber Crimes Against Women"

class ArticleCreate(BaseModel):
    title: str
    content: str
    category: ArticleCategory
    subcategory: Optional[str] = None

class Article(BaseModel):
    id: str
    title: str
    content: str
    category: ArticleCategory
    subcategory: Optional[str] = None
    author_id: str
    author_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0

# Emergency Contact Models
class EmergencyContactItem(BaseModel):
    name: str
    phone: str
    relationship: str

class EmergencyContacts(BaseModel):
    id: str
    user_id: str
    contacts: List[EmergencyContactItem] = []

class EmergencyContactsUpdate(BaseModel):
    contacts: List[EmergencyContactItem]

# Chat Models
class ChatMessage(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

class Chat(BaseModel):
    id: str
    user_id: str
    user_name: str
    advocate_id: str
    advocate_name: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatCreate(BaseModel):
    advocate_id: str

class MessageCreate(BaseModel):
    chat_id: str
    message: str

# Appointment Models
class AppointmentStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class AppointmentCreate(BaseModel):
    advocate_id: str
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    user_id: str
    user_name: str
    advocate_id: str
    advocate_name: str
    status: AppointmentStatus = AppointmentStatus.PENDING
    notes: Optional[str] = None
    requested_at: datetime = Field(default_factory=datetime.utcnow)

# AI Chatbot Models
class ChatbotQuery(BaseModel):
    question: str
    context: Optional[str] = None

class ChatbotResponse(BaseModel):
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
