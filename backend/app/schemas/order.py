from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.models.order import OrderStatus
from app.schemas.client import ClientResponse
from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    client_id: int
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    product: ProductResponse

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    client_id: int
    status: OrderStatus
    created_at: datetime
    client: ClientResponse
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class PaginatedOrderResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
