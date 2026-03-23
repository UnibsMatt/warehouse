import math
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import get_admin_user, get_current_user, get_db
from app.models.client import Client
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, PaginatedOrderResponse

router = APIRouter()


def _get_client_id_for_user(user: User, db: Session) -> Optional[int]:
    """Return the client_id linked to this user, or None if not a client user."""
    client = db.execute(
        select(Client).where(Client.user_id == user.id)
    ).scalar_one_or_none()
    return client.id if client else None


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> OrderResponse:
    # If this user is linked to a client, force client_id to their own
    linked_client_id = _get_client_id_for_user(current_user, db)
    if linked_client_id is not None:
        effective_client_id = linked_client_id
    else:
        effective_client_id = order_in.client_id

    # Validate all products exist and have sufficient stock
    product_ids = [item.product_id for item in order_in.items]
    products = {
        p.id: p
        for p in db.execute(select(Product).where(Product.id.in_(product_ids))).scalars().all()
    }

    for item in order_in.items:
        if item.product_id not in products:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found",
            )
        product = products[item.product_id]
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. "
                       f"Available: {product.quantity}, requested: {item.quantity}",
            )

    # Create order
    order = Order(client_id=effective_client_id, status=OrderStatus.pending)
    db.add(order)
    db.flush()

    # Create order items and deduct stock
    for item_data in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
        )
        db.add(order_item)
        products[item_data.product_id].quantity -= item_data.quantity

    db.flush()

    # Reload with relationships
    order = db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    ).scalar_one()
    return order


@router.get("/", response_model=List[OrderResponse])
def get_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> List[OrderResponse]:
    query = (
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
    )

    # Filter to this client's orders if the user is a client
    linked_client_id = _get_client_id_for_user(current_user, db)
    if linked_client_id is not None:
        query = query.where(Order.client_id == linked_client_id)

    orders = db.execute(query).scalars().all()
    return list(orders)


@router.get("/pending", response_model=List[OrderResponse])
def get_pending_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_admin_user)],
) -> List[OrderResponse]:
    orders = db.execute(
        select(Order)
        .where(Order.status == OrderStatus.pending)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
    ).scalars().all()
    return list(orders)


@router.get("/history", response_model=PaginatedOrderResponse)
def get_order_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = 1,
    page_size: int = 20,
) -> PaginatedOrderResponse:
    query = (
        select(Order)
        .where(Order.status == OrderStatus.completed)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    )

    linked_client_id = _get_client_id_for_user(current_user, db)
    if linked_client_id is not None:
        query = query.where(Order.client_id == linked_client_id)

    from sqlalchemy import func
    count_query = select(func.count()).select_from(Order).where(Order.status == OrderStatus.completed)
    if linked_client_id is not None:
        count_query = count_query.where(Order.client_id == linked_client_id)
    total = db.execute(count_query).scalar_one()

    offset = (page - 1) * page_size
    orders = db.execute(
        query.order_by(Order.created_at.desc()).offset(offset).limit(page_size)
    ).scalars().all()

    return PaginatedOrderResponse(
        orders=list(orders),
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> OrderResponse:
    order = db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    ).scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Client users can only view their own orders
    linked_client_id = _get_client_id_for_user(current_user, db)
    if linked_client_id is not None and order.client_id != linked_client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order",
        )

    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_admin_user)],
) -> OrderResponse:
    order = db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    ).scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order.status = status_update.status
    db.flush()
    db.refresh(order)

    order = db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.client),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    ).scalar_one()
    return order
