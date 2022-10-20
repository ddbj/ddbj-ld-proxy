# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## Migration

```
$ tar xf /path/to/ddbjsearch_elasticsearch.tar --directory .
$ ls ./data
elasticsearch
$ mkdir ./data/elasticsearch2
$ chmod a+w -R ./data
$ docker-compose up
```