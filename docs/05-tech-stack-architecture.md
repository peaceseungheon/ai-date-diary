# 기술 스택 및 아키텍처

## 기술 스택 선정 원칙

- **단순성**: 오버엔지니어링 방지, 검증된 기술 선택
- **생산성**: 빠른 개발과 배포 가능
- **확장성**: 향후 성장에 대비한 확장 가능
- **비용 효율**: MVP 단계에서 낮은 운영 비용

---

## Frontend

### Core

- **Framework**: React 18+ with TypeScript
  - 이유: 풍부한 생태계, 빠른 개발,타입 안정성
- **Build Tool**: Vite
  - 이유: 빠른 개발 서버, 최적화된 드
- **Routing**: React Router v6
- **State Management**:

  - React Context API (인증)

  - TanStack Query (서버 상태)
  - 이유: 간단한 상태 관리, 외부 의존성 최소화

### UI/UX

- **Styling**: TailwindCSS
  - 이유: 빠른 UI 개발, 일관된 디자인
- **Component Library**: hadcn/ui

  - 이유: 커스터마이징 용이, 접근성 우수

- **Icons**: Lucide React
- **Image Optimization**:

  - 클라이언트 압축: browser-image-compression

  - Lazy Loading: React Intersection Observer

### Mobile

- **Approach**: Progressive Web App (PWA)
  - 이유: 네이티브 앱 없이 모바일 경험 제공
- **Features**:

  - 홈 화면 추가

  - 오프라인 지원 (Service Worker)
  - 카메라 접근 (Web API)

---

## Backend

### Core

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js

  - 이유: 경량, 유연성, 풍부한 미들웨어

- **Language**: TypeScript
  - 이유: 타입 안정성, 유지보수성

### Database

- **Primary DB**: MySQL 8.0+
  - 이유: 안정성, ACID, JSON 지원, 널리 사용됨
- **ORM**: Prisma
  - 이유: 타입 안전, 마이그레이션 관리, 개발 생산성

### Authentication

- **Strategy**: JWT (JSON Web Token)

  - Access Token: 1시간유효
  - 라이브러리: jsonwebtoken

- **Password Hashing**: bcrypt
  - Salt rounds: 10

### File Storage

- **Service**: AWS S3 (또는 호환 서비스)

  - 원본 이미지: `{env}/phtos/{userId}/{diaryId}/`
  - 썸네일: `{env}/thumbnails/{userId}/{diaryId}/`

- **Upload**: Presigned URL 방식
  - 이유: 서버 부하 감소, 보안
- **CDN**: CloudFront
  - 이유: 이미지 전송 속도 향상

### AI Services

- **Image Analysis**:
  - Primary: OpenAI GPT-4 Vision API
  - Alternative: Google Cloud Vision API
- **Text Generation**:

  - OpenAI GPT-4o
  - 프롬프트 예시:

    ```
    다음 사진들을 분석하여 2-3문단의 감성적인 데이트 일기를 작성해주세요.

    - 톤: 따뜻하고 감성적
    - 길이: 200-400자

    - 시점: 1인칭
    ```

---

## Infrastructure

### Hosting (MVP)

- **Option 1: Vercel + Railway**

  - Frontend: Vercel (Free tier)

  - Backend: Railway (Starter plan)
  - Database: Railway MySQL
  - Storage: AWS S3 (Free tier 12개월)

- **Option 2: AWS Only**

  - Frontend: S3 + CloudFront

  - Backend: EC2 t3.micro (Free tier)
  - Database: RDS MySQL t3.micro (Free tier)
  - Load Balancer: ALB (필요시)

### CI/CD

- **Git**: GitHub
- **CI/CD**: GitHub Actions
  - Frontend: 자동 배포 (Vercel/S3)
  - Backend: Docker 이미지 빌드 + 배포

### Monitoring

- **Error Tracking**: Sentry (Free tier)
- **Logging**: Winston (로컬 로그)
- **Uptime**: UptimeRobot (Free tier)

---

## System Architecture

```
┌─────────────┐
│   Client    │ (React PWA)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│   CDN       │ (CloudFront)
│  (Static)   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│         Load Balancer (선택)        │
└─────────────┬───────────────────────┘
              │
       ┌──────┴──────┐
       ↓             ↓
┌─────────────┐ ┌─────────────┐
│  Backend    │ │  Backend    │
│  (Express)  │ │  (Express)  │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               │
       ┌───────┼────────────┐
       ↓       ↓            ↓
┌──────────┐ ┌──────────┐ ┌──────────┐
│  MySQL   │ │   S3     │ │  OpenAI  │
│  (RDS)   │ │ (Images) │ │   API    │
└──────────┘ └──────────┘ └──────────┘
```

---

## Data Flow: 일기 생성 프로세스

```

1. 사진 업로드 요청
   Client → Backend: POST /diaries/upload-urls
   Backend → S3: Presigned URL 생성
   Backend → Client: URLs 반환

2. 사진 업로드
   Client → S3: PUT (Presigned URL)


3. AI 분석 요청
   Client → Backend: POST /diaries/generate
   Backend → S3: 이미지 다운로드
   Backend → OpenAI: Vision API 호출
   Backend → OpenAI: Text Generation API 호출


   Backend → Client: 생성된 일기 반환

4. 일기 저장
   Client → Backend: POST /diaries
   Backend → MySQL: 일기 + 사진 메타데이터 저장
   Backend → Client: 저장 완료 응답
```

---

## Security

### API 보안

- HTTPS 강제
- CORS 설정 (화이트리스트)
- Rate Limiting (express-rate-limit)
  - 일반 API: 60 req/min
  - AI 생성: 10 req/hour
- Helmet.js (보안 헤더)

### 데이터 보안

- 비밀번호: bcrypt 암호화
- JWT: HS256 알고리즘
- 환경 변수: .env 파일 (dotenv)
- SQL Injection 방지: Prisma ORM

### 파일 보안

- MIME 타입 검증
- 파일 크기 제한
- S3 Bucket: Private (Presigned URL로만 접근)

---

## Development Environment

### Local Setup

```bash
# Frontend

npm install
npm run dev        # http://localhost:5173


# Backend
npm install
npm run dev        # http://localhost:3000

# Database
docker-compose up  # MySQL on 3307 (로컬 MySQL이 3306 사용 중)
npm run migrate
```

### Environment Variables

```env
# Backend (.env)
DATABASE_URL=mysql://...
JWT_SECRET=your-secret-key


AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=date-diary-images

OPENAI_API_KEY=...

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3000
```

---

## Testing Strategy (향후)

### Unit Tests

- Frontend: Vitest + React Testing Library
- Backend: Jest + Supertest

### E2E Tests

- Playwright (주요 플로우만)

### Coverage Goal

- MVP: 테스트 없이 출시 (빠른 검증)
- Post-MVP: 핵심 로직 70% 이상

---

## Deployment Strategy

### MVP Phase

1. **수동 배포**

   - Frontend: `npm run build` → Vercel
   - Backend: GitHub push → Railway auto-deploy

2. **환경**
   - Production만 운영
   - Branch: `main`

### Post-MVP

1. **자동 배포 (CI/CD)**

   - GitHub Actions
   - Staging + Production 환경

2. **무중단 배포**
   - Blue-Green Deployment
   - Health Check Endpoint

---

## Cost Estimation (월간)

### MVP 단계 (100명 사용자 기준)

- Vercel: $0 (Hobby)
- Railway: $5 (Starter)
- AWS S3: $3 (약 15GB)

- CloudFront: $1
- OpenAI API: $20 (월 200회 일기 생성)
- **총 예상: ~$30/월**

### 성장 단계 (1,000명 사용자)

- Vercel: $20 (Pro)
- Railway: $20 (개선된 플랜)
- AWS S3: $30
- CloudFront: $10
- RDS: $15 (t3.micro)
- OpenAI API: $200
- **총 예상: ~$300/월**

---

## 향후 확장 고려사항

### Phase 2+

- Redis (세션, 캐싱)
- Message Queue (일기 생성 비동기 처리)
- Elasticsearch (일기 검색)
- Microservices 분리 (AI 서비스)

### Scalability

- Database: Read Replica
- Backend: 수평 확장 (Auto Scaling)
- Storage: S3 Lifecycle (오래된 이미지 아카이브)
