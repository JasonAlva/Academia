from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.api.dependencies import get_current_user
from src.models.schemas import UserResponse
from src.config.database import prisma
from src.utils.encryption import encrypt_api_key, decrypt_api_key

router = APIRouter()


# ── Pydantic models ────────────────────────────────────────────────────────


class ApiKeySet(BaseModel):
    api_key: str


class ApiKeyStatus(BaseModel):
    has_key: bool
    hint: Optional[str] = None   # e.g. first/last 4 chars so the user knows which key is saved


# ── Endpoints ──────────────────────────────────────────────────────────────


@router.get("", response_model=ApiKeyStatus)
async def get_api_key_status(current_user: UserResponse = Depends(get_current_user)):
    """Return whether the current user has a personal API key saved (never returns the raw key)."""
    user = await prisma.user.find_unique(where={"id": current_user.id})
    if not user or not user.encryptedApiKey:
        return ApiKeyStatus(has_key=False)

    try:
        raw = decrypt_api_key(user.encryptedApiKey)
        hint = f"{raw[:4]}...{raw[-4:]}" if len(raw) >= 8 else "****"
    except Exception:
        hint = "****"

    return ApiKeyStatus(has_key=True, hint=hint)


@router.post("", response_model=ApiKeyStatus)
async def save_api_key(
    body: ApiKeySet,
    current_user: UserResponse = Depends(get_current_user),
):
    """Save or replace the user's personal Google API key (stored encrypted)."""
    if not body.api_key.strip():
        raise HTTPException(status_code=422, detail="API key cannot be empty.")

    encrypted = encrypt_api_key(body.api_key.strip())

    await prisma.user.update(
        where={"id": current_user.id},
        data={"encryptedApiKey": encrypted},
    )

    raw = body.api_key.strip()
    hint = f"{raw[:4]}...{raw[-4:]}" if len(raw) >= 8 else "****"
    return ApiKeyStatus(has_key=True, hint=hint)


@router.delete("", response_model=ApiKeyStatus)
async def delete_api_key(current_user: UserResponse = Depends(get_current_user)):
    """Remove the user's stored personal API key."""
    await prisma.user.update(
        where={"id": current_user.id},
        data={"encryptedApiKey": None},
    )
    return ApiKeyStatus(has_key=False)
