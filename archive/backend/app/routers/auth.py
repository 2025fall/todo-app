from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"=== REGISTRATION ATTEMPT ===")
    print(f"Username: '{user.username}'")
    print(f"Email: '{user.email}'")
    print(f"Password length: {len(user.password)}")

    # 检查用户名是否已存在
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        print(f"[ERROR] Username '{user.username}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # 检查邮箱是否已存在
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        print(f"[ERROR] Email '{user.email}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    try:
        hashed_password = auth.get_password_hash(user.password)
        print(f"[OK] Password hashed successfully")

        db_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        print(f"[OK] User '{user.username}' registered successfully with ID: {db_user.id}")
        return db_user

    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    print(f"Login attempt for username: {user_credentials.username}")
    user = auth.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        print(f"Authentication failed for user: {user_credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"Authentication successful, creating token for: {user.username}")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    print(f"Token created: {access_token[:50]}...")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    print(f"=== /auth/me ENDPOINT CALLED ===")
    print(f"Current user: {current_user.username} (ID: {current_user.id})")
    print(f"=== RETURNING USER DATA ===")
    return current_user