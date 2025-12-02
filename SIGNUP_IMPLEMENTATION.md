# 회원가입 기능 구현 완료

## 구현 내용

### 백엔드 (Backend)

#### 1. 파일 구조

```
backend/src/
├── controllers/
│   └── auth.controller.ts       # 회원가입/로그인 컨트롤러
├── middleware/
│   └── auth.ts                  # JWT 인증 미들웨어
├── validators/
│   └── auth.validator.ts        # 입력 검증 (express-validator)
├── utils/
│   └── jwt.ts                   # JWT 토큰 생성/검증 유틸리티
└── routes/
    └── auth.routes.ts           # 인증 라우트
```

#### 2. API 엔드포인트

**POST /api/v1/auth/signup**

- 요청:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "홍길동"
  }
  ```
- 응답 (성공):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "userId": "uuid",
        "email": "user@example.com",
        "nickname": "홍길동",
        "createdAt": "2025-12-01T00:00:00.000Z"
      }
    }
  }
  ```
- 응답 (실패):
  ```json
  {
    "success": false,
    "error": {
      "code": "EMAIL_ALREADY_EXISTS",
      "message": "Email is already registered"
    }
  }
  ```

**POST /api/v1/auth/login**

- 요청:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- 응답: 회원가입과 동일한 형식

#### 3. 구현된 검증 로직

- ✅ 이메일 형식 검증
- ✅ 이메일 중복 확인
- ✅ 비밀번호 최소 8자 이상
- ✅ 닉네임 2~20자 제한
- ✅ 비밀번호 bcrypt 암호화 (saltRounds: 10)
- ✅ JWT 토큰 생성 (만료: 7일)

### 프론트엔드 (Frontend)

#### 1. 구현된 페이지

- **회원가입 페이지** (`/signup`)
  - 이메일, 닉네임, 비밀번호, 비밀번호 확인 입력
  - 실시간 유효성 검증
  - 에러 메시지 표시
  - 로딩 상태 처리
- **로그인 페이지** (`/login`)
  - 이메일, 비밀번호 입력
  - 에러 메시지 표시
  - 로딩 상태 처리

#### 2. 클라이언트 검증

- ✅ 이메일 형식 검증
- ✅ 비밀번호 최소 8자 검증
- ✅ 비밀번호 확인 일치 검증
- ✅ 닉네임 2~20자 검증
- ✅ 중복 이메일 에러 처리
- ✅ 서버 에러 메시지 표시

#### 3. 인증 상태 관리

- AuthContext로 전역 인증 상태 관리
- localStorage에 토큰 및 사용자 정보 저장
- 로그인 성공 시 자동으로 일기 목록 페이지로 이동
- axios interceptor로 자동 토큰 추가 및 401 에러 처리

## 실행 방법

### 1. 환경 변수 설정

**백엔드** (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

필수 환경 변수:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키 (강력한 랜덤 문자열로 변경 필요)

**프론트엔드** (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

### 2. 데이터베이스 마이그레이션

```bash
cd backend
npm install
npm run migrate
```

### 3. 서버 실행

**백엔드**

```bash
cd backend
npm run dev
```

**프론트엔드**

```bash
cd frontend
npm install
npm run dev
```

### 4. 테스트

1. 브라우저에서 `http://localhost:5173/signup` 접속
2. 회원가입 폼 작성:
   - 이메일: 유효한 이메일 형식
   - 닉네임: 2~20자
   - 비밀번호: 최소 8자
   - 비밀번호 확인: 비밀번호와 동일
3. 회원가입 버튼 클릭
4. 성공 시 자동으로 `/diaries` 페이지로 이동

## API 테스트 (선택)

### cURL로 테스트

**회원가입**

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "테스터"
  }'
```

**로그인**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 보안 고려사항

1. ✅ 비밀번호 bcrypt 암호화 저장
2. ✅ JWT 토큰 기반 인증
3. ✅ HTTPS 통신 준비 (프로덕션 환경)
4. ✅ CORS 설정
5. ✅ Helmet 미들웨어로 보안 헤더 설정
6. ✅ express-validator로 입력 검증
7. ✅ SQL Injection 방지 (Prisma ORM 사용)

## 다음 단계

- [ ] 이메일 인증 기능 (선택)
- [ ] 비밀번호 재설정 기능
- [ ] 소셜 로그인 (Google, Kakao 등)
- [ ] 프로필 수정 기능
- [ ] 회원 탈퇴 기능
