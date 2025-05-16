# Foodlytics API Server

This is the backend server for the Foodlytics application built with FastAPI and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL:

   - Create a new database named 'foodlytics'
   - Create a user with appropriate permissions
   - Update the .env file with your database credentials

4. Create a `.env` file in the server directory with the following content:

```
DATABASE_URL=postgresql://username:password@localhost:5432/foodlytics
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Initialize the database:

```bash
# Create database tables
python init_db.py

# Set up database migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Running the Server

To run the development server:

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative API docs (ReDoc): `http://localhost:8000/redoc`

## Available Endpoints

- `POST /register`: Register a new user
- `POST /token`: Login and get access token
- `GET /users/me`: Get current user info (protected route)
- `GET /`: Welcome message
- `GET /health`: Health check endpoint

## Database Migrations

To create a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:

```bash
alembic upgrade head
```

To rollback migrations:

```bash
alembic downgrade -1  # Roll back one migration
```
