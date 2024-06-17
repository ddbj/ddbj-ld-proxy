# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## 起動とデータロード
- **最新のコンテナの起動方法などは以下に従う**
    - https://github.com/microbiomedatahub/docker-microbiome-datahub/blob/main/README.md

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

```
https://mdatahub.org/api/genome/_doc/PRJDB11811_OceanDNA-a1001
```

### /genome/_search?q=
登録されたgenomeのメタデータ全体をBasic Match Queryで検索します。

```
https://mdatahub.org/api/genome/_search?q=hogehoge
```

### /genome
POSTされたクエリボディをそのままElasticSearchに渡しその結果を返します。

```
curl 'https://mdatahub.org/api/genome' --data '{"query": {"match": {"data type":"MAG"}}}' -X POST -H 'Content-Type:application/json'
```


### /metastanza_data

- /metastanza_data/bioproject/{acc}
    - BioProjectのaccessionでメタデータを取得しmetastanza(Hash table)形式のJSONを返します

- /metastanza_data/bioproject?q={}
    - ElasticSearchを検索しmetastanza(pagination table)形式のJSONを返します


## ダウンロードAPI

## メタデータのダウンロード
projectおよびgenomeのメタデータをtsv形式でダウンロードすることができます。

```
# project
https://mdatahub.org/api/dl/project/metadata/PRJNA13694,PRJNA13696

# genome
https://mdatahub.org/api/dl/genome/metadata/GCA_029762495.1,GCA_000208265.2
```

## 系統組成データのダウンロード
系統組成データをプロジェクトごとに系統組成のランクに分かれたtsvファイルとしてダウンロードすることができます。

```https://mdatahub.org/api/dl/project/composition/PRJNA464990,PRJNA464992,PRJNA464993
```

## 配列ダウンロード

genome,cds,proteinの配列（fna,faa）をAPIを利用してダウンロードすることができます。

```
http://mdatahub.org/api/dl/sequence/{type}/{GCA[,]}
```
typeにはgenoem,protein,cdsのいずれかの文字列、GCAはバージョンまで含めたGCA IDを指定する