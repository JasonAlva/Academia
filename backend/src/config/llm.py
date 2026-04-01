from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()


def get_llm(api_key: str | None = None) -> ChatGoogleGenerativeAI:
    """
    Factory that returns a ChatGoogleGenerativeAI instance.

    Priority order for the API key:
      1. Explicitly passed api_key (e.g. user's own key from DB)
      2. GOOGLE_API_KEY environment variable (server-level key)

    Raises ValueError if no key is available at all.
    """
    resolved_key = api_key or os.getenv("GOOGLE_API_KEY") or ""
    if not resolved_key:
        raise ValueError(
            "No Google API key available. "
            "Either set GOOGLE_API_KEY in the environment or save your personal "
            "API key in Profile → AI Settings."
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.0,
        google_api_key=resolved_key,
    )


# Backwards-compat alias — used by role_based_agent before the per-user feature.
# Agents should call get_llm(api_key) instead when a user key is available.
try:
    llm = get_llm()
except ValueError:
    # Server started without GOOGLE_API_KEY — llm will be None.
    # Queries will fail gracefully if users have no key saved either.
    llm = None  # type: ignore