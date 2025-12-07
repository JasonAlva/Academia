from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    # bcrypt supports max 72 bytes → truncate
    password = password.encode("utf-8")[:72].decode("utf-8")
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    plain = plain.encode("utf-8")[:72].decode("utf-8")
    return pwd_context.verify(plain, hashed)
