import Fastify from 'fastify'
import { Client } from '@elastic/elasticsearch'
import fastifyCors from '@fastify/cors'
import fs from 'fs';
import archiver from 'archiver';
import fetch from "node-fetch";
// swagger
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import helper from './helper.js';

const fastify = Fastify({
  //logger: process.env.LOGGER === 'on' ? true : false,
  logger: {
    level: process.env.LOGGER_LEVEL || 'trace' 
  },
  maxParamLength: 2500,
})

fastify.register(fastifyCors)

async function registerPlugins() {
// 1. Swaggerプラグインの登録
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify genome Search API',
        description: 'fastify-swaggerを使ったAPIドキュメント',
        version: '1.0.0'
      },
      servers: [{ url: 'http://localhost:4001' }],
    },
    stripBasePath: true,
  })

  // 2. Swagger UIプラグインの登録
  await fastify.register(swaggerUi, {
    routePrefix: '/docs', // '/docs'にアクセスするとSwagger UIが表示される
    uiConfig: {
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true,
    exposeRoute: true
  });

}

await registerPlugins()


const client = new Client({
  node: process.env.ELASTICSEARCH_HOST,
  sniffOnStart: false,
  sniffInterval: false,
  sniffOnConnectionFault: false,
})


// RESTのパラメータを引数にsimple_es_query_generatorサービスが返すESのクエリを利用して
// Elasticsearchの検索を行う
fastify.get('/dev/genome/search',  {
  summary: 'アイテムを検索します',
  description: 'クエリパラメータを用いた検索を行います。',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        sort: {
          type: 'string',
          enum: ['dateCreated', 'dateModified', 'datePublished', 'identifier'],
          default: 'desc',
          description: 'Specify the method for sorting search results'
        },
        order: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'desc',
          description: 'Specify the sort order direction for search results'
        },
        size: {
          type: 'integer',
          default: 10,
          description: 'Number of records displayed per page in search results'
        },
        from: {
          type: 'integer',
          default: 0,
          description: 'Starting position of records in search results for pagination'
        },
        keyword: {
          type: 'string',
          description: 'Search for keyword terms'
        },
        environment: {
          type: 'string',
          description: 'Specify the string to search for _meo.label'
        },
        genome_taxon: {
          type: 'string',
          description: 'Specify the string to search for _genome_taxon'
        },
        host_taxon: {
          type: 'string',
          description: 'Specify the string to search for sample_host_organism'
        },
        quality: {
          type: 'string',
          description: 'Comma-separated list of integers, e.g. q=1,2,3. Specify the quality values to search for',
          // style属性は対応していないため削除
          //style: 'form',
          //explode: false
        },
        bioproject: {
          type: 'string',
          description: 'String to search for bioproject attributes'
        },
        biosample: {
          type: 'string',
          description: 'String to search for biosample attributes'
        },
        identifier: {
          type: 'string',
          description: 'String to search for genome_id'
        },
        data_source: {
          type: 'array',
          items: { type: 'string', enum: ['INSDC', 'RefSeq', 'INSDC,RefSeq', 'RefSeq,INSDC'] },
          description: 'String to search for data_source'
        }
      },
      additionalProperties: true

    },
    response: {
      200: {
        description: '検索結果のリスト',
        type: 'object' // 適宜レスポンス構造を定義する
      }
    }
  }
}, async (req, rep) => {
  const kv_pairs = req.query && Object.keys(req.query).length > 0 ? { ...req.query } : {};
  //console.log('Received query parameters:', kv_pairs);

  // クエリパラメータを取得し、key:value形式のオブジェクトに変換する
  //const kv_pairs = helper.query2dict(q)
  // クエリパラメータをESのクエリに変換する
  const upstream = await fetch('http://es_converter:5001/search_query',{
    method: 'POST',
    headers: {
	'Content-Type': 'application/json',
    },
    // TODO: kvの定義が怪しいので再確認
    body: JSON.stringify(kv_pairs),
  })
  const query_text = await upstream.text();
  if (!upstream.ok) {
    // 上流からのエラー本文をそのまま返してもよい（ここも一度読み済み）
    req.log.error({ status: upstream.status, body: text }, 'es_converter error');
    reply.code(502);
    return reply.send({ error: 'Bad Gateway: es_converter failed', detail: query_text });
  }

  let query;
  try {
    query = JSON.parse(query_text);
  } catch {
    req.log.error({ body: query_text }, 'Invalid JSON from es_converter');
    rep.code(502);
    return rep.send({ error: 'Bad Gateway: invalid JSON from es_converter' });
  }
  // queryの内容を確認する
  // logger出力
  //console.log("Generated ES Query:", JSON.stringify(query, null, 2));
  // デバッグ用コンソール出力
  const res = await client.search({
    "index": "genome",
    "body": query
  });
  const res_body = res.body || res;
  const safe_body = JSON.stringify(res_body, (key, value) => value);
  //console.log("Elasticsearch Response Body:", safe_body);
  return safe_body;
});


fastify.get('/bioproject/_doc/:id', async (req, reply) => {
  if (!req.params.id) {
    return {}
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
    return { hits: [] }
  }
  const q = req.query.q.toLowerCase()
  const res = await client.search({
    "index": "bioproject",
    "q": q
  })

  return res
})

fastify.post('/bioproject', async (req, reply) => {
  const res = await client.search({
    "index": "bioproject",
    "body": req.body
  })

  return res
})

// Copies　of the above apis as bioproject~

fastify.get('/project/_doc/:id', async (req, reply) => {
  if (!req.params.id) {
    return {}
  }
  let id = req.params.id
  const index = await client.get({
    "index": "project",
    "id": id
  })

  return {
    index
  }
})

fastify.get('/project/_search', async (req, reply) => {
  if (!req.query.q) {
    return { hits: [] }
  }
  const q = req.query.q.toLowerCase()
  const res = await client.search({
    "index": "project",
    "q": q
  })

  return res
})

fastify.post('/project', async (req, reply) => {
  const res = await client.search({
    "index": "project",
    "body": req.body
  })

  return res
})


fastify.get('/genome/_doc/:id', async (req, reply) => {
  if (!req.params.id) {
    return {}
  }
  let id = req.params.id
  const index = await client.get({
    "index": "genome",
    "id": id
  })
  return index
})

fastify.get('/genome/_search', async (req, reply) => {
  if (!req.query.q) {
    return { hits: [] }
  }
  const q = req.query.q.toLowerCase()
  const res = await client.search({
    "index": "genome",
    "q": q
  })
  return res
})

fastify.post('/genome', async (req, reply) => {
  const res = await client.search({
    "index": "genome",
    "body": req.body
  })

  return res
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
                        "terms": {
                            "_id": sample_list
                        },
            },
            "size": 1000
        }
    })
    let res_tmp = res.hits.hits
    // ESのレスポンスが引数の順番と限らないためsample_listを再取得
    if (res_tmp.length) {
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

fastify.get('/dl/project/metadata/:ids', async (req, rep) => {
  if (!req.params.ids) {
    rep
      .code(400)
      .type('text/plain')
      .send('Bad Request. (no id set.)')
  }
  const data = await helper.get_metadata(req.params.ids, "project")

  // クエリストリングで type=json が指定されている場合はJSONで応答する
  if (req.query.type === 'json') {
    rep.header('Content-Disposition', 'attachment; filename=project_metadata.json')
    rep.send(data)
  } else {
    rep.header('Content-Disposition', 'attachment; filename=project_metadata.tsv')
    rep.type('text/tab-separated-values')
    rep.send(helper.dict2tsv(data))
  }
})

fastify.get('/dl/genome/metadata/:ids', async (req, rep) => {
  if (!req.params.ids) {
    rep
      .code(400)
      .type('text/plain')
      .send('Bad Request. (no id set.)')
  }
  const data = await helper.get_metadata(req.params.ids, "genome")

  // クエリストリングで type=json が指定されている場合はJSONで応答する
  if (req.query.type === 'json') {
    rep.header('Content-Disposition', 'attachment; filename=genome_metadata.json')
    rep.send(data)
  } else {
    rep.header('Content-Disposition', 'attachment; filename=genome_metadata.tsv')
    rep.type('text/tab-separated-values')
    rep.send(helper.dict2tsv(data))
  }
})

fastify.get('/dl/project/composition/:ids', async (req, rep) => {
  if (!req.params.ids) {
    rep
      .code(400)
      .type('text/plain')
      .send('Bad Request. (no id set.)')
  }

  const project_ids = req.params.ids
  const project_id_list = project_ids.split(',')
  const pathMap = new Map()
  // inputファイルのパスを定義する
  const pathList = project_id_list.map(bp => {
    let project_prefix = bp.slice(0, 5)
    let project_number = bp.slice(5,)
    let converted_number = project_number.padStart(6, 0)
    let converted_number_3d = converted_number.slice(0, 3)
    let converted_name = project_prefix + converted_number

    let path = `/srv/project/${project_prefix}/${converted_number_3d}/${converted_name}/compositions`
    return path
  })

  // Mapに(bp,path)のセットを保存
  project_id_list.forEach((id, index) => {
    pathMap.set(id, pathList[index])
  })

  const tempDir = '/mnt'
  const timestamp = Date.now().toString()
  const zipFilePath = tempDir + `/${timestamp}.zip`
  const output = fs.createWriteStream(zipFilePath)
  const archive = archiver('zip')
  archive.pipe(output)

  pathMap.forEach((path, pid) => {
    if (path === '') {
      return
    }
    const fileName = `${pid}_composition`
    // 第一引数でパス、第二引数で展開時のディレクトリ構造を渡す
    archive.directory(path, `${pid}_compositions`)
  })
  archive.finalize()

  output.on('close', () => {
    //rep.type('application/zip')
    rep.headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'inline; filename="compositions.zip"'
    })
    rep.send(fs.createReadStream(zipFilePath))
  })
})

fastify.get('/dl/sequence/:type(^(genome|cds|protein)$)/:ids', async (req, rep) => {
  if (!req.params.ids) {
    rep
      .code(400)
      .type('text/plain')
      .send('Bad Request. (no id set.)')
  }

  const project_ids = req.params.ids
  const project_id_list = project_ids.split(',')
  const type = req.params.type
  let file_name;

  switch (type) {
    case "genome":
      file_name = "dfast/genome.fna";
      break;
    case "cds":
      file_name = "dfast/cds.fna";
      break;
    case "protein":
      file_name = "dfast/protein.faa"
  }
  const pathMap = new Map()
  // ファイルのパスを定義する
  const pathList = project_id_list.map(id => {
    // idより数字部分を取得
    let prefix = id.slice(0, 3)
    let regex = /\d+/g;
    let figs = id.match(regex);
    let first3 = figs[0].slice(0, 3)
    let middle3 = figs[0].slice(3, 6)
    let final3 = figs[0].slice(6,)
    // 数字部分を3文字づつ変数に入れる
    let path = `/srv/genome/${prefix}/${first3}/${middle3}/${final3}/${id}/${file_name}`

    // dfast/ディレクトリの有無を確認し存在しない場合file_nameから"dfast/"を削除する
    let dfast_dir = fs.existsSync(path)
    path = dfast_dir ? path : path.replace('dfast/', '')

    return path
  })
    // Mapに(bp,path)のセットを保存
    project_id_list.forEach((id, index) => {
      pathMap.set(id, pathList[index])
    })

  const tempDir = '/mnt'
  const timestamp = Date.now().toString()
  const zipFilePath = tempDir + `/${timestamp}.zip`
  const output = fs.createWriteStream(zipFilePath)
  const archive = archiver('zip')
  archive.pipe(output)

  pathMap.forEach((v, k) => {
    if (v === '') {
      return
    }
    const fileName = v.split('/').at(-1)
    archive.file(v, { name: `${k}/${fileName}` })
  })
  archive.finalize()

  output.on('close', () => {
    //rep.type('application/zip')
    let contentName = 'inline; filename="sequence' + '_' + type + '.zip"'; 
    rep.headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': contentName
    })
    rep.send(fs.createReadStream(zipFilePath))
  })
})

// クエリのMAG IDに対応するMBGD Orthologのデータを各MAGディレクトリより取得し返す
fastify.get('/genome/mbgd/:genome_id', async (req, rep) => {
  const genome_id = req.params.genome_id
  try {
    // genome_idよりJSONファイル取得先のパスを生成する
    // idより数字部分を取得
    let prefix = genome_id.slice(0, 3)
    let regex = /\d+/g;
    let figs = genome_id.match(regex);
    let first3 = figs[0].slice(0, 3)
    let middle3 = figs[0].slice(3, 6)
    let final3 = figs[0].slice(6,)
    // 数字部分を3文字づつ変数に入れる
    // mbgd.json->module.jsonに変更
    const jsonPath = `/srv/genome/${prefix}/${first3}/${middle3}/${final3}/${genome_id}/module.json`
    // JSONファイルを読み込みオブジェクトに変換
    const data = await fs.promises.readFile(jsonPath, 'utf8')
    const jsonData = JSON.parse(data)
    // 変換されたオブジェクトを返す
    rep.header('Content-Type', 'application/json')
    rep.send(jsonData)
  } catch (error) {
    console.error(error)
    if (error.code === 'ENOENT') {
      return rep.header('Content-Type', 'application/json').send([])
    }
    rep.code(500).send('Internal Server Error')
  }
})

// 一時的にコメントアウト
//fastify.get('/genome/search', async (req, rep) => {
//  if (!req.query.q) {
//    return { hits: [] }
//  }
//  const kv_pairs = {...req.query}
//  const keyword = kv_pairs.keyword
//  delete kv_pairs.keyword
//  const q = esQuery(req.query.q)
//  const res = await client.search({
//    "index": "bioproject",
//    "q": q
//  })
//  return res
//})


// '/', の次の{}をswagger用に追加
fastify.get('/', {
  // ここからSwagger用のschema定義を追加
  schema: {
    summary: 'ルートパス',
    description: 'クエリパラメータ "q" を使ってElasticsearchで検索を実行します。qが無い場合は現在時刻を返します。',
    tags: ['search'], // APIをグループ化するためのタグ
    querystring: { // クエリパラメータの定義
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: '検索キーワード'
        }
      }
    },
    response: { // レスポンスの定義
      200: {
        description: '成功時のレスポンス',
        type: 'object',
        properties: {
          hits: {
            type: 'array',
            description: '検索結果の配列',
            items: { 
              // 実際にはElasticsearchの返り値に合わせたより詳細な型を定義します
              type: 'object' 
            }
          }
        }
      }
    }
  }
  // ここまで
}, async (req) => {
  req.log.info(JSON.stringify(req.query))

  if (!req.query.q) {
    // hitsの値としてtodayの日付を返す
    return { hits: [new Date().toISOString()] }
  }
  const q = req.query.q.toLowerCase()
  // TODO: DEP. クエリの組み立てを別サービスに移行する
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



const start = async () => {
  try {
    await fastify.ready()
    await fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
  } catch (e) {
    fastify.log.error(e)
    process.exit(1)
  }
}

start()
