# ddbj-ld-proxy
Proxy API for DDBJ search ElasticSearch cluster

## Prerequisites

require root permission

```
$ sysctl -w vm.max_map_count=262144
```

```
$ cat /etc/sysctl.conf
vm.max_map_count=262144
```

## Migration

```
$ tar xf /path/to/ddbjsearch_elasticsearch.tar --directory .
$ ls ./data
elasticsearch
$ mkdir ./data/elasticsearch2
$ chmod a+w -R ./data
$ docker-compose up
```