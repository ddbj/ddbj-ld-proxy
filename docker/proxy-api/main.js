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
    hits: ["/msearch test"]
  }
})

fastify.get('/plotly_view', async (req) => {
  const view_id = req.query.view;
  const sample_id = req.query.id;
  console.log(view_id, sample_id)

  //const res = await client.search({})
  // const res = res.hits.hits

  // mock response
  const res = [
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "7.849878655",
            "15.86047765",
            "11.70413754"
        ],
        "name": "Bacteroides",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "13.38264186",
            "19.14979621",
            "16.39901757"
        ],
        "name": "Lachnospiracea_incertae_sedis",
        "type": "bar"
    }]
  return res
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
