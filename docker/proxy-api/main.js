import Fastify from 'fastify'
import { Client } from '@elastic/elasticsearch'
import fastifyCors from '@fastify/cors'

const fastify = Fastify({
  logger: process.env.LOGGER === 'on' ? true : false,
})

fastify.register(fastifyCors)

const client = new Client({
  node: process.env.ELASTICSEARCH_HOST,
})

fastify.get('/', async (req) => {
  console.log(req.query)
  req.log.info(JSON.stringify(req.query))

  if (!req.query.q) {
    return { hits: ["test2"] }
  }

  const q = req.query.q.toLowerCase()

  const res = await client.search({
    "size": 1000,
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
  })
  //console.log(res.hits)
  return {
    hits: res.hits.hits
  }
})

fastify.post('/msearch', async (req, reply) => {
  console.log(req.body)


  return {
    hits: []
  }
})

fastify.get('/plotly_data', async (req) => {
    const view_id = req.query.view;
    const sample_id = req.query.id;

    if (view_id != ""){
      // 本来はviewを指定し処理を追加していく
    }

    let sample_list = sample_id.split(',');
    // name(あるいは_id)が sample_listに含まれるレコードを選択する
    const res = await client.search({
        "index": 'taxonomic_comparison',
        "body": {
                "query": {
                        "terms" : {
                            "_id": sample_list
                        }
            }
        }
    })
    let res_tmp = res.hits.hits
    // ESのレスポンスが引数の順番と限らないためsample_listをとりなおす
    sample_list = res_tmp.map(spl => {
      return _source.taxonomic_comparison.name
    })
    // [{taxon: , value: },,]の配列をサンプルごと取得 => List[List[dict]]
    let tax_value = res_tmp.map(spl => {
      return spl._source.taxonomic_comparison.composition
    })
    // taxonoごとの雛形のobjectを作成する
    let res_taxonomic_comparison = tax_value[0].map(taxon => {
      return {x: sample_list, y: [], name: taxon.name, type: "bar"}
    })

    res_taxonomic_comparison.forEach(element => {
      // サンプル毎各taxonの値をyにpushする
      tax_value.forEach(tax => {
        element.y.push(tax.value)
      })
    })

    return res_taxonomic_comparison
})

fastify.get('/test', async () => {
  const res = await client.search({
          "index": 'bioproject',
          "type": 'metadata', //Specifying types in search requests is deprecated
          "body": {
                  "query": {
                          "match_all" : {}
               },
                  "size": 2
          }

  })

  return {
          hits: res.hits.hits
  }
})


const start = async () => {
  try {
    await fastify.listen(process.env.PORT, '0.0.0.0')
  } catch (e) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
