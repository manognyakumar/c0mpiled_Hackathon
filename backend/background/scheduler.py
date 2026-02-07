"""
APScheduler setup for background job scheduling
"""
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()


def start_background_jobs():
    """Start all background jobs"""
    if not scheduler.running:
        scheduler.start()


def shutdown_background_jobs():
    """Shutdown background jobs"""
    if scheduler.running:
        scheduler.shutdown()


def add_job(func, trigger: str, **kwargs):
    """Add a job to the scheduler"""
    scheduler.add_job(func, trigger, **kwargs)
