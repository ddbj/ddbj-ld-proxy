# 検索の仕様
- Elasticsearchのboolクエリのmust条件下に動的に各種クエリを追加し最終的なESのクエリを生成しElasticseachを検索する
- keyword属性として設定した属性（ex. keywords=）を受け取った場合はkeyword_fieldsに設定した複数のフィールドを検索するクエリを返す
- クエリの値をカンマで区切ると区切った文字のOR条件となるshouldクエリを生成する
- クエリの値をスペース（URLエンコードを考慮すると"%20"）で区切ると区切った文字のOR条件となるshouldクエリを生成する
- レンジクエリを利用するときは属性の接尾語に*_gte, *_lteを付加した属性を用いる
- size,from,sortなどElasticsearchの予約語となる様な属性はそのまま最終的なクエリに追加する
- クエリの文字列に"*"が含まれる場合"通常のmatchクエリに代わってワイルドカードクエリを利用する
- track_total_hitsはデフォルトでTrueとする

# 検索に利用できるパラメータ

- keyword
- genome_taxon
- mag_completeness
- host_taxon
- quality
- bioproject
- biosample
- identifier

その他に、size, from, sortをElasticsearchのクエリの設定値としてクエリパラメータに設定することができます


## API利用例

- /api/dev/genome/search?keyword=akkermansia&size=1
- /api/dev/genome/search?genome_taxon=akkermansia&size=1
- /api/dev/genome/search?genome_taxon=akkermansia&keyword=Alberta&size=1
- /api/dev/genome/search?genome_taxon=akkermansia sp904501915&size=1

- 環境内からcurlで確認する場合の例
  
```
curl -XGET "http://localhost:8081/api/dev/genome/search?genome_taxon=akkermansia&size=1" 
curl -XGET "http://localhost:8081/api/dev/genome/search?genome_taxon=akkermansia%20sp904501915" 
curl -XGET "http://localhost:8081/api/dev/genome/search?genome_taxon=akkermansia&keyword=Alberta" 
```



## 利用の制限
- 現在ステージング環境のgenome_devインデックスのみでrest apiを利用できる（2025/3/15）


# simple_es_queryの既存環境（mdatahub）への組み込みについて

## compose.ymlへの追記

以下をcomposeに追記しsimple_es_queryを起動します

```
  es_converter:
    build: ./simple_es_query
    volumes:
      - ./simple_es_query/logs:/app/logs
    container_name: flask_app
    environment:
      ELASTICSEARCH_HOST: http://es01:9200
    ports:
      - "5000:5000"

```

fastifyの設定にconverterのHOSTを追記します（TODO: 現状ハードコードしているがenvironmentで問題ないか確認）
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