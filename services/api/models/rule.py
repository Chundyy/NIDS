from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class Rule(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    severity: str
    description: Optional[str] = None
    sid: Optional[int] = None  # Suricata ID
    action: str = "drop"  # Action tipo: drop, alert, etc
    last_triggered: Optional[str] = None
    synced_to_suricata: bool = False  # Se foi enviada para o Suricata
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())