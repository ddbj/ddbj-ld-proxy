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
// Swaggerプラグインの登録
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Microbiome Datahub API',
        description: 'API documentation for Microbiome Datahub',
        version: '1.0.0'
      },
      servers: [{ url: '/api' }],
    },
    stripBasePath: true,
  })

  // Swagger UIプラグインの登録
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

const genomeResponseSchema = {
  type: 'object',
  properties: {
    _index: { type: 'string' },
    _type: { type: 'string' },
    _id: { type: 'string' },
    _version: { type: 'integer' },
    _seq_no: { type: 'integer' },
    _primary_term: { type: 'integer' },
    found: { type: 'boolean' },
    _source: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        identifier: { type: 'string' },
        organism: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        "data type": { type: 'string' }, // スペースを含むキー
        organization: { type: 'string' },
        publication: {
          type: 'array',
          items: { type: 'object', additionalProperties: true } // 中身が空の場合の定義
        },
        properties: {
          type: 'object',
          properties: {
            assembly_accession: { type: 'string' },
            bioproject: { type: 'string' },
            biosample: { type: 'string' },
            wgs_master: { type: 'string' },
            refseq_category: { type: 'string' },
            taxid: { type: 'string' },
            species_taxid: { type: 'string' },
            organism_name: { type: 'string' },
            infraspecific_name: { type: 'string' },
            isolate: { type: 'string' },
            version_status: { type: 'string' },
            assembly_level: { type: 'string' },
            release_type: { type: 'string' },
            genome_rep: { type: 'string' },
            seq_rel_date: { type: 'string' },
            asm_name: { type: 'string' },
            asm_submitter: { type: 'string' },
            gbrs_paired_asm: { type: 'string' },
            paired_asm_comp: { type: 'string' },
            ftp_path: { type: 'string' },
            excluded_from_refseq: { type: 'string' },
            relation_to_type_material: { type: 'string' },
            asm_not_live_date: { type: 'string' },
            assembly_type: { type: 'string' },
            group: { type: 'string' },
            genome_size: { type: 'string' },
            genome_size_ungapped: { type: 'string' },
            gc_percent: { type: 'string' },
            replicon_count: { type: 'string' },
            scaffold_count: { type: 'string' },
            contig_count: { type: 'string' },
            annotation_provider: { type: 'string' },
            annotation_name: { type: 'string' },
            annotation_date: { type: 'string' },
            total_gene_count: { type: 'string' },
            protein_coding_gene_count: { type: 'string' },
            non_coding_gene_count: { type: 'string' },
            pubmed_id: { type: 'string' }
          }
        },
        dbXrefs: { type: 'array', items: { type: 'string' } },
        distribution: { type: ['string', 'null'] },
        Download: { type: ['string', 'null'] },
        status: { type: 'string' },
        visibility: { type: ['string', 'null'] },
        dateCreated: { type: 'string' },
        dateModified: { type: 'string' },
        datePublished: { type: 'string' },
        _annotation: {
          type: 'object',
          properties: {
            sample_count: { type: 'integer' },
            sample_organism: { type: 'array', items: { type: 'string' } },
            sample_taxid: { type: 'array', items: { type: 'string' } },
            sample_host_organism: { type: 'array', items: { type: 'string' } },
            sample_host_organism_id: { type: 'array', items: { type: 'string' } },
            sample_host_disease: { type: 'array', items: { type: 'string' } },
            sample_host_disease_id: { type: 'array', items: { type: 'string' } },
            sample_host_location: { type: 'array', items: { type: 'string' } },
            sample_host_location_id: { type: 'array', items: { type: 'string' } },
            data_size: { type: 'string' },
            sample_ph_range: {
              type: 'object',
              properties: {
                min: { type: ['number', 'null'] },
                max: { type: ['number', 'null'] }
              }
            },
            sample_temperature_range: {
              type: 'object',
              properties: {
                min: { type: ['number', 'null'] },
                max: { type: ['number', 'null'] }
              }
            },
            completeness: { type: 'integer' },
            genome_count: { type: 'integer' }
          }
        },
        data_type: { type: 'string' },
        data_source: { type: 'string' },
        _dfast: { type: 'object', additionalProperties: true },
        has_analysis: { type: 'boolean' },
        _dfastqc: { type: 'object', additionalProperties: true },
        _bac2feature: {
          type: 'object',
          properties: {
            phenotypes: { type: ['string', 'null'] },
            cell_diameter: { type: 'number' },
            cell_length: { type: 'number' },
            doubling_h: { type: ['number', 'null'] },
            growth_tmp: { type: 'number' },
            optimum_tmp: { type: 'number' },
            optimum_ph: { type: 'number' },
            genome_size: { type: 'number' },
            gc_content: { type: 'number' },
            coding_genes: { type: 'number' },
            rRNA16S_genes: { type: 'number' },
            tRNA_genes: { type: 'number' },
            gram_stain: { type: 'integer' },
            sporulation: { type: 'integer' },
            motility: { type: 'number' },
            range_salinity: { type: ['number', 'null'] },
            facultative_respiration: { type: 'number' },
            anaerobic_respiration: { type: 'number' },
            aerobic_respiration: { type: 'number' },
            mesophilic_range_tmp: { type: 'number' },
            thermophilic_range_tmp: { type: 'number' },
            psychrophilic_range_tmp: { type: 'number' },
            bacillus_cell_shape: { type: 'number' },
            coccus_cell_shape: { type: 'number' },
            filament_cell_shape: { type: 'number' },
            coccobacillus_cell_shape: { type: 'number' },
            vibrio_cell_shape: { type: 'number' },
            spiral_cell_shape: { type: 'number' }
          }
        },
        _genome_taxon: { type: 'array', items: { type: 'string' } },
        quality: { type: 'integer' },
        quality_label: { type: 'string' }
      }
    }
  }
};

const projectResponseSchema = {
  type: 'object',
  properties: {
    index: {
      type: 'object',
      properties: {
        _index: { type: 'string' },
        _type: { type: 'string' },
        _id: { type: 'string' },
        _version: { type: 'integer' },
        _seq_no: { type: 'integer' },
        _primary_term: { type: 'integer' },
        _ignored: {
          type: 'array',
          items: { type: 'string' }
        },
        found: { type: 'boolean' },
        _source: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            identifier: { type: 'string' },
            organism: { type: ['string', 'null'] },
            title: { type: 'string' },
            description: { type: 'string' },
            "data type": { type: 'string' },
            organization: { type: 'string' },
            publication: {
              type: 'array',
              items: { type: 'object', additionalProperties: true }
            },
            properties: { type: ['object', 'null'], additionalProperties: true },
            dbXrefs: {
              type: 'array',
              items: { type: 'string' }
            },
            distribution: { type: ['string', 'null'] },
            Download: { type: ['string', 'null'] },
            status: { type: 'string' },
            visibility: { type: ['string', 'null'] },
            dateCreated: { type: 'string' },
            dateModified: { type: 'string' },
            _annotation: {
              type: 'object',
              properties: {
                sample_count: { type: 'integer' },
                sample_organism: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_taxid: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_organism: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_organism_id: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_disease: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_disease_id: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_location: {
                  type: 'array',
                  items: { type: 'string' }
                },
                sample_host_location_id: {
                  type: 'array',
                  items: { type: 'string' }
                },
                data_size: { type: 'string' },
                sample_ph_range: {
                  type: 'object',
                  properties: {
                    min: { type: ['number', 'null'] },
                    max: { type: ['number', 'null'] }
                  }
                },
                sample_temperature_range: {
                  type: 'object',
                  properties: {
                    min: { type: ['number', 'null'] },
                    max: { type: ['number', 'null'] }
                  }
                },
                genome_count: { type: 'integer' }
              }
            },
            has_analysis: { type: 'boolean' }
          }
        }
      }
    }
  }
};

const projectSearchResponseSchema = {
  type: 'object',
  properties: {
    took: { type: 'integer', description: '検索にかかった時間(ms)' },
    timed_out: { type: 'boolean' },
    _shards: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        successful: { type: 'integer' },
        skipped: { type: 'integer' },
        failed: { type: 'integer' }
      }
    },
    hits: {
      type: 'object',
      properties: {
        total: {
          type: 'object',
          properties: {
            value: { type: 'integer' },
            relation: { type: 'string' }
          }
        },
        max_score: { type: ['number', 'null'] },
        hits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _index: { type: 'string' },
              _type: { type: 'string' },
              _id: { type: 'string' },
              _score: { type: ['number', 'null'] },
              _ignored: { type: 'array', items: { type: 'string' } },
              // ここにプロジェクト詳細のスキーマを定義
              _source: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  identifier: { type: 'string' },
                  organism: { type: ['string', 'null'] },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  "data type": { type: ['string', 'null'] },
                  organization: { type: 'string' },
                  publication: { type: 'array', items: { type: 'object', additionalProperties: true } },
                  properties: { type: ['object', 'null'], additionalProperties: true },
                  dbXrefs: { type: 'array', items: { type: ['string', 'null'] } },
                  distribution: { type: ['string', 'null'] },
                  Download: { type: ['string', 'null'] },
                  status: { type: 'string' },
                  visibility: { type: ['string', 'null'] },
                  dateCreated: { type: 'string' },
                  dateModified: { type: 'string' },
                  _annotation: {
                    type: 'object',
                    properties: {
                      sample_count: { type: 'integer' },
                      sample_organism: { type: 'array', items: { type: 'string' } },
                      sample_taxid: { type: 'array', items: { type: 'string' } },
                      sample_host_organism: { type: 'array', items: { type: 'string' } },
                      sample_host_organism_id: { type: 'array', items: { type: 'string' } },
                      sample_host_disease: { type: 'array', items: { type: 'string' } },
                      sample_host_disease_id: { type: 'array', items: { type: 'string' } },
                      sample_host_location: { type: 'array', items: { type: 'string' } },
                      sample_host_location_id: { type: 'array', items: { type: 'string' } },
                      data_size: { type: 'string' },
                      sample_ph_range: {
                        type: 'object',
                        properties: {
                          min: { type: ['number', 'null'] },
                          max: { type: ['number', 'null'] }
                        }
                      },
                      sample_temperature_range: {
                        type: 'object',
                        properties: {
                          min: { type: ['number', 'null'] },
                          max: { type: ['number', 'null'] }
                        }
                      },
                      genome_count: { type: 'integer' }
                    }
                  },
                  has_analysis: { type: 'boolean' }
                }
              },
              sort: {
                type: 'array',
                items: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};

const genomeSearchResponseSchema = {
  type: 'object',
  properties: {
    took: { type: 'integer' },
    timed_out: { type: 'boolean' },
    _shards: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        successful: { type: 'integer' },
        skipped: { type: 'integer' },
        failed: { type: 'integer' }
      }
    },
    hits: {
      type: 'object',
      properties: {
        total: {
          type: 'object',
          properties: {
            value: { type: 'integer' },
            relation: { type: 'string' }
          }
        },
        max_score: { type: ['number', 'null'] },
        hits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _index: { type: 'string' },
              _type: { type: 'string' },
              _id: { type: 'string' },
              _score: { type: ['number', 'null'] },
              _source: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  identifier: { type: 'string' },
                  organism: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  "data type": { type: 'string' },
                  organization: { type: 'string' },
                  publication: { type: 'array', items: { type: 'object', additionalProperties: true } },
                  properties: {
                    type: 'object',
                    properties: {
                      assembly_accession: { type: 'string' },
                      bioproject: { type: 'string' },
                      biosample: { type: 'string' },
                      wgs_master: { type: 'string' },
                      refseq_category: { type: 'string' },
                      taxid: { type: 'string' },
                      species_taxid: { type: 'string' },
                      organism_name: { type: 'string' },
                      infraspecific_name: { type: 'string' },
                      isolate: { type: 'string' },
                      version_status: { type: 'string' },
                      assembly_level: { type: 'string' },
                      release_type: { type: 'string' },
                      genome_rep: { type: 'string' },
                      seq_rel_date: { type: 'string' },
                      asm_name: { type: 'string' },
                      asm_submitter: { type: 'string' },
                      gbrs_paired_asm: { type: 'string' },
                      paired_asm_comp: { type: 'string' },
                      ftp_path: { type: 'string' },
                      excluded_from_refseq: { type: 'string' },
                      relation_to_type_material: { type: 'string' },
                      asm_not_live_date: { type: 'string' },
                      assembly_type: { type: 'string' },
                      group: { type: 'string' },
                      genome_size: { type: 'string' },
                      genome_size_ungapped: { type: 'string' },
                      gc_percent: { type: 'string' },
                      replicon_count: { type: 'string' },
                      scaffold_count: { type: 'string' },
                      contig_count: { type: 'string' },
                      annotation_provider: { type: 'string' },
                      annotation_name: { type: 'string' },
                      annotation_date: { type: 'string' },
                      total_gene_count: { type: 'string' },
                      protein_coding_gene_count: { type: 'string' },
                      non_coding_gene_count: { type: 'string' },
                      pubmed_id: { type: 'string' }
                    }
                  },
                  dbXrefs: { type: 'array', items: { type: 'string' } },
                  distribution: { type: ['string', 'null'] },
                  Download: { type: ['string', 'null'] },
                  status: { type: 'string' },
                  visibility: { type: ['string', 'null'] },
                  dateCreated: { type: 'string' },
                  dateModified: { type: 'string' },
                  datePublished: { type: 'string' },
                  _annotation: {
                    type: 'object',
                    properties: {
                      sample_count: { type: 'integer' },
                      sample_organism: { type: 'array', items: { type: 'string' } },
                      sample_taxid: { type: 'array', items: { type: 'string' } },
                      sample_host_organism: { type: 'array', items: { type: 'string' } },
                      sample_host_location: { type: 'array', items: { type: 'string' } },
                      data_size: { type: 'string' },
                      sample_ph_range: {
                        type: 'object',
                        properties: {
                          min: { type: ['number', 'null'] },
                          max: { type: ['number', 'null'] }
                        }
                      },
                      sample_temperature_range: {
                        type: 'object',
                        properties: {
                          min: { type: ['number', 'null'] },
                          max: { type: ['number', 'null'] }
                        }
                      },
                      completeness: { type: 'integer' },
                      genome_count: { type: 'integer' }
                    }
                  },
                  data_type: { type: 'string' },
                  data_source: { type: 'string' },
                  _dfast: { type: 'object', additionalProperties: true },
                  has_analysis: { type: 'boolean' },
                  _dfastqc: { type: 'object', additionalProperties: true },
                  _bac2feature: {
                    type: 'object',
                    properties: {
                      phenotypes: { type: ['string', 'null'] },
                      cell_diameter: { type: ['number', 'null'] },
                      cell_length: { type: ['number', 'null'] },
                      doubling_h: { type: ['number', 'null'] },
                      growth_tmp: { type: ['number', 'null'] },
                      optimum_tmp: { type: ['number', 'null'] },
                      optimum_ph: { type: ['number', 'null'] },
                      genome_size: { type: ['number', 'null'] },
                      gc_content: { type: ['number', 'null'] },
                      coding_genes: { type: ['number', 'null'] },
                      rRNA16S_genes: { type: ['number', 'null'] },
                      tRNA_genes: { type: ['number', 'null'] },
                      gram_stain: { type: ['integer', 'null'] },
                      sporulation: { type: ['integer', 'null'] },
                      motility: { type: ['number', 'null'] },
                      range_salinity: { type: ['number', 'null'] },
                      facultative_respiration: { type: ['number', 'null'] },
                      anaerobic_respiration: { type: ['number', 'null'] },
                      aerobic_respiration: { type: ['number', 'null'] },
                      mesophilic_range_tmp: { type: ['number', 'null'] },
                      thermophilic_range_tmp: { type: ['number', 'null'] },
                      psychrophilic_range_tmp: { type: ['number', 'null'] },
                      bacillus_cell_shape: { type: ['number', 'null'] },
                      coccus_cell_shape: { type: ['number', 'null'] },
                      filament_cell_shape: { type: ['number', 'null'] },
                      coccobacillus_cell_shape: { type: ['number', 'null'] },
                      vibrio_cell_shape: { type: ['number', 'null'] },
                      spiral_cell_shape: { type: ['number', 'null'] }
                    }
                  },
                  _genome_taxon: { type: 'array', items: { type: 'string' } },
                  quality: { type: 'integer' },
                  quality_label: { type: 'string' }
                }
              },
              sort: { type: 'array', items: { type: 'number' } }
            }
          }
        }
      }
    }
  }
};

// RESTのパラメータを引数にsimple_es_query_generatorサービスが返すESのクエリを利用して
// Elasticsearchの検索を行う
fastify.get('/dev/genome/search',  {
    schema: {
      "operationId": "searchGenomeIndexWithQueryParameters",
      "summary": "search genome index with query parameters",
      "description": "REST-style URL parameters to the API, convert them into an Elasticsearch query, search the genome index, and return the search results in JSON format.",
    querystring: {
      type: 'object',
      properties: {
        sort: {
          type: 'string',
          enum: ['dateCreated', 'dateModified', 'datePublished', 'identifier'],
          default: 'dateCreated',
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
          description: 'Comma-separated list of quality scores. Each value must be an integer between 0 and 5 (inclusive). Multiple values can be specified by separating them with commas. Examples: "0,1,2" or "3,4,5".',
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
          type: 'string',
          description: 'Comma-separated list of data sources to filter by. Allowable values are INSDC and RefSeq. Multiple values can be specified by separating them with commas.',
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

fastify.get('/project/_doc/:id', {
  "schema": {
    "operationId": "getProjectByID",
    "summary": "API that retrieves a project index document by its ID",
    "description": "Fetches a specific project index document from Elasticsearch using the provided ID.",
    "params": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The ID of the project index document to retrieve"
        }
      },
      "required": ["id"]
    },
    "response": {
      200: projectResponseSchema
    }
  }
}, async (req, reply) => {
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

fastify.get('/project/_search', {
  "schema": {
    "operationId": "searchProjectIndexByURIParameter",
    "summary": "API that mediates simple query string searches against the project index",
    "description": "Performs a search on the project index in Elasticsearch using a simple query string provided as a URI parameter.",
    "querystring": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "The query string to search for"
        }
      },
      "required": ["q"]
    },
    "response": {
      200: projectSearchResponseSchema
    }
  }
},async (req, reply) => {
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

fastify.post('/project', {
  "schema": {
    "operationId": "searchProjectIndexWithESQueryBody",
    "summary": "API that performs searches against the project index using a Elasticsearch request body",
    "description": "Executes a search on the project index in Elasticsearch using a Elasticsearch query provided in the request body.",
    "response": {
      200: projectSearchResponseSchema
    }
  } 
}, async (req, reply) => {
  const res = await client.search({
    "index": "project",
    "body": req.body
  })

  return res
})


fastify.get('/genome/_doc/:id', {
  "schema": {
    "operationId": "getGenomeByID",
    "summary": "API that retrieves a genome index document by its ID",
    "description": "Fetches a specific genome index document from Elasticsearch using the provided ID.",
    "params": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The ID of the genome index document to retrieve"
        }
      },
      "required": ["id"]
    },
    "response": {
      200: genomeResponseSchema
    }
  }
}, async (req, reply) => {
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

fastify.get('/genome/_search',{
  "schema": {
    "operationId": "searchGenomeIndexByURIParameter",
    "summary": "API that mediates simple query string searches against the genome index",
    "querystring": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "The query string to search for"
        }
      },
      "required": ["q"]
    },
    "response": {
      200: genomeSearchResponseSchema
    }
  }
}, async (req, reply) => {
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

fastify.post('/genome', {
  "schema": {
    "operationId": "searchGenomeIndexWithESQueryBody",
    "summary": "API that performs searches against the genome index using a Elasticsearch request body",
    "description": "Executes a search on the genome index in Elasticsearch using a Elasticsearch query provided in the request body.",
    "response": {
      200: genomeSearchResponseSchema
    }
  } 
}, async (req, reply) => {
  const res = await client.search({
    "index": "genome",
    "body": req.body
  })

  return res
})

fastify.get('/plotly_data', {
  "schema": {
    "operationId": "getTaxonomicComparisonPlotlyData",
    "summary": "Retrieve taxonomic comparison data formatted for Plotly visualization",
    "querystring": {
      "type": "object",
      "properties": {
        "view": {
          "type": "string",
          "description": "The view identifier for the type of plotly data to retrieve"
        },
        "id": {
          "type": "string",
          "description": "Comma-separated list of sample IDs to include in the taxonomic comparison"
        }
      },
      "required": ["id"]
    },
    "response": {
      200: {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "x": {
              "type": "array",
              "items": { "type": "string" }
            },
            "y": {
              "type": "array",
              "items": { "type": "number" }
            },
            "name": { "type": "string" },
            "type": { "type": "string" }
          }
        }
      }
    }
  }
}, async (req) => {
    const view_id = req.query.view;
    const sample_id = req.query.id;

    if (view_id != ""){
      // viewを指定し対応する処理の結果を返す実装を想定
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

fastify.get('/dl/project/metadata/:ids', {
  "schema": {
    "operationId": "downloadProjectMetadata",
    "summary": "Download project metadata for specified IDs in TSV or JSON format",
    "params": {
      "type": "object",
      "properties": {
        "ids": {
          "type": "string",
          "description": "Comma-separated list of project IDs to download metadata for"
        }
      },
      "required": ["ids"]
    },
    "querystring": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["tsv", "json"],
          "default": "tsv",
          "description": "Specify the format of the downloaded metadata (tsv or json)"
        }
      }
    },
    "response": {
      200: {
        "description": "Project metadata file in the requested format",
        "type": "string"
      }
    }
  }
},async (req, rep) => {
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

fastify.get('/dl/genome/metadata/:ids', {
  "schema": {
    "operationId": "downloadGenomeMetadata",
    "summary": "Download genome metadata for specified IDs in TSV or JSON format",
    "params": {
      "type": "object",
      "properties": {
        "ids": {
          "type": "string",
          "description": "Comma-separated list of genome IDs to download metadata for"
        }
      },
      "required": ["ids"]
    },
    "querystring": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["tsv", "json"],
          "default": "tsv",
          "description": "Specify the format of the downloaded metadata (tsv or json)"
        }
      }
    },
    "response": {
      200: {
        "description": "Genome metadata file in the requested format",
        "type": "string"
      }
    }
  }
}, async (req, rep) => {
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

// TODO: 現在サイトでDLに利用されているか確認する
fastify.get('/dl/project/composition/:ids', {
  "schema": {
    "operationId": "downloadTaxonomicCompositionsByIds",
    "summary": "Download the taxonomic composition files for given project IDs as a ZIP archive",
    "params": {
      "type": "object",
      "properties": {
        "ids": {
          "type": "string",
          "description": "Comma-separated list of project IDs to download compositions for"
        }
      },
      "required": ["ids"]
    },
    "response": {
      200: {
        "description": "ZIP archive containing the composition files for the requested project IDs",
        "type": "string"
      }
    }
  }
}, async (req, rep) => {
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

fastify.get('/dl/sequence/:type(^(genome|cds|protein)$)/:ids', {
  "schema": {
    "operationId": "downloadSequencesByTypeAndIds",
    "summary": "Download sequence files of specified type for given genome IDs as a ZIP archive",
    "params": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["genome", "cds", "protein"],
          "description": "Type of sequence to download (genome, cds, or protein)"
        },
        "ids": {
          "type": "string",
          "description": "Comma-separated list of genome IDs to download sequences for"
        }
      },
      "required": ["type", "ids"]
    },
    "response": {
      200: {
        "description": "ZIP archive containing the requested sequence files",
        "type": "string"
      }
    }
  }
}, async (req, rep) => {
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
fastify.get('/genome/mbgd/:genome_id',{
  "schema": {
    "operationId": "getMBGDModulesByGenomeID",
    "summary": "Retrieve MBGD module data for a specified genome_id",
    "description": "Returns the MBGD module ID and label data corresponding to the specified genome_id",
    "params": {
      "type": "object",
      "properties": {
        "genome_id": {
          "type": "string",
          "description": "Target genome ID to retrieve the associated MBGD KEGG modules"
        }
      },
      "required": ["genome_id"]
    },
    "response": {
      200: {
        "description": "Successful response with MBGD module list",
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "label": { "type": "string" }
          }
        }
      }
    }
  }
}, async (req, rep) => {
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