# server.py — FastMCP版
import os
import json
import logging
from typing import Dict, Any
import requests
from fastmcp import FastMCP
from starlette.requests import Request
from starlette.responses import JSONResponse
from query_generator import SimpleQueryGenerator

# ---- logging (元コード準拠) ----
logging.basicConfig(
    filename=os.getenv("LOG_FILE", "/app/logs/server.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# ---- settings ----
ES_URL = os.getenv("ES_URL", "http://localhost:9200/genome/_search")

app = FastMCP("genome-mcp")  # MCPサーバー名は任意

@app.custom_route(
    "/search_query",
    methods=["POST"]
    )
async def tool_search_query(request: Request) -> Dict[str, Any]:
    """
    args: { "field1": "value1", "field2": "value2", ... }
    return: Elasticsearch Query DSL (dict)
    """
    #logging.info(f"search_query args: {args}")
    payload = await request.json()
    #logging.info("payload: %s", json.dumps(payload, ensure_ascii=False))
    #print("search_query args_list:", json.dumps(payload, ensure_ascii=False, default=str))
    query_generator = SimpleQueryGenerator()
    es_q = query_generator.create_query(payload)
    #logging.info("search_query es_q: %s", json.dumps(es_q, ensure_ascii=False, default=str))
    #print("search_query es_q:", json.dumps(es_q, ensure_ascii=False, default=str))
    return JSONResponse(es_q)

@app.tool(
    "search",
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

def normalize_keys(obj):
    """dictキーを再帰的に文字列化し、bytesはデコード"""
    if isinstance(obj, dict):
        new_dict = {}
        for k, v in obj.items():
            # キーを安全に文字列化
            key = str(k)
            new_dict[key] = normalize_keys(v)
        return new_dict
    elif isinstance(obj, list):
        return [normalize_keys(v) for v in obj]
    elif isinstance(obj, (bytes, bytearray)):
        # bytes→UTF-8文字列
        return obj.decode("utf-8", errors="replace")
    else:
        return obj


if __name__ == "__main__":
    # FastMCPは標準入出力(stdio)サーバとして起動する場合
    # app.run()
    port = int(os.getenv("PORT", "5001"))
    # 重要: transport="http" で 0.0.0.0 にバインド
    app.run(transport="http", host="0.0.0.0", port=port)
