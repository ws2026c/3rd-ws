### System Operation • CDN

**CloudFront**

CloudFront를 생성하는 과정에서 WAF를 생성하며 원본은 S3로 생성

다음 부분 유의
- 예1: 문제에서 CloudFront로 접근하는 경로는 /images 등이지만 실제 S3에 저장되는 경로가 / 이라면 첨부된 CloudFront Function을 적절히 설정하여 배포 후 뷰어 응답에 적용 (예: /images 로 들어온 요청을 Function에서 /로 변환시켜줘야함)
    - 함수는 cloud_func.js 참고
- 예2: CloudFront로 접근하는 경로와 S3에 저장되는 경로가 같다면 CloudFront Function과 원본 경로 설정이 필요 없음
- 예3: CloudFront로 접근하는 경로가 / 이고, S3에 저장되는 경로가 /images/ 등이라면 CloudFront Function 없이 S3의 원본 경로를 /images 등으로 변경

ALB 원본 생성
- 프로토콜 : HTTP
- 원본 경로 없음
- 최종적으로 원본은 S3, ALB


동작 생성

- 기본값(기본 생성) -> S3
  - 캐싱 활성화

- Stress -> ALB
  - 경로 : /v1/stress*
  - 캐싱 X
  - 원본 요청 정책 : AllViewerExceptHostHeader

- Product -> ALB
  - 경로 : /v1/product*
  - 캐싱 : 사용자 지정
      - 사용자 정의 캐시 정책을 생성하여 id 쿼리 파라미터를 캐싱하는 정책 생성
  - 원본 요청 정책 : AllViewerExceptHostHeader

- User -> ALB
  - 경로 : /v1/user*
  - 캐싱 X
  - 원본 요청 정책 : AllViewerExceptHostHeader

---

**WAF**
