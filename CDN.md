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

- 이미지 -> S3
  - 경로 : /images/*
  - 캐싱 : 사용자 지정
    - 사용자 정의 캐시 정책을 생성
        - 최소 TTL : 0, 최대 TTL : 60, 기본 TTL : 10
        - 캐시 키는 모두 없음

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
- CloudFront에서 같이 생성된 ACL에 CommonRuleSet(Core rule set), KnownBadInputsRuleSet AmazonIpReputationList 등이 있는데, 추가로 SQL database 관리형 규칙을 추가(필수)
- (경기 중 분석) 로그에 User-Agent: bot-attack 등과 함께 비정상 요청이 발견되는 경우 사용자 지정 규칙 -> 사용자 지정 규칙 추가하여 작업 : Block(문과 일치), 검사 : 단일 헤더, 헤더 필드 이름 : User-Agent, 일치 시킬 문자열 : bot-attack(문자열과 정확히 일치) 등으로 설정 후 사용자 지정 응답에서 403 활성
- (해당 비정상 요청이 들어올 경우) Product의 PUT에서 비정상적인 Content-Type을 막기 위해 AND 조건으로 구성
  - 작업 : Block (모든 문과 일치(AND))
  - Statement 1 - URL 경로가 /v1/product와 정확하게 일치하고
  - Statement 2 - HTTP 메서드가 PUT과 정확하게 일치하며 (statement 2)
  - Statement 3 - 단일 헤더 content-type이 (json|text|urlencoded|script|shell|sh|xml|octet-stream) 라는 정규 표현식과 일치하는지 검사
  - 사용자 지정 응답 : 403
- (해당 비정상 요청이 들어올 경우) Product의 PUT에서 비정상적인 용량의 요청이 들어올 경우
  - 작업 : Block (모든 문과 일치(AND))
  - Statement 1 - URL 경로가 /v1/product와 정확하게 일치하고
  - Statement 2 - HTTP 메서드가 PUT과 정확하게 일치하며
  - Statement 3 - 본문이 2097152보다 초과의 크기일 때
  - 사용자 지정 응답 : 403
