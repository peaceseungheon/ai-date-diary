# 개발 환경 설치 가이드

## 1. 사전 요구사항 설치

### Node.js 20 설치
```powershell
# Node.js 공식 사이트에서 다운로드
# https://nodejs.org/
# LTS 버전 (20.x) 설치

# 설치 확인
node --version  # v20.x.x
npm --version   # 10.x.x
```

### Docker Desktop 설치 (선택사항)
PostgreSQL을 로컬에 설치하지 않으려면 Docker 사용 권장
- https://www.docker.com/products/docker-desktop/

## 2. 프로젝트 클론 및 설정

```powershell
# 프로젝트 디렉토리로 이동
cd d:\github\date-diary

# Git 초기화 (필요한 경우)
git init
```

## 3. Backend 설정

### 3.1 의존성 설치
```powershell
cd backend
npm install
```

### 3.2 환경 변수 설정
```powershell
# .env 파일 생성
cp .env.example .env

# .env 파일을 편집하여 실제 값 입력
# - DATABASE_URL
# - JWT_SECRET (임의의 복잡한 문자열)
# - AWS 관련 키 (S3 사용 시)
# - OPENAI_API_KEY (AI 기능 사용 시)
```

### 3.3 데이터베이스 설정

#### Option 1: Docker 사용 (권장)
```powershell
# 프로젝트 루트로 이동
cd ..

# PostgreSQL 컨테이너 실행
docker-compose up -d

# 데이터베이스 연결 확인
# DATABASE_URL=postgresql://date_diary_user:date_diary_password@localhost:5432/date_diary_dev
```

#### Option 2: 로컬 PostgreSQL 설치
```powershell
# PostgreSQL 15+ 설치
# https://www.postgresql.org/download/windows/

# 데이터베이스 및 사용자 생성
psql -U postgres
CREATE DATABASE date_diary_dev;
CREATE USER date_diary_user WITH PASSWORD 'date_diary_password';
GRANT ALL PRIVILEGES ON DATABASE date_diary_dev TO date_diary_user;
\q
```

### 3.4 데이터베이스 마이그레이션
```powershell
cd backend

# Prisma 마이그레이션 실행
npm run migrate

# Prisma Studio로 DB 확인 (선택사항)
npm run db:studio
```

### 3.5 Backend 서버 실행
```powershell
# 개발 모드로 실행
npm run dev

# 서버가 http://localhost:3000 에서 실행됨
# Health check: http://localhost:3000/health
```

## 4. Frontend 설정

### 4.1 의존성 설치
```powershell
# 새 터미널 열기
cd d:\github\date-diary\frontend
npm install
```

### 4.2 환경 변수 설정
```powershell
# .env 파일 생성
cp .env.example .env

# 기본값 사용 (변경 불필요)
# VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 4.3 Frontend 서버 실행
```powershell
# 개발 모드로 실행
npm run dev

# 서버가 http://localhost:5173 에서 실행됨
```

## 5. 실행 확인

### 브라우저에서 접속
1. http://localhost:5173 접속
2. 회원가입 페이지 확인
3. 로그인 페이지 확인

### API 동작 확인
```powershell
# Health check
curl http://localhost:3000/health

# 예상 응답:
# {"status":"ok","timestamp":"2025-12-01T..."}
```

## 6. 개발 워크플로우

### Backend 개발
```powershell
cd backend

# 코드 변경 시 자동 재시작 (tsx watch)
npm run dev

# 린트 체크
npm run lint

# 코드 포맷팅
npm run format

# 데이터베이스 스키마 변경 후
npm run migrate
```

### Frontend 개발
```powershell
cd frontend

# 코드 변경 시 자동 새로고침 (HMR)
npm run dev

# 린트 체크
npm run lint

# 코드 포맷팅
npm run format

# 프로덕션 빌드
npm run build
```

## 7. 주요 명령어 정리

### 데이터베이스
```powershell
# Docker 컨테이너 시작
docker-compose up -d

# Docker 컨테이너 중지
docker-compose down

# 컨테이너 로그 확인
docker-compose logs -f postgres

# Prisma Studio (DB GUI)
cd backend
npm run db:studio
```

### 개발 서버
```powershell
# Backend
cd backend
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행

# Frontend  
cd frontend
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

## 8. 문제 해결

### Port 충돌
```powershell
# 3000 포트가 이미 사용중인 경우
# backend/.env 에서 PORT 변경

# 5173 포트가 이미 사용중인 경우
# frontend/vite.config.ts 에서 server.port 변경
```

### PostgreSQL 연결 오류
```powershell
# Docker 컨테이너 상태 확인
docker ps

# 컨테이너 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs postgres
```

### Prisma 관련 오류
```powershell
cd backend

# Prisma Client 재생성
npx prisma generate

# 마이그레이션 초기화 (주의: 데이터 삭제됨)
npx prisma migrate reset
```

### 의존성 설치 오류
```powershell
# node_modules 삭제 후 재설치
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 9. 다음 단계

개발 환경 구축이 완료되었습니다!

### 구현할 기능 (우선순위 순)
1. **인증 시스템** (Week 2-3)
   - 회원가입 API
   - 로그인 API
   - JWT 미들웨어

2. **일기 생성** (Week 3-4)
   - S3 업로드
   - OpenAI API 연동
   - 일기 저장

3. **일기 조회** (Week 4-5)
   - 목록 조회
   - 상세 조회
   - 페이지네이션

자세한 개발 계획은 `docs/06-development-roadmap.md`를 참고하세요.

## 10. 유용한 리소스

- [Express 공식 문서](https://expressjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [React 공식 문서](https://react.dev/)
- [TailwindCSS 공식 문서](https://tailwindcss.com/)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
