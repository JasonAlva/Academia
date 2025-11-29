from passlib.context import CryptContext

pwd=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password:str)->str:
    return pwd.hash(password)

def verify_password(plainPassword:str,hashedPassword:str)->bool:
    return pwd.verify(plainPassword,hashedPassword)

