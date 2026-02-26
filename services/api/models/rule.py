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
    protocol: str = "tcp"  # tcp, udp, icmp, ip, dns, http
    source_ip: str = "any"
    source_port: str = "any"
    direction: str = "->"  # -> ou <>
    destination_ip: str = "any"
    destination_port: str = "any"
    message: Optional[str] = None  # Mensagem da regra (msg)
    
    # Opções adicionais do Suricata
    content: Optional[str] = None  # Conteúdo a procurar (ex: "example.com")
    nocase: bool = False  # Case insensitive
    dns_query: bool = False  # Para regras DNS
    http_uri: bool = False  # Para regras HTTP URI
    http_method: bool = False  # Para regras HTTP Method
    rule_options: Optional[str] = None  # Opções customizadas adicionais
    
    last_triggered: Optional[str] = None
    synced_to_suricata: bool = False  # Se foi enviada para o Suricata
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())