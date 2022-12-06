#!/bin/bash
echo "Starting Elasticsearch..."
bash /usr/local/bin/docker-entrypoint.sh &
echo "Elasticsearch started."

while :
do
  health="$(curl -fsSL "localhost:9200/_cat/health?h=status")"
  if [[ "$health" == "green" ]] || [[ "$health" == "yellow" ]]; then
    break
  fi
  sleep 1
done

echo "Start to input initial data."

# BioProjectのみマッピングを試す
# BIOPROJECTのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/bioproject_mapping -d @/usr/share/elasticsearch/config/templates/bioproject-mapping.json > /dev/null 2>&1

echo "Finish to input BioProject"


:<<'#COMMENT_OUT'
# BIOSAMPLEのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/biosample_mapping -d @/usr/share/elasticsearch/config/templates/biosample-mapping.json > /dev/null 2>&1

echo "Finish to input BioSample"


# DRAのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_submission_mapping -d @/usr/share/elasticsearch/config/templates/sra-submission-mapping.json > /dev/null 2>&1

echo "Finish to input Submission"

#COMMENT_OUT

:<<'#COMMENT_OUT'
# JGAのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/jga_study_mapping -d @/usr/share/elasticsearch/config/templates/jga-study-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/jga_dataset_mapping -d @/usr/share/elasticsearch/config/templates/jga-dataset-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/jga_policy_mapping -d @/usr/share/elasticsearch/config/templates/jga-policy-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/jga_dac_mapping -d @/usr/share/elasticsearch/config/templates/jga-dac-mapping.json > /dev/null 2>&1
#COMMENT_OUT


:<<'#COMMENT_OUT'
# BIOSAMPLEのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/biosample_mapping -d @/usr/share/elasticsearch/config/templates/biosample-mapping.json > /dev/null 2>&1

# DRAのマッピング
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_submission_mapping -d @/usr/share/elasticsearch/config/templates/sra-submission-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_experiment_mapping -d @/usr/share/elasticsearch/config/templates/sra-experiment-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_analysis_mapping -d @/usr/share/elasticsearch/config/templates/sra-analysis-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_run_mapping -d @/usr/share/elasticsearch/config/templates/sra-run-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_study_mapping -d @/usr/share/elasticsearch/config/templates/sra-study-mapping.json > /dev/null 2>&1
curl -H "Content-Type:application/json" -XPUT localhost:9200/_index_template/sra_sample_mapping -d @/usr/share/elasticsearch/config/templates/sra-sample-mapping.json > /dev/null 2>&1
#COMMENT_OUT

echo "Finish to input initial data."
tail -f /dev/null
                                                                                                                                                                               
                     