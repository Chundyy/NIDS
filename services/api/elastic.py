from elasticsearch import Elasticsearch
import os

ELASTIC_URL = os.getenv("ES_URL")

es = Elasticsearch(ELASTIC_URL)
