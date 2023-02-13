# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## 起動とBioProjectデータのロード

```
git clone -b 2023-oec ....
cd ddbj-ld-proxy
docker-compose up -d

# bioproject_acc_test.jsonplusと同じ階層に移動
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @bioproject_acc_test.jsonplus
```

## plotly用データのロード

plotlyの系統組成比較チャート用のインデックスをElasticSearchにbulk importする
```
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @taxonomic_comparion.jsonl
```


## API reference

### /
部分一致検索だが、現在インデックスが正しく設定しておらず何も返さない

### /test

**削除予定**
ElasticSearchとのコネクションのテスト用のAPI. bioprojectインデックスを対象にmatch_allクエリで問い合わせを行う.

```
curl -XGET 'http://127.0.0.1:4001/test'
```

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

### /metastanza_data
