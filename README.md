# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## Migration

```
$ mkdir db
$ tar xf /path/to/ddbjsearch_elasticsearch.tar --directory ./db
$ ls ./db
elasticsearch
$ mkdir ./db/elasticsearch2
$ chmod a+w -R ./db
$ docker-compose up
```