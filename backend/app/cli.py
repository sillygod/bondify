"""Bondify CLI entry point.

Provides command-line interface for managing the Bondify application.
"""

import os
from pathlib import Path
from typing import Optional

import typer
import uvicorn
from typing_extensions import Annotated

app = typer.Typer(
    name="bondify",
    help="Bondify - English Learning Application with AI",
    add_completion=False,
)


def version_callback(value: bool):
    """Show version and exit."""
    if value:
        typer.echo("Bondify version: 1.0.0")
        raise typer.Exit()


@app.callback()
def main(
    version: Annotated[
        Optional[bool],
        typer.Option("--version", "-v", callback=version_callback, is_eager=True),
    ] = None,
):
    """Bondify - English Learning Application with AI."""
    pass


def _run_migrations():
    """Run database migrations to head, or initialize DB if alembic not available."""
    from alembic.config import Config
    from alembic import command
    
    # Try dev mode path first: backend/alembic.ini + backend/alembic/
    backend_dir = Path(__file__).parent.parent
    alembic_ini = backend_dir / "alembic.ini"
    script_location = backend_dir / "alembic"
    
    # Try pip-installed path: app/alembic.ini + app/migrations/
    if not alembic_ini.exists():
        app_dir = Path(__file__).parent
        alembic_ini = app_dir / "alembic.ini"
        script_location = app_dir / "migrations"
    
    if not alembic_ini.exists():
        # No alembic at all - fallback to init_db
        typer.echo("   Using init_db (alembic not available)")
        try:
            import asyncio
            from app.database import init_db
            asyncio.run(init_db())
            return True
        except Exception as e:
            typer.echo(f"❌ Database init failed: {e}", err=True)
            return False
    
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("script_location", str(script_location))
    
    try:
        command.upgrade(alembic_cfg, "head")
        return True
    except Exception as e:
        typer.echo(f"❌ Migration failed: {e}", err=True)
        return False


@app.command()
def serve(
    host: Annotated[str, typer.Option(help="Host to bind to")] = "127.0.0.1",
    port: Annotated[int, typer.Option(help="Port to bind to")] = 8000,
    workers: Annotated[int, typer.Option(help="Number of worker processes")] = 1,
    auto_migrate: Annotated[bool, typer.Option("--auto-migrate", help="Run database migrations before starting")] = True,
):
    """Start the Bondify server in production mode."""
    if auto_migrate:
        typer.echo("📦 Running database migrations...")
        if _run_migrations():
            typer.echo("✅ Migrations completed!")
        else:
            typer.echo("⚠️  Migration skipped or failed, continuing anyway...")
    
    typer.echo(f"🚀 Starting Bondify server on http://{host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=workers,
    )


@app.command()
def dev(
    host: Annotated[str, typer.Option(help="Host to bind to")] = "127.0.0.1",
    port: Annotated[int, typer.Option(help="Port to bind to")] = 8000,
    reload: Annotated[bool, typer.Option(help="Enable auto-reload")] = True,
    auto_migrate: Annotated[bool, typer.Option("--auto-migrate", help="Run database migrations before starting")] = True,
):
    """Start the Bondify server in development mode with hot reload."""
    if auto_migrate:
        typer.echo("📦 Running database migrations...")
        if _run_migrations():
            typer.echo("✅ Migrations completed!")
        else:
            typer.echo("⚠️  Migration skipped or failed, continuing anyway...")
    
    typer.echo(f"🔧 Starting Bondify in dev mode on http://{host}:{port}")
    typer.echo("   Hot reload enabled" if reload else "   Hot reload disabled")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
    )


@app.command()
def migrate(
    revision: Annotated[str, typer.Argument(help="Target revision")] = "head",
):
    """Run database migrations to upgrade the schema."""
    from alembic.config import Config
    from alembic import command
    
    typer.echo(f"📦 Running database migrations to '{revision}'...")
    
    # Find alembic.ini relative to this file
    backend_dir = Path(__file__).parent.parent
    alembic_ini = backend_dir / "alembic.ini"
    
    if not alembic_ini.exists():
        typer.echo(f"❌ Error: alembic.ini not found at {alembic_ini}", err=True)
        raise typer.Exit(1)
    
    alembic_cfg = Config(str(alembic_ini))
    # Set script location relative to alembic.ini
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    
    command.upgrade(alembic_cfg, revision)
    typer.echo("✅ Migrations completed successfully!")


@app.command("migrate-down")
def migrate_down(
    revision: Annotated[str, typer.Argument(help="Target revision")] = "-1",
):
    """Rollback database migrations."""
    from alembic.config import Config
    from alembic import command
    
    typer.echo(f"⏪ Rolling back migrations to '{revision}'...")
    
    backend_dir = Path(__file__).parent.parent
    alembic_ini = backend_dir / "alembic.ini"
    
    if not alembic_ini.exists():
        typer.echo(f"❌ Error: alembic.ini not found at {alembic_ini}", err=True)
        raise typer.Exit(1)
    
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    
    command.downgrade(alembic_cfg, revision)
    typer.echo("✅ Rollback completed successfully!")


@app.command("db-init")
def db_init():
    """Initialize the database with all tables."""
    import asyncio
    from app.database import init_db
    
    typer.echo("🗄️  Initializing database...")
    asyncio.run(init_db())
    typer.echo("✅ Database initialized successfully!")


if __name__ == "__main__":
    app()
