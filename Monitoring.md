### System Operation • Monitoring

**Logging**

- /healthcheck를 제외한 3개 앱의 로그를 추출하기 위해 Fluent-bit 사용

```bash
kubectl create ns amazon-cloudwatch

eksctl create iamserviceaccount \
  --name fluent-bit \
  --namespace amazon-cloudwatch \
  --cluster $CLUSTER_NAME \
  --role-name FluentBitCloudWatchRole \
  --attach-policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy \
  --override-existing-serviceaccounts \
  --approve
```

- fluent-bit.yaml로 적용

이후 CloudWatch의 로그 분석에서 아래 쿼리로 로그 조회

- 전체 로그 조회
```graphql
SOURCE '/eks/application-logs' START=-1w END=0s
| fields @timestamp, @message
| filter @message like /user-deploy/ or @message like /user/
| filter @message not like /output:cloudwatch_logs/
| sort @timestamp desc
| limit 200
```

- 4xx, 5xx 로그 조회
```graphql
SOURCE '/eks/application-logs' START=-1w END=0s
| fields @timestamp, @message
| filter (@message like /user-deploy/ or @message like /user/)
| filter @message not like /output:cloudwatch_logs/
| filter @message like /( 4\d{2} | 5\d{2} | "status":\s*[45]\d{2}|HTTP\/[12]\.[01]" [45]\d{2})/
| sort @timestamp desc
| limit 200
```

---

**모니터링 솔루션**

1. ALB Access Log와 CloudFront Log를 S3에 저장 후 Athena Query로 분석
   - 예: SELECT * FROM cloudfront_standard_logs WHERE elb_status_code = 500
2. K9S 이용 (가장 간단)
   - 클러스터 연결이 된 상태에서 다음 명령 입력
     ```bash
     K9S_LATEST=$(curl --silent "https://api.github.com/repos/derailed/k9s/tags" | jq -r '.[0].name')
     curl --silent --location "https://github.com/derailed/k9s/releases/download/${K9S_LATEST}/k9s_Linux_amd64.tar.gz" | tar xz -C /tmp
     mv /tmp/k9s /usr/local/bin
     k9s version
     k9s
     ```
3. 대시보드 구축
   - ALB의 4xx, 5xx 개수 등 CloudWatch DashBoard를 이용해 지표 실시간 관찰
