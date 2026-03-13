import aiohttp
import os
import logging

logger = logging.getLogger(__name__)

async def generate_completion(prompt: str, system_prompt: str, api_key: str, model: str = "gpt-4o-mini", max_tokens: int = 500) -> str:
    """
    Generate a completion using an LLM API.
    This is a placeholder implementation that uses OpenAI-compatible API.
    """
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    error_detail = await response.text()
                    logger.error(f"API error: {response.status} - {error_detail}")
                    return "I'm sorry, I'm having trouble connecting to my legal knowledge base right now. Please try again later or consult a verified advocate."
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return "An error occurred while processing your request. Please try again later."
