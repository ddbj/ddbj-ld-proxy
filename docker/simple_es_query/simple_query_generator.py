from typing import List
import logging

logging.basicConfig(filename='/app/logs/server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
<<<<<<< HEAD
=======

>>>>>>> c562df2 (rest api converter  updated)

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
    - track_total_hitsはデフォルトでTrueとする

    # TODO:
    - 文字列検索がwildcardクエリの部分一致が良いのか？termクエリで良いのでは？結果を比較して検討する。
    - 数値フィールドはレンジクエリでしか検索できない（デフォルトが文字列の部分一致になる）ので数値の場合eq条件で検索できるようにする
    - aggs query：フィールドの型によって戻るべき集約の形式が違ってくるので、全部
        - 数値：aggs.stats min,max,avg,sum
        - テキストフィールド: aggs.terms 文章の頻度
        - *dateのhistogramを表示するなどrangeで取得したい場合はaggs.histogramのような別のクエリが必要
    """

    def __init__(self):
        self.keyword_attributes = ["keyword"]
        self.keyword_fields = ["identifier", "title", "description", "properties.assembly_accession", "properties.bioproject", "properties.biosample", "MBGD ortholog cluster ID", "Phenotype ID"]
        # reserved_attributesはそのままクエリに追加する。直整数を想定する
        self.reserved_attributes = ["size", "from", "sort"]
        self.track_total_hits = True

    def match(self, field:str, value: str) -> dict:
        """
        matchクエリのパーツを生成する
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

    def should(self, field: str, values: List[str]) -> dict:
        """
        should条件で複数の値で検索するクエリのパーツを生成する
        OR条件はカンマで与えられたクエリの値を分解して生成する
        Returns:
            dict: 
        """
        field = field_mapping(field)
        should_query = [{"wildcard": {f"{field}.keyword": f"*{v}*"}} for v in values]
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
        query_template = {
            "query": {"bool": {"must": bool_must_list}}
        }
        # (key,value)のリストとしてクエリを受け取るパーツを生成する
        for k,v in query_items.items():
            # keyword属性の場合は全属性あるいは指定した属性を検索する
            if k in self.keyword_attributes:
                bool_must_list.append(self.multi_match(v))
            # valueにカンマが含まれる場合、カンマで単語を分割しOR条件のクエリを生成する
            elif "," in v:
                values = v.split(",")
                # TODO: should確認
                bool_must_list.append(self.should(k, values))

            # 属性が予約語の場合はそのままクエリに追加する
            elif k in self.reserved_attributes:
                logging.info("reserved_attributes")
                # reserved_attributesの値はintに変換して追加する
                query_template[k] = int(v)
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
                bool_must_list.append(self.match(k, v))
        # 固定値
        query_template["track_total_hits"] = self.track_total_hits
        # 完成されたクエリを返す
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
            return "_annotation.sample_organism"
        case "mag_completeness":
            return "_annotation.completeness"
        case "host_taxon":
            return "_annotation.sample_host_organism"
        case "quality":
            return "quality"
        case "environment":
            # project検索の場合はsample_organism
            return "_annotation.sample_organism"
        case "bioproject":
            return "properties.bioproject"
        case "biosample":
            return "properties.biosample"
        case "identifier":
            return "identifier"
        case _:
            return key   

def test_query(req:dict)->dict:
    query_generator = SimpleQueryGenerator()
    query = query_generator.create_query(req)
    return query
