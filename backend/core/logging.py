"""
Structured Logging Configuration
Production-grade logging with context binding
"""
import logging
import sys
from contextvars import ContextVar
from typing import Any, Dict, Optional

import structlog
from structlog.types import EventDict, Processor

from core.config import settings

# Context variables for request-scoped logging
_context: ContextVar[Dict[str, Any]] = ContextVar("logging_context", default={})


def bind_context(**kwargs: Any) -> None:
    """Bind context variables for structured logging."""
    ctx = _context.get().copy()
    ctx.update(kwargs)
    _context.set(ctx)


def clear_context() -> None:
    """Clear logging context (call at end of request)."""
    _context.set({})


def get_context() -> Dict[str, Any]:
    """Get current logging context."""
    return _context.get()


def add_context_processor(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    """Add request context to all log entries."""
    context = _context.get()
    if context:
        event_dict.update(context)
    return event_dict


def configure_logging() -> None:
    """Configure structured logging for the application."""
    
    # Determine processors based on environment
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        add_context_processor,
    ]
    
    if settings.log_format == "json":
        # JSON format for production (machine-readable)
        final_processors: list[Processor] = [
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Console format for development (human-readable)
        final_processors = [
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    
    structlog.configure(
        processors=shared_processors + final_processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str = "app") -> structlog.stdlib.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)


# Initialize on import
configure_logging()

# Default logger
logger = get_logger()
