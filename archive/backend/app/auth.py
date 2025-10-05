from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 修复bcrypt兼容性问题
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # 测试bcrypt是否正常工作
    pwd_context.hash("test")
    print("[OK] Bcrypt initialized successfully")
except Exception as e:
    print(f"[ERROR] Bcrypt initialization error: {e}")
    # 如果bcrypt有问题，使用更兼容的配置
    try:
        pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12,
            bcrypt__ident="2b"
        )
        pwd_context.hash("test")
        print("[OK] Bcrypt initialized with fallback config")
    except Exception as e2:
        print(f"[ERROR] Bcrypt fallback also failed: {e2}")
        # 最后的备用方案：使用pbkdf2_sha256
        pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        print("[OK] Using pbkdf2_sha256 as fallback")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    print(f"Creating token with data: {to_encode}")

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    print(f"Token payload before encoding: {to_encode}")

    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        print(f"[OK] Token created successfully")

        # 立即测试解码
        test_decode = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[OK] Token decode test successful: {test_decode}")

        return encoded_jwt
    except Exception as e:
        print(f"[ERROR] Error creating token: {e}")
        raise

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    print(f"=== TOKEN VERIFICATION START ===")
    token = credentials.credentials
    print(f"Received token: {token[:50]}...")
    print(f"Token length: {len(token)}")

    try:
        print(f"Attempting to decode with SECRET_KEY: {SECRET_KEY}")
        print(f"Algorithm: {ALGORITHM}")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")

        username: str = payload.get("sub")
        print(f"Extracted username: '{username}' (type: {type(username)})")

        if username is None:
            print(f"[ERROR] Token validation failed: no username in token payload: {payload}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials - no username",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_data = schemas.TokenData(username=username)
        print(f"[OK] Token validated successfully for user: '{username}'")
        print(f"=== TOKEN VERIFICATION SUCCESS ===")
        return token_data

    except JWTError as e:
        print(f"[ERROR] JWT decode error: {e}")
        print(f"Token: {token}")
        print(f"Secret key: {SECRET_KEY}")
        print(f"=== TOKEN VERIFICATION FAILED ===")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials - JWT error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"[ERROR] Unexpected error in token verification: {e}")
        print(f"=== TOKEN VERIFICATION ERROR ===")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - unexpected error",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token_data: schemas.TokenData = Depends(verify_token), db: Session = Depends(get_db)):
    print(f"=== GET CURRENT USER START ===")
    print(f"Looking for user with username: '{token_data.username}'")

    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        print(f"[ERROR] User '{token_data.username}' not found in database")

        # 检查数据库中的所有用户
        all_users = db.query(models.User).all()
        print(f"Available users in database:")
        for u in all_users:
            print(f"  - '{u.username}' (id: {u.id})")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"[OK] User found: '{user.username}' (id: {user.id})")
    print(f"=== GET CURRENT USER SUCCESS ===")
    return user

def authenticate_user(db: Session, username: str, password: str):
    print(f"Attempting to authenticate user: {username}")

    # 先尝试精确匹配
    user = db.query(models.User).filter(models.User.username == username).first()

    # 如果精确匹配失败，尝试不区分大小写匹配
    if not user:
        print(f"Exact match failed, trying case-insensitive match...")
        user = db.query(models.User).filter(models.User.username.ilike(username)).first()
        if user:
            print(f"Found user with case-insensitive match: '{user.username}' for input '{username}'")

    if not user:
        print(f"User {username} not found in database (tried both exact and case-insensitive)")
        # 显示数据库中的所有用户名供调试
        all_users = db.query(models.User).all()
        print(f"Available users: {[u.username for u in all_users]}")
        return False

    print(f"User found: {user.username}, checking password...")
    password_valid = verify_password(password, user.hashed_password)
    print(f"Password verification result: {password_valid}")

    if not password_valid:
        return False
    print(f"Authentication successful for user: {user.username}")
    return user