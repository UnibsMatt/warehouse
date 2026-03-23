from typing import Optional

from pydantic import BaseModel, EmailStr


class ClientBase(BaseModel):
    name: str
    surname: str
    email: EmailStr
    partita_iva: Optional[str] = None
    azienda: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    partita_iva: Optional[str] = None
    azienda: Optional[str] = None


class ClientResponse(ClientBase):
    id: int

    model_config = {"from_attributes": True}
