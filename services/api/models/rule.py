from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class Rule(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    severity: str
    description: Optional[str] = None
    enabled: bool = True
    last_triggered: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())