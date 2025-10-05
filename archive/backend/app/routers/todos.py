from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db
import math

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("/", response_model=schemas.Todo)
def create_todo(
    todo: schemas.TodoCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_todo = models.Todo(**todo.dict(), user_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.get("/", response_model=schemas.TodoListResponse)
def read_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[schemas.TaskStatus] = None,
    priority: Optional[schemas.Priority] = None,
    search: Optional[str] = None,
    overdue_only: bool = False,
    type: Optional[schemas.ItemType] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Todo).filter(models.Todo.user_id == current_user.id)

    if status:
        query = query.filter(models.Todo.status == status)

    if priority:
        query = query.filter(models.Todo.priority == priority)

    if type:
        query = query.filter(models.Todo.type == type)

    if search:
        search_filter = or_(
            models.Todo.title.contains(search),
            models.Todo.description.contains(search),
            models.Todo.tags.contains(search),
            models.Todo.content.contains(search)
        )
        query = query.filter(search_filter)

    if overdue_only:
        query = query.filter(
            and_(
                models.Todo.due_date < datetime.utcnow(),
                models.Todo.status != schemas.TaskStatus.DONE
            )
        )

    total = query.count()
    todos = query.order_by(models.Todo.created_at.desc()).offset(skip).limit(limit).all()

    total_pages = math.ceil(total / limit) if total > 0 else 1
    page = (skip // limit) + 1

    return schemas.TodoListResponse(
        todos=todos,
        total=total,
        page=page,
        per_page=limit,
        total_pages=total_pages
    )

@router.get("/stats", response_model=schemas.TodoStats)
def get_todo_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    base_query = db.query(models.Todo).filter(models.Todo.user_id == current_user.id)

    total = base_query.count()
    todo_count = base_query.filter(models.Todo.status == schemas.TaskStatus.TODO).count()
    doing_count = base_query.filter(models.Todo.status == schemas.TaskStatus.DOING).count()
    done_count = base_query.filter(models.Todo.status == schemas.TaskStatus.DONE).count()

    overdue_count = base_query.filter(
        and_(
            models.Todo.due_date < datetime.utcnow(),
            models.Todo.status != schemas.TaskStatus.DONE
        )
    ).count()

    return schemas.TodoStats(
        total=total,
        todo_count=todo_count,
        doing_count=doing_count,
        done_count=done_count,
        overdue_count=overdue_count
    )

@router.get("/{todo_id}", response_model=schemas.Todo)
def read_todo(
    todo_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=schemas.Todo)
def update_todo(
    todo_id: int,
    todo_update: schemas.TodoUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    update_data = todo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted successfully"}