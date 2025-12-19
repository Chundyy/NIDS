from fastapi import APIRouter, Query
from models.alert import Alert
from elastic import es

router = APIRouter()

INDEX = "alerts"

@router.get("")
@router.get("/")
def list_alerts(
    limit: int = Query(50, ge=1, le=500),
    severity: str | None = None,
    source_ip: str | None = None,
    destination_ip: str | None = None,
):
    must = []
    if severity:
        must.append({"term": {"severity": severity}})
    if source_ip:
        must.append({"term": {"source_ip": source_ip}})
    if destination_ip:
        must.append({"term": {"destination_ip": destination_ip}})

    query = {"match_all": {}} if not must else {"bool": {"must": must}}

    res = es.search(
        index=INDEX,
        query=query,
        size=limit,
        sort=[{"timestamp": {"order": "desc"}}]
    )
    return [hit["_source"] for hit in res["hits"]["hits"]]


@router.post("")
@router.post("/")
def create_alert(alert: Alert):
    doc = alert.model_dump()
    res = es.index(index=INDEX, document=doc)
    return {"result": "created", "id": res["_id"]}


@router.get("/stats")
def alerts_stats():
    # KPIs e agregações para dashboard
    body = {
        "size": 0,
        "aggs": {
            "by_severity": {"terms": {"field": "severity"}},
            "top_source_ips": {"terms": {"field": "source_ip", "size": 5}},
            "top_destination_ips": {"terms": {"field": "destination_ip", "size": 5}}
        }
    }
    res = es.search(index=INDEX, body=body)

    sev = {b["key"]: b["doc_count"] for b in res["aggregations"]["by_severity"]["buckets"]}
    top_src = [{"ip": b["key"], "count": b["doc_count"]} for b in res["aggregations"]["top_source_ips"]["buckets"]]
    top_dst = [{"ip": b["key"], "count": b["doc_count"]} for b in res["aggregations"]["top_destination_ips"]["buckets"]]

    return {
        "total_alerts": res["hits"]["total"]["value"],
        "by_severity": sev,
        "top_source_ips": top_src,
        "top_destination_ips": top_dst,
    }

@router.get("/search")
def search_alerts(
    q: str,
    limit: int = Query(50, ge=1, le=500)
):
    res = es.search(
        index=INDEX,
        size=limit,
        query={
            "bool": {
                "should": [
                    {"match": {"description": q}},
                    {"match": {"category": q}},
                    {"term": {"severity": q.upper()}}
                ]
            }
        },
        sort=[{"timestamp": {"order": "desc"}}]
    )
    return [hit["_source"] for hit in res["hits"]["hits"]]


@router.delete("/clear")
def clear_alerts():
    if not es.indices.exists(index=INDEX):
        return {"status": "index_not_found"}

    es.delete_by_query(
        index=INDEX,
        body={"query": {"match_all": {}}}
    )
    return {"status": "all alerts deleted"}

@router.get("/search/ip")
def search_by_ip(ip: str):
    res = es.search(
        index=INDEX,
        query={
            "bool": {
                "should": [
                    {"term": {"source_ip": ip}},
                    {"term": {"destination_ip": ip}}
                ]
            }
        }
    )
    return [hit["_source"] for hit in res["hits"]["hits"]]
