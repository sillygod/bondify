---
description: How to manage database migrations with Alembic
---

# Database Migration Workflow

This project uses Alembic for database schema management with async SQLAlchemy.

## Prerequisites

Ensure you're in the backend directory with the virtual environment activated:
```bash
cd backend
source .venv/bin/activate
```

## Common Commands

### Apply all pending migrations
// turbo
```bash
alembic upgrade head
```

### Check current migration status
// turbo
```bash
alembic current
```

### View migration history
// turbo
```bash
alembic history
```

### Generate a new migration after model changes
```bash
alembic revision --autogenerate -m "description_of_changes"
```

### Rollback last migration
```bash
alembic downgrade -1
```

### Rollback to a specific revision
```bash
alembic downgrade <revision_id>
```

## Workflow for Schema Changes

1. **Modify your SQLAlchemy models** in `app/models/`
2. **Generate migration**: `alembic revision --autogenerate -m "add_new_field"`
3. **Review the generated migration** in `alembic/versions/`
4. **Apply migration**: `alembic upgrade head`
5. **Test the application** to ensure everything works

## Important Notes

- Always review auto-generated migrations before applying
- The `render_as_batch=True` option is enabled for SQLite ALTER TABLE support
- Database URL is loaded from `app.config.settings.DATABASE_URL`
