import { Client } from '@elastic/elasticsearch'

const client = new Client({
    node: process.env.ELASTICSEARCH_HOST,
})

// for DL metadata API get_metadata ~ get_annotation
const get_metadata = async function (ids, type) {
  const id_list = ids.split(",")
  const res = await client.search({
    "index": `${type}`,
    "body":  {
      "query": {
              "terms" : {
                "_id": id_list
              },
      }
    }
  })
  const data = res.hits.hits
  if (type=="project"){
    const metadatas = project_metadata(data);
    return metadatas
  } else if (type=="genome"){
    const metadatas = genome_metadata(data);
    return metadatas
  } else {
    return {}
  }
}
  
const project_metadata = function (results) {
  const metadatas = results.map(result => {
    const metadata = {};
    metadata.identifier = result._source.identifier;
    metadata.title = result._source.title;
    metadata.description = result._source.description;

    // アノテーション処理
    const annotations = result._source._annotation;
    if (annotations) {
      // 属性リストに基づいたループ処理
      const props = [
        "sample_organism",
        "sample_taxid",
        "sample_host_organism",
        "sample_host_organism_id",
        "sample_host_disease",
        "sample_host_disease_id",
        "sample_host_location",
        "sample_ph_range",
        "sample_temperature_range",
      ];
      props.forEach(prop => {
        metadata[prop] = get_annotation(annotations, prop);
      });
    }
    return metadata;
  });
  return metadatas;
}

const genome_metadata = function (results) {
  const metadatas = results.map(result => {
    const metadata = {};
    metadata.identifier = result._source.identifier;
    metadata.organism = result._source.organism;
    metadata.quality = result._source.quality;
    const properties = result._source.properties;
    if (properties) {
      const props = [
        "bioproject",
        "biosample",
        "species_taxid"
      ]
      props.forEach(prop => {
        metadata[prop] = get_annotation(properties, prop);
      });
    }
    const annotations = result._source._annotation;
    if (annotations) {
      const ann_props = [
        "sample_organism",
        "sample_taxid",
        "sample_host_organism",
        "sample_host_organism_id",
        "sample_host_disease",
        "sample_host_disease_id",
        "sample_host_location",
        "sample_ph_range",
        "sample_temperature_range",
      ];
      ann_props.forEach(prop => {
        metadata[prop] = get_annotation(annotations, prop);
      });
    }
    const dfast = result._source._dfast;
    if (dfast){
      const dfast_props = [
        "Total Sequence Length (bp)",
        "Number of Sequences",
        "Longest Sequences (bp)",
        "N50 (bp)",
        "GCcontent (%)",
        "Number of CDSs",
        "Coding Ratio (%)",
        "Number of rRNAs",
        "Number of tRNAs"
      ];
      dfast_props.forEach(prop => {
        metadata[prop] = get_annotation(dfast, prop);
      });
    };
    return metadata;
  });
  return metadatas;
}
  
const get_annotation = function (annotations, property) {
  const annotation = annotations[property]
  if (annotation) {
      // 型によって処理を分岐
      if (Array.isArray(annotation)) {
      // リストの場合はカンマ区切り文字列に変換
      return annotation.join(",");
      } else if (typeof annotation === "object") {
      // オブジェクトの場合はJSON文字列に変換
      return JSON.stringify(annotation);
      } else {
      // その他の場合はそのまま返す
      return annotation;
      }
  } else {
      return null;
  }
}
  
const dict2tsv = function (data) {
  if (typeof data[0] !== "object") {
    throw new Error("data[0] is not an object");
  } 
  const columnNames = Object.keys(data[0]);  
  let records = data.map(row => {
    // 文字列が存在する場合改行コードを置き換える
    const record = columnNames.map(n => row[n] ? row[n].replace(/\n/g, '\\n'): row[n])
    return record.join("\t");
  });
  records.unshift(columnNames.join("\t"))
  return records.join("\n")
}
  
const helper = {
  get_metadata,
  dict2tsv,
}

export default helper
