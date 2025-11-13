from typing import List
import logging
from starlette.requests import Request
from starlette.responses import JSONResponse
import json

logging.basicConfig(filename='/app/logs/server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

class SimpleQueryGenerator:
    """
    # 概要
    - REST APIの入力をElasticsearchのgenomeインデックス用のsearchクエリに変換する

    # 仕様
    - Elasticsearchのboolクエリのmust条件下に動的に各種クエリを追加し最終的なESのクエリを生成する
    - keyword属性として設定した属性（ex. keywords=）を受け取った場合はkeyword_fieldsに設定した複数のフィールドを検索するクエリを返す
    - 通常の検索はwildcardクエリで文字列の部分一致検索を行う (要検討)
    - クエリの値をカンマで区切ると区切った文字のOR条件となるshouldクエリを生成する
    - レンジクエリを利用するときは属性の接尾語に*_gte, *_lteを付加した属性を用いる
    - size,from,sortなどElasticsearchの予約語となる様な属性はそのまま最終的なクエリに追加する
    - クエリの文字列に"*"が含まれる場合"通常のmatchクエリに代わってワイルドカードクエリを利用する
    - track_total_hitsはデフォルトでTrueとする

    # TODO:
    - 文字列検索がwildcardクエリの部分一致が良いのか？termクエリで良いのでは？結果を比較して検討する。
    - 数値フィールドはレンジクエリでしか検索できない（デフォルトが文字列の部分一致になる）ので数値の場合eq条件で検索できるようにする
    - wildcardクエリが空白を含む文字列を正しく処理できるか確認する
    """

    def __init__(self):
        self.keyword_attributes = ["keyword"]
        self.keyword_fields = ["identifier.keyword", "title.keyword", "description.keyword", "organization.keyword", "data type", "properties.assembly_accession.keyword", 
                               "properties.bioproject.keyword", "properties.biosample.keyword", "MBGD ortholog cluster ID.keyword", "Phenotype ID.keyword",
                               "properties.organism_name.keyword", "properties.species_taxid.keyword", "_annotation.sample_organism.keyword", "_annotation.sample_taxid.keyword",
                               "_annotation.sample_host_organism.keyword","_annotation.sample_host_disease.keyword", "_annotation.sample_host_location.keyword",
                               "_meo.label", "_genome_taxon"]
        # reserved_attributesはそのままクエリに追加する。直整数を想定する
        self.reserved_attributes = ["size", "from", "sort", "order"]
        # matchクエリのを生成する際にワイルドカードを利用するかどうか
        self.is_wildcard = False
        self.track_total_hits = True

    def match(self, field:str, value: str) -> dict:
        """
        matchクエリのパーツを生成する,空白はand条件で検索する
        Returns:
            dict: 
        """
        field = field_mapping(field)
        '''        
        q = {
            "match": {
                field: {
                    "query": f"{value}",
                    "operator": "and"
                }
            }
        }
        '''
        q = {
            "term": {field + ".keyword": value}
        }

        return q
    
    def wildcard(self, field:str, value: str) -> dict:
        """
        ワイルドカードクエリのパーツを生成する
        Returns:
            dict: 
        """
        field = field_mapping(field)
        q = {
            "wildcard": {
                f"{field}.keyword": f"*{value}*"
            }
        }
        return q

    def should(self, field: str, values: List[str], is_wildcard=False) -> dict:
        """
        should条件で複数の値で検索するクエリのパーツを生成する
        OR条件はカンマで与えられたクエリの値を分解して生成する
        Returns:
            dict: 
        """
        field = field_mapping(field)
        if is_wildcard:
            should_query = [{"wildcard": {f"{field}": f"{v}"}} for v in values]
        else:
            should_query = [{"match": {field: v}} for v in values]
        q = {
            "bool":{
                "should":should_query
            }
        }
        return q

    def range(self, field: str, lte: str, gte: str) -> dict:
        """
        *_gte,*_lteを接尾語として追加された属性に対して
        レンジクエリを生成する
        Returns:
            diclst: 
        """
        field = field_mapping(field)
        if lte:
            q = {"range": {
                    field: {
                        "lte": lte
                    }
                }
            }

        elif gte:
            q = {"range": {
                    field: {
                        "gte": gte
                    }
                }
            }
        return q

    def multi_match(self, keyword: str) -> dict:
        """
        コンテンツ全体のテキスト検索のようなマルチフィールドを対象とした検索クエリのパーツを返す
        """
        query = {
                "multi_match": {
                    "query": keyword,
                    "fields": self.keyword_fields
                }
        }
        return query
    
    def create_query(self, query_items) -> dict:
        bool_must_list = []
        # queryによりquery_templateは初期化されるケースがある
        query_template = {
            "query": {"bool": {"must": bool_must_list}},
            "track_total_hits": True 
        }
        if len(query_items) == 0:
            bool_must_list.append({"match_all": {}})
            return query_template
        # query以外の属性のパラメーターのみが指定された場合の処理
        elif set(query_items.keys()).issubset(set(["size", "sort", "from", "order"])):
            query_template = {
                "query": {"match_all": {}},
                "track_total_hits": True 
            }
            # size,sort,fromのみが指定された場合のmatch_all()クエリを生成するようにする
            for k,v in query_items.items():
                # sortとorderは "sort": {"dateCreated": {"order": "desc"}}, の形に変換する必要がある
                if k == "order":
                    continue
                elif k == "sort":
                    order = query_items.get("order", "desc")
                    query_template["sort"] = {v: {"order": order}}
                else:
                    query_template[k] = int(v)
            #print("query_template for only reserved attributes:", json.dumps(query_template, ensure_ascii=False, default=str))
            return query_template
        else:
            #print("else branch entered with query_items:", json.dumps(query_items, ensure_ascii=False, default=str))
            # (key,value)のリストとしてクエリを受け取るパーツを生成する
            for k,v in query_items.items():
                #print(f"Processing key:{k}, value:{v}")
                # wildcardフラグ設定
                v = str(v)
                is_wildcard = "*" in v            
                # sortとorderは "sort": {"dateCreated": {"order": "desc"}}, の形に変換する必要がある
                if k == "order":
                    continue
                elif k == "sort":
                    order = query_items.get("order", "desc")
                    query_template["sort"] = {v: {"order": order}}
                elif k in self.reserved_attributes:
                    #print(k, "is reserved attribute, adding directly to query_template")
                    query_template[k] = int(v)
                # keyword属性の場合は全属性あるいは指定した属性を検索する
                elif k in self.keyword_attributes:
                    bool_must_list.append(self.multi_match(v))
                # quqlity属性の特別処理
                elif k == "quality":
                    # quality属性はカンマ区切りの整数リストとして処理する
                    int_values = [int(q.strip()) for q in v.split(",")]
                    bool_must_list.append({
                        "terms": {
                            "quality": int_values
                        }
                    })
                # valueにカンマが含まれる場合、カンマで単語を分割しOR条件のクエリを生成する
                elif "," in v:
                    values = v.split(",")
                    # TODO: should確認
                    bool_must_list.append(self.should(k, values, is_wildcard))

                # レンジクエリの判定と処理
                # 同じ属性に対して_gteと_lteが同時に指定された場合は一つのレンジクエリを生成する
                elif k.endswith("_gte"):
                    field = k.replace("_gte", "")
                    bool_must_list.append(self.range(field, lte=None, gte=v))
                # _gteまたは_lteの属性が指定された場合はレンジクエリを生成する
                elif k.endswith("_lte"):
                    field = k.replace("_lte", "")
                    bool_must_list.append(self.range(field, lte=v, gte=None))

                # それ以外の場合はmatchクエリを生成する
                else:
                    if is_wildcard:
                        bool_must_list.append(self.wildcard(k, v))
                    else:
                        bool_must_list.append(self.match(k, v))
            # 固定値
            query_template["track_total_hits"] = self.track_total_hits
            # 完成されたクエリを返す
            #print("Generated query:", json.dumps(query_template, ensure_ascii=False, default=str))
            return query_template


def field_mapping(key:str) -> str:
    """
    フォーム、クエリっパラメータのフィールドとインデックスをadhocに設定する必要がある!
    REST APIの入力のキーを受け取り、
    実際のElasticsearchインデックスのフィールド名に変換して返す。
    例外としてkeyword属性や予約語などは、クラスで定義したテキストフィールを利用するあるいはそのまま返す。
    """
    match key:
        case "genome_taxon":
            return "_genome_taxon"
        case "mag_completeness":
            return "_annotation.completeness"
        case "host_taxon":
            return "_annotation.sample_host_organism"
        case "quality":
            return "quality"
        case "environment":
            # project検索の場合はsample_organism
            return "_meo.label"
        case "bioproject":
            return "properties.bioproject"
        case "biosample":
            return "properties.biosample"
        case "identifier":
            return "identifier"
        case "data_source":
            return "data_source"
        case _:
            return key   

def test_query(req:dict)->dict:
    query_generator = SimpleQueryGenerator()
    query = query_generator.create_query(req)
    return query
