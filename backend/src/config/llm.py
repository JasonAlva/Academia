from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama  # Chat completion - supports tools
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=1.0, 
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# Chat completion for tool calling and agents
# llm = ChatOllama(
#     model="mistral",
#     base_url="http://localhost:11434",
#     temperature=0.7,
# )