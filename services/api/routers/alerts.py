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
    
    # 2. Obter o motor de ML
    ml_engine = request.app.state.ml_engine
    ml_severity = 1 # Valor numérico padrão
    ml_confidence = 0.0

    if ml_engine is not None:
        try:
            # A IA avalia o documento e devolve 1, 2, 3 ou 4
            ml_severity, ml_confidence = ml_engine.predict_severity(doc)
            print(f"DEBUG ML: IA classificou como -> {ml_severity} (Confiança: {ml_confidence}%")
        except Exception as e:
            print(f"Erro ao processar ML: {e}")
            ml_severity = 1
            ml_confidence = 0.0

    # --- MAPEAMENTO PARA A DASHBOARD (CORES) ---
    severity_map = {
        1: "LOW",
        2: "MEDIUM",
        3: "HIGH",
        4: "CRITICAL"
    }
    
    # Criamos a string correspondente ao número (ex: 4 -> "CRITICAL")
    ml_severity_text = severity_map.get(ml_severity, "LOW")

    # Atualizamos o campo 'severity' com TEXTO para a UI pintar as cores corretamente
    doc["severity"] = ml_severity_text
    # Guardamos o número noutro campo para referência técnica
    doc["ml_predicted_severity"] = ml_severity
    
    doc["ml_confidence"] = ml_confidence 
    
    # 3. --- Elasticsearch ---
    try:
        # Agora o ES recebe "CRITICAL" no campo severity
        res = es.index(index=INDEX, document=doc)
        es_id = res["_id"]
        print(f"ES OK: Alerta indexado com ID {es_id} e Confiança {ml_confidence}%")
    except Exception as e:
        print(f"Erro ES: {e}")
        es_id = "error"

    # 4. --- Postgres ---
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # No Postgres, guardamos o NÚMERO (ml_severity) na coluna 'severidade_ml'
        descricao_evento = doc.get("description") or doc.get("signature") or doc.get("alerta_assinatura") or "No description"

        cur.execute("""
            INSERT INTO eventos_rede (src_ip, dest_ip, porta_destino, protocolo, severidade_ml, confianca_ml,alerta_assinatura)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            doc.get("source_ip"), 
            doc.get("destination_ip"), 
            doc.get("destination_port", 0), 
            doc.get("protocol", "UNKNOWN"), 
            ml_severity, # Valor numérico (1-4)
            ml_confidence,
            descricao_evento
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Erro Postgres: {e}")

    return {"result": "created", "id": es_id, "ml_severity": ml_severity, "status": ml_severity_text, "confidence": f"{ml_confidence}%"}

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
