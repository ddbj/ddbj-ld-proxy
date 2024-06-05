import Fastify from 'fastify'
import { Client } from '@elastic/elasticsearch'
import fastifyCors from '@fastify/cors'
import fs from 'fs';
import archiver from 'archiver';

import helper from './helper.js';

const fastify = Fastify({
  logger: process.env.LOGGER === 'on' ? true : false,
  maxParamLength: 2500,
})

fastify.register(fastifyCors)

const client = new Client({
  node: process.env.ELASTICSEARCH_HOST,
})

fastify.get('/', async (req) => {
  req.log.info(JSON.stringify(req.query))

  if (!req.query.q) {
    return { hits: [] }
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
    return { }
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
    return { }
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


fastify.get('/genome/_doc/:id', async(req, reply) => {
  if (!req.params.id) {
    return { }
  }
  let id = req.params.id
  const index = await client.get({
    "index": "genome",
    "id": id
  })
  return index
})

fastify.get('/genome/_search', async(req, reply) => {
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

fastify.post('/genome', async(req, reply) => {
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

fastify.get('/metastanza_data/bioproject/:id', async (req) => {
  if (!req.params.id) {
    return {}
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
  if (!req.query.q) {
    return { hits: [] }
  }else{
    const q = req.query.q.toLowerCase()
    const res = await client.search({
      "index": "bioproject",
      "q": q
    })

    let jsn = res.hits.hits.map(h => {
      return {
          identifier: h._source.identifier,
          organism: h._source.organism,
          title: h._source.title,
          created: h._source.dateCreated,
          modified: h._source.dateModified
      }
    })

    return jsn
  }
})


fastify.get('/metastanza_data/:index_name/:id', async (req) => {
  if (!req.params.index_name || !req.params.id) {
    return {}
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

//　DL用API

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

fastify.get('/dl/project/composition/:ids', async(req, rep) => {
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
    let project_prefix = bp.slice(0,5)
    let project_number = bp.slice(5,)
    let converted_number = project_number.padStart(6,0)
    let converted_number_3d = converted_number.slice(0,3)
    let converted_name = project_prefix + converted_number

    // Todo: dockerから見えるディレクトリか確認？？
    // Todo: 必要であればvolumeの設定を行う
    //let path = `/work1/mdatahub/public/project/{project_prefix}/{converted_number(0,3)/{converted_name}/compositions}`
    let path = `/mnt/data/mdatahub_sample/c/${project_prefix}/${converted_number_3d}/${converted_name}/compositions`
    return path
  })

  // Mapに(bp,path)のセットを保存
  project_id_list.forEach((id, index) => {
    pathMap.set(id, pathList[index])
  })

  // TODO: 本番環境でtmpファイルのパスが動作するか確認
  const tempDir = '/mnt/data/tmp'
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

fastify.get('/dl/sequence/genome/:ids', async (req, rep) => {
  if (!req.params.ids) {
    rep
      .code(400)
      .type('text/plain')
      .send('Bad Request. (no id set.)')
  }

  // TODO: ids から pathMap を取得するメソッドを作成
  //const pathMap = getSequencePathList(req.params.id)
  const pathMap = new Map()
  // idsとpathlistのindexが一致する
  const pathList = [
    '/mnt/data/mdatahub_sample/c0/ref16s_500k.fasta',
    '/mnt/data/mdatahub_sample/c1/ref16s_500k.fasta',
    '/mnt/data/mdatahub_sample/c2/ref16s_500k.fasta',
  ]
  req.params.ids.slit(',').forEach((id, index) => {
    pathMap.set(id, pathList[index])
  })

  // TODO: 一時ディレクトリは暫定（決まったら変更）
  const tempDir = '/mnt/data/tmp'

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
    rep.headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'inline; filename="sequence_genome.zip"'
    })
    rep.send(fs.createReadStream(zipFilePath))
  })
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
