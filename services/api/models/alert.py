from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class Alert(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    severity: str
    source_ip: str
    destination_ip: str
    description: str
    category: Optional[str] = None
    destination_port: int = 0
    payload_len: int = 0
    protocol: str = "TCP"
