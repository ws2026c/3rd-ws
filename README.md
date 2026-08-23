### System Operation
- 1시간 안에 최소한의 서비스 동작은 가능하도록 설계
- (유의 사항) EC2 유형이 **당일** 바뀔 가능성이 매우 높음
  - 재작년 : t3.micro -> t3.small
  - 작년 : t3.medium -> c5.large

  - 문제지에 명시되지 않은 인스턴스 유형을 사용할 경우 문제가 발생하니 당일 바뀐다면 EKS 노드그룹 인스턴스 유형 외에도 Node Pool에서 바꿔줘야함


- VPC 구성 : Public Subnet 2 / Private Subnet 2 (NAT G/W 1개) 구성 권장 / S3 게이트웨이 활성화는 필수

- RDS
  - 보안 그룹, 사용자 지정 파라미터 그룹, 서브넷 그룹을 미리 생성 후 진행
  - 권장 파라미터 그룹 (max_prepared_stmt_count -> 약 60000, innodb_flush_log_at_trx_commit -> 약 2, max_connections -> 200~600 정도)
  - MySQL 접속 명령 : mysql -h <RDS_URL> -u <RDS_USERNAME> -p
    - 문제지를 참고하여 테이블 2개 생성
  - MySQL 인덱스 삽입 : CREATE INDEX email_index ON user (email);
  - MySQL 데이터 대량 삽입 : source load_user.dump
  
- CloudFront와 S3 연결 시 요청되는 경로에 따라 설정이 다름
  - 예1: 문제에서 CloudFront로 접근하는 경로는 /images 등이지만 실제 S3에 저장되는 경로가 / 이라면
    첨부된 CloudFront Function을 적절히 설정하여 배포 후 뷰어 응답에 적용 (예: /images 로 들어온 요청을 Function에서 /로 변환시켜줘야함)
  - 예2: CloudFront로 접근하는 경로와 S3에 저장되는 경로가 같다면 CloudFront Function과 원본 경로 설정이 필요 없음
  - 예3: CloudFront로 접근하는 경로가 / 이고, S3에 저장되는 경로가 /images 등이라면 CloudFront Function 없이 S3의 원본 경로를 /images 등으로 변경

- Dockerfile 예시 (예: stress)
  ```dockerfile
  FROM public.ecr.aws/amazonlinux/amazonlinux:2023

  WORKDIR /app
  
  COPY stress .
  
  RUN yum install -y shadow-utils
  
  RUN chmod +x ./stress
  
  CMD ["./stress"]
  ```

- EKS 및 app에 관한 내용은 EKS.md 참고
- CloudFront 및 WAF에 관한 내용은 CDN.md 참고
- 모니터링 관련 내용은 Monitoring.md 참고

---

- 작년 기준 단순 트래픽량은 stress가 가장 컸으며, product, user에는 트래픽과 함께 비정상 요청 발생
- 1시간 안에 구축을 못끝낸다면 EKS와 CloudFront 부분을 먼저 구축하는게 우선임 (최소한 요청을 받을 준비가 되어있어야 함)
