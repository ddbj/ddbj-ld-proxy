# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## 起動とデータのロード

```
git clone -b 2023-oec ....
cd ddbj-ld-proxy
docker-compose up -d

# bioproject_acc_test.jsonplusと同じ階層に移動
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @bioproject_acc_test.jsonplus
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

### /plotly_view

prameters
- id: strings 
    カンマ区切りのID
    
- view: int
    plotly viewに対応するIDを引数として渡す.responseのスキーマが選択される（予定）

```
curl -XGET 'http://127.0.0.1:4001/plotly_view?id=H73F2DSXY_PG3460_605A3535,H73F2DSXY_PG3460_666A0202&view=1'
```

**現在何を引数にしてもモックデータを返します**. モックデータは早々に削除予定.


### /msearch

ElasticSearchのmsearchをラップする（予定）

```
curl 'http://127.0.0.1:4001/msearch' --data '
{"body":[
{"index": "meo","type":"mdb_common"},
{"from": 0,"size": 10,"source": ["identifier", "name"],"sort": ["_id"], "query": {"multi_match": {"fields": [ "title", "description"],"query": "metagenomics","operator": "and"} }}
]}' -X POST -H 'Content-Type:application/json'  
```

### /bioproject/_search

やりたいこと

- ttps://mb.ddbj.nig.ac.jp/bioproject/_search →localhost:9200/bioproject/_search




