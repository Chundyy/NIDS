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
    
    # Campos para regras Suricata
    action: str = "alert"  # alert, pass, drop
    protocol: str = "tcp"  # tcp, udp, icmp, ip
    source_ip: str = "any"
    source_port: str = "any"
    direction: str = "->"  # -> ou <>
    destination_ip: str = "any"
    destination_port: str = "any"
    message: Optional[str] = None  # Mensagem da regra (msg)
    
    last_triggered: Optional[str] = None
    synced_to_suricata: bool = False  # Se foi enviada para o Suricata
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())