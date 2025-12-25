# Docker Setup for LuxuriousOnly

This repository includes Docker configuration for both development and production environments.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM

## Quick Start

### Development Environment

To run the application in development mode with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will start:
- PostgreSQL database on port `5432`
- Backend (Medusa.js) on port `9000`
- Frontend (Next.js) on port `8000`

### Production Environment

To build and run the production containers:

```bash
docker-compose up --build
```

## Environment Variables

Create a `.env` file in the root directory or set environment variables before running:

```env
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
```

## Database Setup

On first run, you'll need to run database migrations and seed data:

```bash
# For development
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# For production
docker-compose exec backend npm run seed
```

## Useful Commands

### View logs
```bash
docker-compose logs -f [service_name]
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clears database)
```bash
docker-compose down -v
```

### Rebuild a specific service
```bash
docker-compose build [service_name]
docker-compose up [service_name]
```

### Access container shell
```bash
docker-compose exec [service_name] sh
```

## Services

- **postgres**: PostgreSQL 15 database
- **backend**: Medusa.js backend API
- **frontend**: Next.js frontend application

## Ports

- `5432`: PostgreSQL
- `9000`: Backend API
- `8000`: Frontend application

## Volumes

- `postgres_data`: Persistent database storage
- `backend_uploads`: Backend file uploads storage

