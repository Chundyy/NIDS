from fastapi import APIRouter, HTTPException
from elastic import es
from models.rule import Rule
from suricata import SuricataManager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
INDEX = "rules"


def _get_next_sid() -> int:
    if not es.indices.exists(index=INDEX):
        return 1000000
    # Contar quantas rules existem
    res = es.count(index=INDEX)
    count = res.get("count", 0)
    return 1000000 + count


@router.get("")
@router.get("/")
def list_rules():
    if not es.indices.exists(index=INDEX):
        return []
    res = es.search(index=INDEX, query={"match_all": {}}, size=200, sort=[{"created_at": {"order": "desc"}}])
    return [{"id": hit["_id"], **hit["_source"]} for hit in res["hits"]["hits"]]


@router.post("")
@router.post("/")
def create_rule(rule: Rule):
    print(f"🔵 CREATE RULE REQUEST: {rule.model_dump()}")
    doc = rule.model_dump(exclude={"id"})
    if doc.get("sid") is None:
        doc["sid"] = _get_next_sid()
    
    print(f"🔵 Enviando rule para Suricata: {doc}")
    # Enviar para o Suricata
    suricata_sent = SuricataManager.send_rule_to_suricata(doc)
    print(f"🔵 Suricata sync result: {suricata_sent}")
    
    if suricata_sent:
        doc["synced_to_suricata"] = True
    
    res = es.index(index=INDEX, document=doc)
    return {"id": res["_id"], **doc}


@router.put("/{rule_id}")
def update_rule(rule_id: str, rule: Rule):
    if not es.exists(index=INDEX, id=rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    
    doc = rule.model_dump(exclude={"id"})
    
    # Se a rule já estava sincronizada com Suricata, reenviar
    existing = es.get(index=INDEX, id=rule_id)
    if existing["_source"].get("synced_to_suricata"):
        suricata_sent = SuricataManager.send_rule_to_suricata(doc)
        doc["synced_to_suricata"] = suricata_sent
    
    es.update(index=INDEX, id=rule_id, doc={"doc": doc})
    return {"id": rule_id, **doc}


@router.delete("/{rule_id}")
def delete_rule(rule_id: str):
    if not es.exists(index=INDEX, id=rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    
    # Obter a rule antes de deletar para saber se estava sincronizada
    rule_doc = es.get(index=INDEX, id=rule_id)
    rule_source = rule_doc["_source"]
    
    # Se estava sincronizada a Suricata, remover de lá também
    if rule_source.get("synced_to_suricata"):
        SuricataManager.delete_rule_from_suricata(rule_id, rule_source.get("sid"))
    
    es.delete(index=INDEX, id=rule_id)
    return {"status": "deleted", "id": rule_id}


@router.post("/{rule_id}/sync")
def sync_rule_to_suricata(rule_id: str):
    """Endpoint para sincronizar uma rule específica com o Suricata"""
    if not es.exists(index=INDEX, id=rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule_doc = es.get(index=INDEX, id=rule_id)
    rule_source = rule_doc["_source"]
    
    suricata_sent = SuricataManager.send_rule_to_suricata(rule_source)
    
    if suricata_sent:
        es.update(index=INDEX, id=rule_id, doc={"doc": {"synced_to_suricata": True}})
        return {"status": "synced", "id": rule_id}
    else:
        raise HTTPException(status_code=500, detail="Falha ao sincronizar com Suricata")


@router.post("/reload")
def reload_suricata_rules():
    """Endpoint para recarregar as rules no Suricata"""
    success = SuricataManager.reload_rules_on_suricata()
    
    if success:
        return {"status": "reloaded", "message": "Rules recarregadas no Suricata"}
    else:
        raise HTTPException(status_code=500, detail="Falha ao recarregar rules no Suricata")