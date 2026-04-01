"""
Symmetric encryption helpers for storing user API keys.

Fernet (AES-128-CBC + HMAC-SHA256) is used. The encryption key is derived
from the app SECRET_KEY so no extra environment variable is required.
"""
import base64
import hashlib
import os

from cryptography.fernet import Fernet


def _fernet() -> Fernet:
    """
    Build a Fernet instance from the SECRET_KEY environment variable.
    Fernet requires a 32-byte URL-safe base64-encoded key, so we SHA-256 hash
    the secret and base64-encode it.
    """
    secret = os.getenv("SECRET_KEY", "changeme-in-production")
    raw_key = hashlib.sha256(secret.encode()).digest()          # 32 bytes
    fernet_key = base64.urlsafe_b64encode(raw_key)             # URL-safe b64
    return Fernet(fernet_key)


def encrypt_api_key(plaintext: str) -> str:
    """Encrypt a plaintext API key and return a base64-encoded ciphertext string."""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_api_key(ciphertext: str) -> str:
    """Decrypt a previously encrypted API key back to plaintext."""
    return _fernet().decrypt(ciphertext.encode()).decode()
