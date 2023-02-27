import Fastify from 'fastify'
import { Client } from '@elastic/elasticsearch'
import fastifyCors from '@fastify/cors'

const fastify = Fastify({
  logger: process.env.LOGGER === 'on' ? true : false,
})

fastify.register(fastifyCors)

const client = new Client({
  node: process.env.ELASTICSEARCH_HOST
})

const ERRORS = {
  "INCORRECT_PARAMETER": "Please check that the parameters and values are correct",
}

fastify.get('/', async (req) => {
  req.log.info(JSON.stringify(req.query))

  if (!req.query.q) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }

  const q = req.query.q.toLowerCase()

  const res = await client.search({
    "index": "bioproject",
    "body": {
      "size": 10,
      "query": {
        "bool": {
          "should": [
            {
              "wildcard": {
                "id": {
                  "value": `*${q}*`
                }
              }
            },
            {
              "wildcard": {
                "label": {
                  "value": `*${q}*`
                }
              }
            },
          ],
          "minimum_should_match": 1
        }
      }
    }
})
  return {
    hits: res.hits.hits
  }
})

fastify.get('/bioproject/_doc/:id', async (req, reply) => {
  if (!req.params.id) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }
  let id = req.params.id
  const index = await client.get({
    "index": "bioproject",
    "id": id
  })

  return {
    index
  }
})

fastify.get('/bioproject/_search', async (req, reply) => {
  if (!req.query.q) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }
  const q = req.query.q.toLowerCase()
  const res = await client.search({
    "index": "bioproject",
    "q": q
  })

  return {
    hits: [res.hits.hits]
  }
})

fastify.post('/bioproject', async (req, reply) => {
  const res = await client.search({
    "index": "bioproject",
    "body": req.body
  })

  return {
    hits: [res.hits.hits]
  }
})

fastify.get('/plotly_data', async (req) => {
    const view_id = req.query.view;
    const sample_id = req.query.id;

    if (view_id != ""){
      // TODO: viewを指定し対応する処理の結果を返す
    }

    let sample_list = sample_id.split(',');
    // name(あるいは_id)が sample_listに含まれるレコードを選択する
    const res = await client.search({
        "index": 'taxonomic_comparison',
        "body": {
                "query": {
                        "terms" : {
                            "_id": sample_list
                        },
            },
            "size": 1000
        }
    })
    let res_tmp = res.hits.hits
    // ESのレスポンスが引数の順番と限らないためsample_listを再取得
    if (res_tmp.length){
      sample_list = res_tmp.map(spl => {
        return spl._source.taxonomic_comparison.name
      })
      // [{taxon: , value: },,]の配列をサンプルごと取得
      let tax_value = res_tmp.map(spl => {
        return spl._source.taxonomic_comparison.composition
      })
      // taxonoごとの雛形のobjectを作成する
      let res_taxonomic_comparison = tax_value[0].map(taxon => {
        return {x: sample_list, y: [], name: taxon.taxon, type: "bar"}
      })
  
      res_taxonomic_comparison.forEach((element, index) => {
        // サンプル毎各taxonの値をyにpushする
        tax_value.forEach(tax => {
          element.y.push(tax[index].value)
        })
      })
      return res_taxonomic_comparison
    } else {
      return []
    }

})

//
// APIs for SRA Search
//

fastify.get('/metastanza_data/bioproject/:id', async (req) => {
  if (!req.params.id) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else{
    const id = req.params.id.toUpperCase()
    //const view = req.query.view.toLowerCase()
    // idを引数に検索結果をhash_table用にフォーマットして返す
    const index = await client.get({
      "index": "bioproject",
      "id": id
    })

    return {identifier: index._source.identifier, 
      organism: index._source.organism,
      title: index._source.title,
      description: index._source.description,
      organisazion: index._source.organization,
      created: index._source.dateCreated,
      modified: index._source.dateModified
    }
  }
})

fastify.get('/metastanza_data/bioproject', async (req) => {
  if (!req.query.q && !req.query.d) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else if(req.query.q){
    const q = req.query.q.toLowerCase()
    const res = await client.search({
      "index": "bioproject",
      "q": q
    })
    let jsn = res.hits.hits.map(h => {
      let cols = {
        identifier: h._source.identifier,
        organism: h._source.organism,
        description: h._source.description,
        title: h._source.title,
        submitted: h._source.dateCreated,
        last_updated: h._source.dateModified
      }
      return cols
    })
    return jsn
  }else if(req.query.d){

  }
})

fastify.get('/metastanza_data/biosample/:id', async (req) => {
  if (!req.params.id) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else{
    const id = req.params.id.toUpperCase()
    const index = await client.get({
      "index": "biosample",
      "id": id
    })
    // Todo: _source以下全て　のk:vを展開するようにする
    let cols =  {
      identifier: index._source.identifier, 
      taxonomy_id: index._source.taxonomy_id,
      taxonomy_name: index._source.taxonomy_name,
      title: index._source.title,
      package: index._source.package,
      last_update: index._source.last_update,
      publication_date: index._source.publication_date,
      submission_date: index._source.submission_date
    }
    if (index._source.tissue){ cols.tissue = index._source.tissue};
    if (index._source.gap_accession){cols.gap_accession = index._source.gap_accession}
    return cols
  }
})

fastify.get('/metastanza_data/biosample', async (req) => {
  if (!req.query.q && !req.query.d) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else if(req.query.q){
    const q = req.query.q.toLowerCase()
    const res = await client.search({
      "index": "biosample",
      "q": q
    })

    let jsn = res.hits.hits.map(h => {
      return {
        identifier: h._source.identifier, 
        taxonomy_id: h._source.taxonomy_id,
        taxonomy_name: h._source.taxonomy_name,
        title: h._source.title,
        package: h._source.package,
        last_update: h._source.last_update,
        publication_date: h._source.publication_date,
        submission_date: h._source.submission_date
      }
    })

    return jsn
  }else if(req.query.d){  }
})

fastify.get('/metastanza_data/study', async (req) => {
  if (!req.query.q && !req.query.d) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else if(req.query.q){
    const q = req.query.q.toLowerCase()
    const res = await client.search({
      "index": "study",
      "q": q
    })
    let jsn = res.hits.hits.map(h => {
      // Todo: h._sourceのk:vをflatに展開する
      let cols = flatten(h._source)
      return cols
    })
    return jsn
  }else if(req.query.d){

  }
})

fastify.get('/metastanza_data/study/:id', async (req) => {
  if (!req.params.id) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else{
    const id = req.params.id.toUpperCase()
    const index = await client.get({
      "index": "study",
      "id": id
    })
    // Todo: index._sourceをflattenする
    return flatten(index._source)
  }
})

fastify.get('/metastanza_data/experiment', async (req) => {

})

fastify.get('/metastanza_data/experiment/:id', async (req) => {

})

fastify.get('/metasatanza_data/srasearch/barplot', async (req) => {

})

fastify.get('/metastanza_data/srasearch/linechart', async () => {
  const res = await client.search({
    index: 'bioproject',
    body: {
      "aggs": {
        "bioproject_datatype": {
          "date_histogram": {
            "field": "dateCreated",
            "calendar_interval": "year"
          }
        }
      },
      "size": 0
    }
  })
  let b = res.aggregations.bioproject_datatype.buckets
  let counts = b.map(d => {
    return d.doc_count
    //return {"year": d.key_as_string.substr(0,4), "count": d.doc_count}
  })
  let cumlutive_counts = counts.map(cumulativeSum)
  let items = b.map((d, index)=> {
    return {"year": d.key_as_string.substr(0,4), "reegistrations": cumlutive_counts[index]}
  })
  return items
})

//
// 汎用 hash table API
//
fastify.get('/metastanza_data/:index_name/:id', async (req) => {
  if (!req.params.index_name || !req.params.id) {
    return {message: ERRORS.INCORRECT_PARAMETER}
  }else{
    const q = req.query.q.toLowerCase()
    const res = await client.search({
      "index": "bioproject",
      "q": q
    })

    let jsn = res.hits.hits.map(h => {
      return {
          // 全てのk:vをマップ
      }
    })

    return jsn
  }
})

const cumulativeSum = (sum => value => sum += value)(0);

const flatten = () => {
  return {}
}

const start = async () => {
  try {
    await fastify.listen(process.env.PORT, '0.0.0.0')
  } catch (e) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
