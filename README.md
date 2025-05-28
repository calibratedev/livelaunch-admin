# LiveLaunch API Server

A Golang backend API server using Echo web framework for the LiveLaunch admin dashboard.

## Features

- **JWT Authentication**: Cookie-based JWT authentication with secure HTTP-only cookies
- **Echo Web Framework**: High-performance HTTP web framework
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Middleware**: Authentication middleware for protected routes
- **Mock Data**: Sample data for development and testing

## Setup

### Prerequisites

- Go 1.23 or higher
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd livelaunch-api
```

2. Install dependencies:
```bash
go mod tidy
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-at-least-32-characters-long
JWT_EXPIRES_IN=168h
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Running the Server

```bash
go run main.go
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics (protected)
- `GET /api/brands` - Get brands list (protected)
- `GET /api/products` - Get products list (protected)

### Health Check

- `GET /health` - Server health check

## Authentication

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

The JWT token is automatically set as an HTTP-only cookie named `auth-token`.

### Default Test Credentials

- **Email:** `admin@example.com`
- **Password:** `password123`

## Project Structure

```
├── config/          # Configuration management
├── handlers/        # HTTP request handlers
├── middleware/      # Custom middleware
├── models/          # Data models and types
├── utils/           # Utility functions
├── main.go          # Application entry point
├── go.mod           # Go module file
└── README.md        # This file
```

## Development

### Adding New Endpoints

1. Define models in `models/` directory
2. Create handlers in `handlers/` directory
3. Add routes in `main.go`
4. Add middleware if needed in `middleware/` directory

### Database Integration

Replace the mock data in `models/user.go` and `handlers/dashboard.go` with your actual database integration.

## Security

- JWT tokens are stored in HTTP-only cookies
- CORS is configured for the frontend URL
- Secure cookie settings in production
- Input validation on all endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret...` |
| `JWT_EXPIRES_IN` | JWT expiration time | `168h` (7 days) |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `ENVIRONMENT` | Environment mode | `development` |

## Frontend Integration

Update your Next.js frontend to point to this API server by updating the `NEXT_PUBLIC_API_URL` environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
