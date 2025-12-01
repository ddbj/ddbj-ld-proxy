# server.py — FastMCP版
import os
import json
import logging
from typing import Dict, Any
import requests
from fastmcp import FastMCP
from simple_query_generator import SimpleQueryGenerator

# ---- logging (元コード準拠) ----
logging.basicConfig(
    filename=os.getenv("LOG_FILE", "/app/logs/server.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# ---- settings ----
# 例: export ES_URL="http://192.168.11.20:9200/genome_anex/_search"
ES_URL = os.getenv("ES_URL", "http://192.168.11.20:9200/genome_anex/_search")

app = FastMCP("genome-anex-mcp")  # MCPサーバー名は任意

@app.tool(
    "search_query",
    description="受け取った key:value の辞書から Elasticsearch の query DSL を生成します。"
)
def tool_search_query(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    args: { "field1": "value1", "field2": "value2", ... }
    return: Elasticsearch Query DSL (dict)
    """
    logging.info(f"search_query args: {args}")
    args_list = {k: v for k, v in args.items()}
    query_generator = SimpleQueryGenerator()
    es_q = query_generator.create_query(args_list)
    logging.info(f"search_query es_q: {json.dumps(es_q, ensure_ascii=False)}")
    return es_q

@app.tool(
    "search",
    description="生成したクエリで Elasticsearch を検索します。"
)
def tool_search(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    args: { "field1": "value1", ... }  -> SimpleQueryGenerator -> ES検索
    return: Elasticsearch の検索レスポンス(JSON)
    """
    logging.info(f"/api (search) called. args: {args}")
    args_list = {k: v for k, v in args.items()}

    # ES query生成（Flask版と同等の処理）
    query_generator = SimpleQueryGenerator()
    es_q = query_generator.create_query(args_list)
    logging.info(f"/api es_q: {json.dumps(es_q, ensure_ascii=False)}")

    # ESに投げる
    headers = {"Content-Type": "application/json"}
    # 元コードは GET+body でしたが、POSTの方が一般的です。必要ならGETに戻せます。
    # response = requests.get(ES_URL, headers=headers, data=json.dumps(es_q).encode("utf-8"))
    response = requests.post(ES_URL, headers=headers, data=json.dumps(es_q).encode("utf-8"))

    if response.ok:
        return response.json()
    else:
        logging.error(f"ES error {response.status_code}: {response.text}")
        # MCPツールとしてはエラー時もJSONで返すとクライアント側で扱いやすい
        return {
            "error": True,
            "status_code": response.status_code,
            "text": response.text,
        }

if __name__ == "__main__":
    # FastMCPは標準入出力(stdio)サーバとして起動します。
    # そのため Web ポートは開きません（MCPクライアントから呼び出す想定）。
    app.run()
