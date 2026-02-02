from fastapi import APIRouter, Query, Request
from models.alert import Alert
from elastic import es
import psycopg2
import os
from ml.engine import IDSPredictor

router = APIRouter()

INDEX = "alerts"

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ids:ids123@postgres:5432/idsdb")

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
def create_alert(alert: Alert, request: Request):
    # 1. Converter o objeto Pydantic em dicionário
    doc = alert.model_dump()
    print(f"DEBUG DATA: {doc}")

    # 2. Obter o motor de ML (Hugging Face / DistilBERT)
    ml_engine = request.app.state.ml_engine
    ml_severity = 1 # Valor padrão (Benigno)

    if ml_engine is not None:
        try:
            # IMPORTANTE: Passamos o 'doc' INTEIRO ou pelo menos a descrição.
            # O DistilBERT precisa da "description" e "category" para decidir.
            ml_severity = ml_engine.predict_severity(doc)
            print(f"DEBUG ML: IA classificou como -> {ml_severity}")
        except Exception as e:
            print(f"Erro ao processar ML: {e}")

    # 3. Adicionar o resultado da IA ao documento
    doc["ml_predicted_severity"] = ml_severity
    
    # --- Elasticsearch ---
    try:
        # Indexamos o documento já com a predição da IA
        res = es.index(index=INDEX, document=doc)
        es_id = res["_id"]
    except Exception as e:
        print(f"Erro ES: {e}")
        es_id = "error"

    # --- Postgres ---
    try:
        # Usamos os teus dados de conexão (DATABASE_URL=postgresql://ids:ids123@postgres:5432/idsdb)
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Inserimos a severidade calculada pela IA na coluna 'severidade_ml'
        cur.execute("""
            INSERT INTO eventos_rede (src_ip, dest_ip, porta_destino, protocolo, severidade_ml, descricao)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            doc.get("source_ip"), 
            doc.get("destination_ip"), 
            doc.get("destination_port", 0), 
            doc.get("protocol", "UNKNOWN"), 
            ml_severity,
            doc.get("description", "No description")
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Erro Postgres: {e}")

    return {"result": "created", "id": es_id, "ml_severity": ml_severity}

@router.get("/stats")
@router.get("/stats/")
def alerts_stats():
    # KPIs e agregações para dashboard
    try:
        res = es.search(
            index=INDEX,
            size=0,
            aggs={
                "by_severity": {"terms": {"field": "severity.keyword", "size": 10}},
                "top_source_ips": {"terms": {"field": "source_ip.keyword", "size": 5}},
                "top_destination_ips": {"terms": {"field": "destination_ip.keyword", "size": 5}}
            }
        )

        sev = {b["key"]: b["doc_count"] for b in res["aggregations"]["by_severity"]["buckets"]}
        top_src = [{"ip": b["key"], "count": b["doc_count"]} for b in res["aggregations"]["top_source_ips"]["buckets"]]
        top_dst = [{"ip": b["key"], "count": b["doc_count"]} for b in res["aggregations"]["top_destination_ips"]["buckets"]]

        return {
            "total_alerts": res["hits"]["total"]["value"],
            "by_severity": sev,
            "top_source_ips": top_src,
            "top_destination_ips": top_dst,
        }
    except Exception as e:
        print(f"Error in alerts_stats: {e}")
        return {
            "total_alerts": 0,
            "by_severity": {},
            "top_source_ips": [],
            "top_destination_ips": [],
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
