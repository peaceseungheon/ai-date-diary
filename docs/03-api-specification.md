# API 명세서

## 기본 정보

- Base URL: `https://api.date-diary.com/v1`
- Content-Type: `application/json`
- 인증: Bearer Token (JWT)

## 인증 관련 API

### 1. 회원가입

```
POST /auth/signup
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동"
}
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "nickname": "홍길동",
    "token": "jwt-token-string"
  }
}
```

**Error Responses**

- `400 Bad Request`: 입력 검증 실패
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "이메일 형식이 올바르지 않습니다"
    }
  }
  ```
- `409 Conflict`: 이메일 중복
  ```json
  {
    "success": false,
    "error": {
      "code": "EMAIL_EXISTS",
      "message": "이미 사용중인 이메일입니다"
    }
  }
  ```

---

### 2. 로그인

```
POST /auth/login
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "nickname": "홍길동",
    "token": "jwt-token-string"
  }
}
```

**Error Responses**

- `401 Unauthorized`: 인증 실패
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "이메일 또는 비밀번호가 올바르지 않습니다"
    }
  }
  ```

---

## 일기 관련 API

### 3. 사진 업로드 (Presigned URL 방식)

```
POST /diaries/upload-urls
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "fileCount": 5,
  "files": [
    {
      "filename": "IMG_001.jpg",
      "contentType": "image/jpeg",
      "size": 2048576
    }
  ]
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "uploadId": "upload-uuid",
    "urls": [
      {
        "fileId": "file-uuid-1",
        "uploadUrl": "https://s3.presigned-url-1",
        "expiresAt": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 4. AI 일기 생성

```
POST /diaries/generate
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "uploadId": "upload-uuid",
  "fileIds": ["file-uuid-1", "file-uuid-2"],
  "date": "2025-11-30"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "title": "따뜻했던 강변 데이트",
    "content": "오늘은 정말 특별한 하루였다. 한강 공원에 도착하니 석양이 물든 하늘이 우리를 반겼다...",
    "generatedAt": "2025-12-01T09:30:00Z"
  }
}
```

**Error Responses**

- `400 Bad Request`: 잘못된 파일 ID
- `429 Too Many Requests`: 생성 요청 제한 초과
- `500 Internal Server Error`: AI 생성 실패

---

### 5. 일기 저장

```
POST /diaries
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "title": "따뜻했던 강변 데이트",
  "content": "오늘은 정말 특별한 하루였다...",
  "date": "2025-11-30",
  "fileIds": ["file-uuid-1", "file-uuid-2"]
}
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "diaryId": "diary-uuid",
    "title": "따뜻했던 강변 데이트",
    "content": "오늘은 정말 특별한 하루였다...",
    "date": "2025-11-30",
    "photos": [
      {
        "photoId": "photo-uuid-1",
        "url": "https://cdn.date-diary.com/photos/...",
        "thumbnailUrl": "https://cdn.date-diary.com/thumbnails/...",
        "order": 0
      }
    ],
    "createdAt": "2025-12-01T09:35:00Z"
  }
}
```

---

### 6. 일기 목록 조회

```
GET /diaries?page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 20, 최대: 50)

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "diaries": [
      {
        "diaryId": "diary-uuid",
        "title": "따뜻했던 강변 데이트",
        "contentPreview": "오늘은 정말 특별한 하루였다. 한강 공원에...",
        "date": "2025-11-30",
        "thumbnail": "https://cdn.date-diary.com/thumbnails/...",
        "photoCount": 5,
        "createdAt": "2025-12-01T09:35:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 87,
      "hasNext": true
    }
  }
}
```

---

### 7. 일기 상세 조회

```
GET /diaries/{diaryId}
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "diaryId": "diary-uuid",
    "title": "따뜻했던 강변 데이트",
    "content": "오늘은 정말 특별한 하루였다. 한강 공원에 도착하니...",
    "date": "2025-11-30",
    "photos": [
      {
        "photoId": "photo-uuid-1",
        "url": "https://cdn.date-diary.com/photos/...",
        "thumbnailUrl": "https://cdn.date-diary.com/thumbnails/...",
        "order": 0
      }
    ],
    "createdAt": "2025-12-01T09:35:00Z",
    "updatedAt": "2025-12-01T09:35:00Z"
  }
}
```

**Error Responses**

- `404 Not Found`: 일기를 찾을 수 없음
  ```json
  {
    "success": false,
    "error": {
      "code": "DIARY_NOT_FOUND",
      "message": "요청한 일기를 찾을 수 없습니다"
    }
  }
  ```
- `403 Forbidden`: 접근 권한 없음

---

## 공통 Error 응답

### 인증 오류 (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다"
  }
}
```

### 서버 오류 (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "서버 오류가 발생했습니다"
  }
}
```

## Rate Limiting

- 일반 API: 분당 60회
- AI 생성 API: 시간당 10회
- 초과 시 `429 Too Many Requests` 응답

## 버전 관리

- URL 경로에 버전 포함 (`/v1/`)
- 주요 변경 시 버전 증가
- 이전 버전은 최소 6개월 지원
