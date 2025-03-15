from flask import Flask, request, jsonify
from typing import List
import requests
import json
import logging
from simple_query_generator import SimpleQueryGenerator

app = Flask(__name__)

logging.basicConfig(filename='/app/logs/server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


@app.route('/search_query', methods=['POST'])
def search_query():
    """
    受け取ったkey:valueのリストをESのクエリに変換します
    """
    logging.info('/search_query called')
    args = request.get_json()
    logging.info(f"args: {str(args)}")
    args_list = {k: v for k,v in args.items()}
    # ES query生成
    query_generator = SimpleQueryGenerator()
    es_q = query_generator.create_query(args_list)
    logging.info(f"es_q: {json.dumps(es_q)}")
    return json.dumps(es_q)


@app.route('/api')
def search():
    """
    生成したElasticsearchの評価用のAPIサーバーです
    docker composeで起動したESを検索します
    """
    logging.info('/api called')
    url = "http://192.168.11.20:9200/genome_anex/_search"
    args = request.args
    print(request.args)
    print([i for i in request.args.keys()])
    logging.info(f"args: {str(args)}")
    args_list = {k: v for k,v in args.items()}
    # ES query生成
    query_generator = SimpleQueryGenerator()
    es_q = query_generator.create_query(args_list)
    logging.info(f"es_q: {str(es_q)}")
    q = json.dumps(es_q).encode('utf-8')
    #q = json.dumps({"query": {"match_all": {}}, "size": 1}).encode(('utf-8'))
    headers = {'Content-Type': 'application/json'}
    response = requests.get(url, headers=headers, data=q)
    if response.status_code == 200:
        response_json = response.json()
        return response_json
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return ''


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
