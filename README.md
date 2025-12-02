# Date Diary

AI 기반 데이트 일기 자동 생성 서비스

## 프로젝트 개요

사진들을 업로드하면 AI가 자동으로 감성적인 일기를 생성해주는 데이트 기록 서비스입니다.

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- TanStack Query

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

### Infrastructure
- AWS S3 (파일 스토리지)
- OpenAI API (AI 생성)

## 프로젝트 구조

```
date-diary/
├── frontend/          # React 프론트엔드
├── backend/           # Express 백엔드
├── docs/              # 프로젝트 문서
└── docker-compose.yml # 개발 환경 설정
```

## 개발 환경 설정

### 사전 요구사항
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (또는 Docker 사용)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd date-diary
```

2. **환경 변수 설정**
```bash
# Backend
cd backend
cp .env.example .env
# .env 파일을 열어 필요한 값 입력

# Frontend
cd ../frontend
cp .env.example .env
```

3. **데이터베이스 실행 (Docker)**
```bash
# 프로젝트 루트에서
docker-compose up -d
```

4. **Backend 실행**
```bash
cd backend
npm install
npm run migrate  # 데이터베이스 마이그레이션
npm run dev      # 개발 서버 실행 (http://localhost:3000)
```

5. **Frontend 실행**
```bash
cd frontend
npm install
npm run dev      # 개발 서버 실행 (http://localhost:5173)
```

## 문서

자세한 프로젝트 문서는 [docs/](./docs/) 디렉토리를 참고하세요.

- [프로젝트 개요](./docs/01-project-overview.md)
- [기능 요구사항](./docs/02-feature-requirements.md)
- [API 명세서](./docs/03-api-specification.md)
- [데이터 모델](./docs/04-data-model.md)
- [기술 스택 및 아키텍처](./docs/05-tech-stack-architecture.md)
- [개발 로드맵](./docs/06-development-roadmap.md)
- [유저 스토리](./docs/07-user-stories.md)

## 라이센스

MIT
