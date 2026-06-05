import os
import json
import boto3
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from mangum import Mangum
from pydantic import BaseModel
from openai import OpenAI
from botocore.exceptions import ClientError

app = FastAPI()
handler = Mangum(app)

# --- AWS Clients ---
dynamodb = boto3.resource("dynamodb")
ssm = boto3.client("ssm")
TABLE_NAME = os.environ.get("PERSONA_TABLE", "MambaHelperPersonas")
KEY_PARAM = os.environ.get("OPENROUTER_KEY_PARAM", "MambaHelperOpenRouterKey")
table = dynamodb.Table(TABLE_NAME)

# --- Lazy Initialization for OpenAI (OpenRouter) ---
_cached_client = None

def get_ai_client():
    global _cached_client
    if _cached_client is None:
        try:
            # Fetch secret from SSM Secure Parameter at runtime
            response = ssm.get_parameter(Name=KEY_PARAM, WithDecryption=True)
            api_key = response["Parameter"]["Value"]
            _cached_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key
            )
        except Exception as e:
            print(f"Error fetching SSM parameter: {e}")
            raise HTTPException(status_code=500, detail="Failed to initialize AI client")
    return _cached_client

# --- Models ---
class Persona(BaseModel):
    userId: str  # Partition Key
    name: str
    age: Optional[int] = None
    goals: List[str]
    style: str
    bio: Optional[str] = ""
    redFlags: List[str] = []
    interests: List[str] = []
    lookingFor: Optional[str] = ""

class ChatMessage(BaseModel):
    role: str
    text: str

class AnalysisRequest(BaseModel):
    userId: str
    chatHistory: List[ChatMessage]

class AnalysisResponse(BaseModel):
    analysis: str
    suggestions: List[str]

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "MambaHelper Serverless API is running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_chat(request: AnalysisRequest):
    # 1. Fetch Persona from DynamoDB
    try:
        response = table.get_item(Key={"userId": request.userId})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Persona not found. Please complete onboarding.")
        persona_data = response["Item"]
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 2. Call OpenRouter
    history_str = "\n".join([f"{m.role}: {m.text}" for m in request.chatHistory])
    prompt = f"""
    You are a professional dating coach. Analyze the chat and suggest the next move.
    
    User Persona (ME):
    - Name: {persona_data.get('name')}
    - Goals: {', '.join(persona_data.get('goals', []))}
    - Style: {persona_data.get('style')}
    
    Chat:
    {history_str}
    
    Return JSON with 'analysis' and 'suggestions' keys.
    """

    try:
        ai_client = get_ai_client()
        completion = ai_client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://github.com/artemu78/MambaHelper",
                "X-Title": "MambaHelper",
            },
            model="google/gemini-2.0-flash-001",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return AnalysisResponse(**json.loads(completion.choices[0].message.content))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync/persona")
async def sync_persona(persona: Persona):
    try:
        table.put_item(Item=persona.dict())
        return {"status": "synced"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))