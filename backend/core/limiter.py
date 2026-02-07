"""
Rate Limiting Configuration
Using SlowAPI for production-grade rate limiting
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.config import settings

# ==================================================
# Rate Limiter Configuration
# ==================================================
# We initialize the Limiter using the remote address (IP) as the key.
# In production with a reverse proxy, you might need to adjust 
# key_func to look at X-Forwarded-For headers.

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_default],
    storage_uri="memory://",  # Use Redis in production: "redis://localhost:6379"
)


def get_limiter() -> Limiter:
    """Get the configured rate limiter instance."""
    return limiter
