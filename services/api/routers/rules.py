from fastapi import APIRouter, HTTPException
from elastic import es
from models.rule import Rule


router = APIRouter()
INDEX = "rules"


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
    doc = rule.model_dump(exclude={"id"})
    res = es.index(index=INDEX, document=doc)
    return {"id": res["_id"], **doc}


@router.put("/{rule_id}")
def update_rule(rule_id: str, rule: Rule):
    if not es.exists(index=INDEX, id=rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    doc = rule.model_dump(exclude={"id"})
    es.update(index=INDEX, id=rule_id, doc=doc)
    return {"id": rule_id, **doc}


@router.delete("/{rule_id}")
def delete_rule(rule_id: str):
    if not es.exists(index=INDEX, id=rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    es.delete(index=INDEX, id=rule_id)
    return {"status": "deleted", "id": rule_id}