### System Operation • EKS

**EKS Cluster**
- 클러스터 인증 모드 : EKS API
- 추가 보안 그룹을 생성
- 네트워킹 및 클러스터 엔드포인트 엑세스는 프라이빗
- 컨트롤 플레인 로그 : API 서버, 감사만 활성화
- 추가 기능 : kube-proxy, Amazon VPC CNI, CoreDNS, 지표 서버

**EKS 노드 그룹**
- AMI : BottleRocket 권장
- 노드 그룹 크기 : 2 / 2 / 2
  - 노드 그룹 크기를 2로 고정시키는 이유 : Karpenter에서는 이 노드그룹과 별개로 생성함

EKS 환경변수 설정 및 클러스터 접근 후 Karpenter부터 진행

**Karpenter 설치**
1. Private 서브넷과 보안 그룹에 태그 붙이기
  - 키 : karpenter.sh/discovery 값 : 클러스터이름
2. OIDC 활성화 명령 입력 : `eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --approve`
3. k8s/karpenter.sh 명령을 입력하여 Karpenter 설치

**서비스 배포**
1. 아래 명령어 입력하여 SA 생성
```bash
eksctl create iamserviceaccount \
--cluster=$CLUSTER_NAME \
--namespace=default \
--name=apdev-sa \
--attach-policy-arn=arn:aws:iam::aws:policy/AmazonS3FullAccess \
--approve
```
2. k8s/ 폴더를 참고하여 configmap -> user, stress, product -> ingress -> nodeclass -> nodepool 순 apply
  - configmap은 환경변수 값 변경, user, product, stress는 ECR 변경이 필요 
  - 참고: k8s/user.yaml 에는 Deployment, HPA, Service가 한번에 들어있음.

    - 늘어날 수 있는 각 Pod 수를 조절하려면 HPA 부분에 minReplicas와 maxReplicas를 조절하면 됨 (예: minReplicas 2, maxReplicas 6) -> 대회 당일 트래픽을 분석해서 결정
