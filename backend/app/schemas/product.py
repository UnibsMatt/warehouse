from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class DiscountTier(BaseModel):
    min_quantity: int = Field(..., ge=1, description="Minimum order quantity to qualify")
    discount_percent: float = Field(..., ge=0, le=100, description="Discount percentage (0–100)")


class ProductBase(BaseModel):
    name: str
    type: str
    quantity: int
    code: str
    price: Decimal = Field(default=Decimal("0.00"), ge=0, description="Unit price")


class ProductCreate(ProductBase):
    discount_tiers: List[DiscountTier] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[int] = None
    code: Optional[str] = None
    price: Optional[Decimal] = None


class ProductDiscountUpdate(BaseModel):
    discount_tiers: List[DiscountTier]


class ProductResponse(ProductBase):
    id: int
    discount_tiers: List[DiscountTier] = Field(default_factory=list)

    model_config = {"from_attributes": True}
