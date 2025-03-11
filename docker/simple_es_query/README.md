# simple_es_queryの既存環境（mdatahub）への組み込みについて

## compose.ymlへの追記

以下をcomposeに追記しsimple_es_queryを起動します

```
  es_converter:
    build: ./simple_es_query
    volumes:
      - ./simple_es_query/logs:/app/logs
    container_name: es_query_converter
    environment:
      ELASTICSEARCH_HOST: http://es01:9200
    ports:
      - "5000:5000"

```

fastifyの設定にconverterのHOSTを追記します
```
  api:
    container_name: microbiome-api
    build: ./ddbj-ld-proxy/docker/proxy-api
    command: npm start
    environment:
      ELASTICSEARCH_HOST: http://es01:9200
      CONVERTER_HOST: http://es_converter:5000
      LOGGER: on
      PORT: "4001"
    depends_on:
      - es01
```

## api呼び出し

- 利用例）
/api/dev/genome/search?keyword=akkermansia