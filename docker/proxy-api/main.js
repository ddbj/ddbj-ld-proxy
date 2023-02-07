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
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "2.855945915",
            "6.331053997",
            "5.122331381"
        ],
        "name": "Bifidobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "4.58800416",
            "4.185333648",
            "5.821367844"
        ],
        "name": "Blautia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.046226742",
            "0.229056489",
            "21.49773285"
        ],
        "name": "Prevotella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "2.370565122",
            "5.958837201",
            "4.572076327"
        ],
        "name": "Faecalibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "4.369871721",
            "5.152086772",
            "5.242773474"
        ],
        "name": "Clostridium_XlVa",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "5.655552987",
            "2.558358878",
            "5.030228604"
        ],
        "name": "Collinsella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.89564313",
            "1.477077509",
            "6.196863782"
        ],
        "name": "Parabacteroides",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.837859702",
            "6.032943713",
            "0.630549783"
        ],
        "name": "Roseburia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "2.357563851",
            "6.165998585",
            "0.904496505"
        ],
        "name": "Ruminococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0",
            "0.00236161"
        ],
        "name": "Megamonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "4.492661505",
            "1.832451915",
            "0.50774608"
        ],
        "name": "Clostridium_IV",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "4.026060326",
            "2.039613299",
            "0.092102777"
        ],
        "name": "Streptococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.410262337",
            "0.803381952",
            "1.043831476"
        ],
        "name": "Anaerostipes",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "6.822778227",
            "1.539394348",
            "0.354241451"
        ],
        "name": "Oscillibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "2.308447937",
            "1.044228113",
            "2.009729832"
        ],
        "name": "Subdoligranulum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "3.981278169",
            "0.707380335",
            "0.226714529"
        ],
        "name": "Coprococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "3.180977696",
            "1.278337319",
            "0.085017948"
        ],
        "name": "Alistipes",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.262914596",
            "2.213089905",
            "0.21726809"
        ],
        "name": "Erysipelotrichaceae_incertae_sedis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.706402404",
            "1.062754741",
            "1.605894578"
        ],
        "name": "Clostridium_XVIII",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.284583381",
            "0.911173241",
            "1.572832042"
        ],
        "name": "Dorea",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "4.44065642",
            "2.652676256",
            "0.58095598"
        ],
        "name": "Clostridium_XI",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.203686583",
            "0.922962913",
            "0.727375779"
        ],
        "name": "Sutterella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.343811395",
            "0.010105433",
            "1.634233894"
        ],
        "name": "Phascolarctobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.829192188",
            "1.313706336",
            "0.167674287"
        ],
        "name": "Acetivibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.724222724",
            "0"
        ],
        "name": "Megasphaera",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "1.008859097",
            "0"
        ],
        "name": "Dialister",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.574945106",
            "0.340216256",
            "0.422728131"
        ],
        "name": "Gemmiger",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.144458569",
            "0.469902651",
            "0.552616664"
        ],
        "name": "Butyricicoccus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.48971455",
            "0.208845623",
            "0.110995655"
        ],
        "name": "Flavonifractor",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "2.080203398",
            "0.400848856",
            "0.047232193"
        ],
        "name": "Barnesiella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.11412227",
            "0.464849934",
            "0.713206121"
        ],
        "name": "Paraprevotella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.092633139",
            "0.00236161"
        ],
        "name": "Parasutterella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.062117185",
            "0.008421194",
            "0.297562819"
        ],
        "name": "Lactobacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.015890443",
            "0.01515815",
            "0.025977706"
        ],
        "name": "Veillonella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.131457298",
            "0.242530401",
            "0.984791234"
        ],
        "name": "Clostridium_XlVb",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Catenibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.005052717",
            "0.099187606"
        ],
        "name": "Clostridium_XIX",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "3.815150815",
            "0.424428201",
            "0.007084829"
        ],
        "name": "Clostridium_sensu_stricto",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.054317022"
        ],
        "name": "Fusobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0",
            "0"
        ],
        "name": "Akkermansia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.062117185",
            "0.153265739",
            "0.158227848"
        ],
        "name": "Eggerthella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.021668785",
            "0.003368478",
            "0"
        ],
        "name": "Klebsiella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.476713279",
            "0.117896722",
            "0.337710183"
        ],
        "name": "Olsenella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "0.003368478",
            "0.00236161"
        ],
        "name": "Escherichia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.0101121",
            "0",
            "0.07084829"
        ],
        "name": "Acidaminococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "1.357910551",
            "0.146528784",
            "0.066125071"
        ],
        "name": "Turicibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.361146423",
            "0.010105433",
            "0.2196297"
        ],
        "name": "Bacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.125678955",
            "0.020210867",
            "0.007084829"
        ],
        "name": "Gardnerella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.270137525",
            "0.114528245",
            "0.158227848"
        ],
        "name": "Bilophila",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.169016526",
            "0.112844006",
            "0.200736822"
        ],
        "name": "Robinsoniella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.68762279",
            "0.077474989",
            "0.028339316"
        ],
        "name": "Odoribacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.182017797",
            "0.161686934",
            "0.00236161"
        ],
        "name": "Enterococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Mitsuokella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.099676413",
            "0.545693401",
            "0.004723219"
        ],
        "name": "Slackia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.153126083",
            "0.058948361",
            "0.066125071"
        ],
        "name": "Coprobacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.069340113",
            "0.082527706",
            "0.347156622"
        ],
        "name": "Tannerella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.901421472",
            "0.114528245",
            "0.030700926"
        ],
        "name": "Anaerovorax",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "1.399803536",
            "0.185266278",
            "0.018892877"
        ],
        "name": "Anaerobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.078007627",
            "0.193687473",
            "0.108634045"
        ],
        "name": "Eubacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.098231827",
            "0.065685317",
            "0.042508974"
        ],
        "name": "Pseudoflavonifractor",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.026002542",
            "0.020210867",
            "0"
        ],
        "name": "Citrobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.115566855",
            "0.116212484",
            "0.056678632"
        ],
        "name": "Butyrivibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.248468739",
            "0.195371712",
            "0.00236161"
        ],
        "name": "Cellulosilyticum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Succinivibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.171905697",
            "0.07579075",
            "0"
        ],
        "name": "Butyricimonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.080896799",
            "0.026947822",
            "0.040147364"
        ],
        "name": "Actinomyces",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.011556686",
            "0.023579344",
            "0.018892877"
        ],
        "name": "Haemophilus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.46949035",
            "0.028632061",
            "0.030700926"
        ],
        "name": "Sporobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.088119727",
            "0.072422272",
            "0.087379558"
        ],
        "name": "Coriobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.069340113",
            "0.0606326",
            "0.136973361"
        ],
        "name": "Moryella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.049115914",
            "0.064001078",
            "0.025977706"
        ],
        "name": "Syntrophococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.089564313",
            "0.0303163",
            "0.009446439"
        ],
        "name": "Anaerofilum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "1.277013752",
            "0.008421194",
            "0"
        ],
        "name": "Acidaminobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.743961632",
            "0.053895645",
            "0.00236161"
        ],
        "name": "Anaerotruncus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.072229285",
            "0.038737495",
            "0.030700926"
        ],
        "name": "Lactonifactor",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.138680227",
            "0.07579075",
            "0.004723219"
        ],
        "name": "Gordonibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.070784699",
            "0.055579883",
            "0.082656339"
        ],
        "name": "Paludibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.166127355",
            "0.057264122",
            "0.082656339"
        ],
        "name": "Succiniclasticum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.015890443",
            "0.025263583",
            "0.025977706"
        ],
        "name": "Smaragdicoccus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.054894256",
            "0.052211406",
            "0.025977706"
        ],
        "name": "Oribacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.01515815",
            "0"
        ],
        "name": "Enterobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.0101121",
            "0.028632061",
            "0"
        ],
        "name": "Leclercia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.017335028",
            "0.064001078",
            "0"
        ],
        "name": "Lactococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Hallella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0.003368478",
            "0"
        ],
        "name": "Trabulsiella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.377036866",
            "0.037053256",
            "0.009446439"
        ],
        "name": "Papillibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.026002542",
            "0.064001078",
            "0.007084829"
        ],
        "name": "Enterorhabdus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.006736956",
            "0"
        ],
        "name": "Edwardsiella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.005052717",
            "0"
        ],
        "name": "Salmonella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.502715821",
            "0.003368478",
            "0"
        ],
        "name": "Gracilibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.157459841",
            "0.005052717",
            "0.00236161"
        ],
        "name": "Ethanoligenens",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.037559228",
            "0.025263583",
            "0"
        ],
        "name": "Rikenella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.001684239",
            "0"
        ],
        "name": "Erwinia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.047671328",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Desulfovibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.053895645",
            "0"
        ],
        "name": "Allisonella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.011556686",
            "0.064001078",
            "0.011808048"
        ],
        "name": "Pseudobutyrivibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Selenomonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.003368478",
            "0"
        ],
        "name": "Pantoea",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0.001684239",
            "0"
        ],
        "name": "Dickeya",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Vampirovibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.005052717",
            "0"
        ],
        "name": "Kluyvera",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.072229285",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Holdemania",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.033684778",
            "0"
        ],
        "name": "Anaeroglobus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.025263583",
            "0.018892877"
        ],
        "name": "Leeia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0",
            "0"
        ],
        "name": "Raoultella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.008667514",
            "0",
            "0.007084829"
        ],
        "name": "Peptococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Xylanibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Pectinatus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.056338842",
            "0.011789672",
            "0.004723219"
        ],
        "name": "Anaerosporobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "1.141222697",
            "0",
            "0"
        ],
        "name": "Methanobrevibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.011789672",
            "0"
        ],
        "name": "Schwartzia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.014445857",
            "0.005052717",
            "0"
        ],
        "name": "Propionispora",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Cetobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0.025263583",
            "0"
        ],
        "name": "Paraeggerthella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.023113371",
            "0",
            "0.00236161"
        ],
        "name": "Mogibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.014445857",
            "0.006736956",
            "0"
        ],
        "name": "Syntrophomonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.037559228",
            "0.043790211",
            "0"
        ],
        "name": "Anaerococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.024557957",
            "0.016842389",
            "0.00236161"
        ],
        "name": "Shuttleworthia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.070784699",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Planococcaceae_incertae_sedis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.049115914",
            "0.01515815",
            "0.007084829"
        ],
        "name": "Clostridium_III",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.018779614",
            "0.016842389",
            "0"
        ],
        "name": "Rothia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.003368478",
            "0"
        ],
        "name": "Hafnia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0",
            "0"
        ],
        "name": "Serratia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.013473911",
            "0.007084829"
        ],
        "name": "Gemella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.153126083",
            "0.005052717",
            "0"
        ],
        "name": "Filifactor",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Pediococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.015890443",
            "0.003368478",
            "0.007084829"
        ],
        "name": "Hespellia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.108343927",
            "0.013473911",
            "0.004723219"
        ],
        "name": "Hydrogenoanaerobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Asteroleplasma",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.082341384",
            "0.040421733",
            "0"
        ],
        "name": "Victivallis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.076563042",
            "0",
            "0"
        ],
        "name": "Brachyspira",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Granulicatella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0.011808048"
        ],
        "name": "Anaerovibrio",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.013473911",
            "0"
        ],
        "name": "Leuconostoc",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.031780885",
            "0.01515815",
            "0.009446439"
        ],
        "name": "Peptostreptococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "0.003368478",
            "0.007084829"
        ],
        "name": "TM7_genera_incertae_sedis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.047671328",
            "0",
            "0"
        ],
        "name": "Acetanaerobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.013001271",
            "0.013473911",
            "0"
        ],
        "name": "Pilibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0.021895106",
            "0.004723219"
        ],
        "name": "Derxia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.062117185",
            "0.010105433",
            "0.00236161"
        ],
        "name": "Subdivision5_genera_incertae_sedis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Succinispira",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.066450942",
            "0.005052717",
            "0"
        ],
        "name": "Sporacetigenium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Anaeroplasma",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.001684239",
            "0"
        ],
        "name": "Actinobacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0.001684239",
            "0"
        ],
        "name": "Sodalis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.127123541",
            "0",
            "0"
        ],
        "name": "Saccharofermentans",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.00236161"
        ],
        "name": "Alkaliflexus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Cronobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0.001684239",
            "0"
        ],
        "name": "Bulleidia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.06356177",
            "0.001684239",
            "0"
        ],
        "name": "Desulfosporosinus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.013001271",
            "0.005052717",
            "0"
        ],
        "name": "Prolixibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0.07579075",
            "0"
        ],
        "name": "Weissella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.028891714",
            "0",
            "0"
        ],
        "name": "Sedimentibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0.00236161"
        ],
        "name": "Denitrobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.247024153",
            "0",
            "0"
        ],
        "name": "Cloacibacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Trichococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.001684239",
            "0.00236161"
        ],
        "name": "Rahnella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.001684239",
            "0"
        ],
        "name": "Lachnobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Succinatimonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.001684239",
            "0"
        ],
        "name": "Dysgonomonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.108343927",
            "0",
            "0"
        ],
        "name": "Oxobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.023113371",
            "0",
            "0"
        ],
        "name": "Anaerofustis",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0.001684239",
            "0.007084829"
        ],
        "name": "Marvinbryantia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Pectobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.00236161"
        ],
        "name": "Aggregatibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.065006356",
            "0.005052717",
            "0"
        ],
        "name": "Sarcina",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.067895528",
            "0",
            "0"
        ],
        "name": "Fervidicella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.018779614",
            "0",
            "0"
        ],
        "name": "Atopobium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0",
            "0.007084829"
        ],
        "name": "Bhargavaea",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Marinospirillum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.054894256",
            "0.003368478",
            "0"
        ],
        "name": "Dehalobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.00236161"
        ],
        "name": "Clostridium_XII",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Marinobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.0303363",
            "0",
            "0"
        ],
        "name": "Paenibacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Tetrasphaera",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.003368478",
            "0"
        ],
        "name": "Corynebacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Iamia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.001684239",
            "0"
        ],
        "name": "Mangrovibacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Brenneria",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Acetobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.003368478",
            "0.004723219"
        ],
        "name": "Nitrosomonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0.00236161"
        ],
        "name": "Solobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.005778343",
            "0.003368478",
            "0"
        ],
        "name": "Howardella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0",
            "0"
        ],
        "name": "Allobaculum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Pasteurella",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Parvimonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Simplicispira",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.001684239",
            "0"
        ],
        "name": "Lucibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.006736956",
            "0.00236161"
        ],
        "name": "Pusillimonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.009446439"
        ],
        "name": "Anaeromusa",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.001684239",
            "0.007084829"
        ],
        "name": "Thiohalobacter",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0",
            "0"
        ],
        "name": "Peptoniphilus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Gallibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Varibaculum",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Providencia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.070784699",
            "0",
            "0"
        ],
        "name": "Methanosphaera",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Catellicoccus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.007222928",
            "0",
            "0"
        ],
        "name": "Adlercreutzia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.008667514",
            "0.006736956",
            "0"
        ],
        "name": "Lutispora",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0.00236161"
        ],
        "name": "Basfia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0",
            "0"
        ],
        "name": "Pelospora",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.004333757",
            "0.001684239",
            "0"
        ],
        "name": "Porphyromonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.008667514",
            "0",
            "0"
        ],
        "name": "Undibacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.002889171",
            "0",
            "0"
        ],
        "name": "Oceanobacillus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Zunongwangia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Finegoldia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.011556686",
            "0",
            "0"
        ],
        "name": "Albidiferax",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.014445857",
            "0",
            "0"
        ],
        "name": "Acetomicrobium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.021668785",
            "0.003368478",
            "0.00236161"
        ],
        "name": "Parasporobacterium",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0.005052717",
            "0"
        ],
        "name": "Parascardovia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Staphylococcus",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.001444586",
            "0",
            "0"
        ],
        "name": "Abiotrophia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.017335028",
            "0",
            "0"
        ],
        "name": "Alloscardovia",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0",
            "0",
            "0"
        ],
        "name": "Plesiomonas",
        "type": "bar"
    },
    {
        "x": [
            "H53G2DSXY_PG3460_762A5858",
            "H73F2DSXY_PG3460_605A3535",
            "H73F2DSXY_PG3460_666A0202"
        ],
        "y": [
            "0.014445857",
            "0",
            "0"
        ],
        "name": "Fusibacter",
        "type": "bar"
    }
]
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
