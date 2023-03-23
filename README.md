# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster



## 起動とBioProjectデータのロード

### コンテナの起動
```
git clone -b 2023-oec https://github.com/ddbj/ddbj-ld-proxy.git
cd ddbj-ld-proxy
docker-compose up -d
```

### ElasticSearchデータ永続化のためのボリューム設定
docker-compose upの前に
環境変数で設定されたディレクトリ（例えば"dbs"）をリポジトリのルートディレクトリに作り、
さらにディレクトリ内に"elasticsearch/nodes"の階層を作成しておきます。
```
mkdir dbs/elasticsearch/nodes -p
```

### number_of_shards, number_of_replicasの設定
インデックスの存在しない状態で下記を実行する
```
curl -XPUT localhost:9200/_template/general_template -H 'Content-Type: application/json' -d '{
    "index_patterns" : ["*"],
    "settings": {
    "number_of_shards": "1",
    "number_of_replicas" : "0"
  }
}' 
```

### ElasticSearchへのBioProject+, genoemデータのインポート

```
# importするjsonlと同じ階層に移動（ddbj-ld-proxyディレクトリから）
cd dataflow_prototype

# インデックスがすでに存在していた場合一度indexを捨てる
curl -XDELETE http://localhost:9200/bioproject  
curl -XDELETE http://localhost:9200/genome  

# bulk import 
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @mdatahub_bioproject_test.jsonl
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @mdatahub_genome_test.jsonl
```

### ElasticSearchへの系統組成比較データのインポート

```
cd data
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @taxonomic_comparison.jsonl
```


## API reference

### /
部分一致検索だが、現在インデックスが正しく設定しておらず何も返さない

### /plotly_data

prameters
- id: strings 
    カンマ区切りのID
    
- view: int
    plotly viewに対応するIDを引数として渡す.responseのスキーマが選択される（予定）

```
curl -XGET 'http://127.0.0.1:4001/plotly_data?id=H73F2DSXY_PG3460_605A3535,H73F2DSXY_PG3460_666A0202&view=taxonomic_comparison'
```

ElasticSearchのtaxonomic_comparisonインデックスをの検索結果を整形して返すため、データの登録が必要。


### /bioproject

postするクエリbodyをそのままnode.jsのsearchメソッドに渡し、ElasticSearchの_searhを利用して検索を行う。現在シンプルなmatchクエリ、termクエリの動作は確認している。

```
curl 'http://127.0.0.1:4001/bioproject' --data '
{"query": {"term": {"title":{"value": "disease"}}}
}' -X POST -H 'Content-Type:application/json'
```
```
curl 'http://127.0.0.1:4001/bioproject' --data '
{"query": {"match": {"title":"disease"}}
}' -X POST -H 'Content-Type:application/json'
```

### /bioproject/_doc/:id

登録されたbioprojectのindex検索を行います。　

```
curl 'http://127.0.0.1:4001/bioproject/_doc/PRJNA192445'
```

### /bioproject/_search?q=

登録されたbioprojectメタデータ全体ををBasic Match Queryで検索します。

```
curl 'http://127.0.0.1:4001/bioproject/_search?q=gut'
```

### /genome/_doc/:id
登録されたゲノム情報のindex検索をおこないます。

### /genome/_search?q=
登録されたgenomeのメタデータ全体をBasic Match Queryで検索します。

### /genome
POSTされたクエリボディをそのままElasticSearchに渡しその結果を返します。

### /metastanza_data

- /metastanza_data/bioproject/{acc}
    - BioProjectのaccessionでメタデータを取得しmetastanza(Hash table)形式のJSONを返します

- /metastanza_data/bioproject?q={}
    - ElasticSearchを検索しmetastanza(pagination table)形式のJSONを返します
