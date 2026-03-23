from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.product import Product
from app.models.order import Order, OrderItem  # noqa: F401


def seed_database() -> None:
    engine = create_engine(settings.DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

    with SessionLocal() as session:
        # Check if already seeded
        existing_user = session.execute(select(User).limit(1)).scalar_one_or_none()

        if existing_user:
            print("Database already seeded, skipping...")
            return

        print("Seeding users...")
        admin_user = User(
            email="admin@warehouse.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
            is_active=True,
        )
        session.add(admin_user)

        # Client users — each will be linked to a Client record below
        client_user1 = User(
            email="marco.rossi@tecnoitalia.it",
            hashed_password=get_password_hash("client123"),
            role=UserRole.user,
            is_active=True,
        )
        client_user2 = User(
            email="giulia.ferrari@innovagroup.it",
            hashed_password=get_password_hash("client123"),
            role=UserRole.user,
            is_active=True,
        )
        session.add(client_user1)
        session.add(client_user2)
        session.flush()  # get IDs before commit

        print("Seeding clients...")
        client1 = Client(
            name="Marco",
            surname="Rossi",
            email="marco.rossi@tecnoitalia.it",
            partita_iva="IT12345678901",
            azienda="TecnoItalia S.r.l.",
            user_id=client_user1.id,
        )
        client2 = Client(
            name="Giulia",
            surname="Ferrari",
            email="giulia.ferrari@innovagroup.it",
            partita_iva="IT98765432109",
            azienda="Innova Group S.p.A.",
            user_id=client_user2.id,
        )
        session.add(client1)
        session.add(client2)

        print("Seeding products...")
        products = [
            Product(
                name="Laptop Dell XPS 15",
                type="Elettronica",
                quantity=25,
                code="DELL-XPS-15",
                price=1299.00,
                discount_tiers=[
                    {"min_quantity": 5,  "discount_percent": 5.0},
                    {"min_quantity": 10, "discount_percent": 10.0},
                ],
            ),
            Product(
                name="Monitor LG 27\" 4K",
                type="Elettronica",
                quantity=40,
                code="LG-MON-27-4K",
                price=449.00,
                discount_tiers=[
                    {"min_quantity": 5,  "discount_percent": 5.0},
                    {"min_quantity": 20, "discount_percent": 12.0},
                ],
            ),
            Product(
                name="Tastiera Meccanica Logitech",
                type="Elettronica",
                quantity=60,
                code="LOG-KB-MX",
                price=129.00,
                discount_tiers=[
                    {"min_quantity": 10, "discount_percent": 8.0},
                    {"min_quantity": 30, "discount_percent": 15.0},
                ],
            ),
            Product(
                name="Scrivania Ergonomica Standing Desk",
                type="Arredamento",
                quantity=15,
                code="DESK-STAND-01",
                price=599.00,
                discount_tiers=[
                    {"min_quantity": 3, "discount_percent": 7.0},
                ],
            ),
            Product(
                name="Sedia Ufficio Herman Miller Aeron",
                type="Arredamento",
                quantity=20,
                code="CHAIR-HM-AERON",
                price=1450.00,
                discount_tiers=[
                    {"min_quantity": 2,  "discount_percent": 5.0},
                    {"min_quantity": 5,  "discount_percent": 10.0},
                    {"min_quantity": 10, "discount_percent": 15.0},
                ],
            ),
        ]
        for product in products:
            session.add(product)

        session.commit()
        print("Database seeded successfully!")

    engine.dispose()


if __name__ == "__main__":
    seed_database()
