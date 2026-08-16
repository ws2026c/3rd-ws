# 3과제 구성 유의사항

- 권장 파라미터 그룹 (max_prepared_stmt_count -> 약 60000, innodb_flush_log_at_trx_commit -> 약 2, max_connections -> 200 이상)

- CloudFront와 S3 연결 시 요청되는 경로에 따라 설정이 다름
  - 예1: 문제에서 CloudFront로 접근하는 경로는 /images 등이지만 S3에 저장되는 경로가 / 이라면
    첨부된 CloudFront Function을 적절히 설정하여 배포 후 뷰어 응답에 적용 (/images 로 들어온 요청을 내부에서 /로 변환시켜줘야함)
  - 예2: CloudFront로 접근하는 경로와 S3에 저장되는 경로가 같다면 CloudFront Function과 원본 경로 설정이 필요 없음
  - 예3: CloudFront로 접근하는 경로가 / 이고, S3에 저장되는 경로가 /images 등이라면
    CloudFront Function 없이 S3의 원본 경로를 /images 등으로 변경
