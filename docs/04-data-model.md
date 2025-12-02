# 데이터 모델 설계

## ERD 개요

```
Users (1) ─────< (N) Diaries (1) ─────< (N) Photos
                         │
                         └────< (N) UploadSessions (임시)
```

## 1. Users (사용자)

### 테이블: `users`

| 컬럼명        | 타입         | 제약조건                | 설명              |
| ------------- | ------------ | ----------------------- | ----------------- |
| user_id       | UUID         | PK                      | 사용자 고유 ID    |
| email         | VARCHAR(255) | UNIQUE, NOT NULL        | 이메일            |
| password_hash | VARCHAR(255) | NOT NULL                | 암호화된 비밀번호 |
| nickname      | VARCHAR(50)  | NOT NULL                | 닉네임            |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 가입일시          |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 수정일시          |

**인덱스**

- PRIMARY KEY: `user_id`
- UNIQUE INDEX: `email`

---

## 2. Diaries (일기)

### 테이블: `diaries`

| 컬럼명     | 타입         | 제약조건                | 설명         |
| ---------- | ------------ | ----------------------- | ------------ |
| diary_id   | UUID         | PK                      | 일기 고유 ID |
| user_id    | UUID         | FK, NOT NULL            | 작성자 ID    |
| title      | VARCHAR(200) | NOT NULL                | 일기 제목    |
| content    | TEXT         | NOT NULL                | 일기 본문    |
| date       | DATE         | NOT NULL                | 데이트 날짜  |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 생성일시     |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 수정일시     |

**인덱스**

- PRIMARY KEY: `diary_id`
- INDEX: `user_id, date DESC` (사용자별 날짜 정렬 조회)
- INDEX: `user_id, created_at DESC` (사용자별 최신순 조회)

**외래키**

- `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE

---

## 3. Photos (사진)

### 테이블: `photos`

| 컬럼명         | 타입         | 제약조건                | 설명                   |
| -------------- | ------------ | ----------------------- | ---------------------- |
| photo_id       | UUID         | PK                      | 사진 고유 ID           |
| diary_id       | UUID         | FK, NOT NULL            | 일기 ID                |
| file_path      | VARCHAR(500) | NOT NULL                | S3 파일 경로           |
| thumbnail_path | VARCHAR(500) | NOT NULL                | 썸네일 경로            |
| file_size      | INTEGER      | NOT NULL                | 파일 크기(bytes)       |
| mime_type      | VARCHAR(50)  | NOT NULL                | MIME 타입              |
| order          | INTEGER      | NOT NULL                | 사진 순서 (0부터 시작) |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 업로드일시             |

**인덱스**

- PRIMARY KEY: `photo_id`
- INDEX: `diary_id, order ASC` (일기별 사진 순서 조회)

**외래키**

- `diary_id` REFERENCES `diaries(diary_id)` ON DELETE CASCADE

---

## 4. Upload Sessions (업로드 세션 - 임시)

### 테이블: `upload_sessions`

| 컬럼명     | 타입        | 제약조건                | 설명                        |
| ---------- | ----------- | ----------------------- | --------------------------- |
| upload_id  | UUID        | PK                      | 업로드 세션 ID              |
| user_id    | UUID        | FK, NOT NULL            | 사용자 ID                   |
| file_count | INTEGER     | NOT NULL                | 예정된 파일 수              |
| status     | VARCHAR(20) | NOT NULL                | pending, completed, expired |
| expires_at | TIMESTAMP   | NOT NULL                | 만료일시 (1시간 후)         |
| created_at | TIMESTAMP   | NOT NULL, DEFAULT NOW() | 생성일시                    |

**인덱스**

- PRIMARY KEY: `upload_id`
- INDEX: `user_id, created_at DESC`
- INDEX: `expires_at` (만료된 세션 정리용)

**외래키**

- `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE

---

## 5. Temp Photos (임시 사진)

### 테이블: `temp_photos`

| 컬럼명     | 타입         | 제약조건                | 설명              |
| ---------- | ------------ | ----------------------- | ----------------- |
| file_id    | UUID         | PK                      | 파일 고유 ID      |
| upload_id  | UUID         | FK, NOT NULL            | 업로드 세션 ID    |
| file_path  | VARCHAR(500) | NOT NULL                | S3 임시 파일 경로 |
| file_size  | INTEGER      | NOT NULL                | 파일 크기         |
| mime_type  | VARCHAR(50)  | NOT NULL                | MIME 타입         |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 업로드일시        |

**인덱스**

- PRIMARY KEY: `file_id`
- INDEX: `upload_id`

**외래키**

- `upload_id` REFERENCES `upload_sessions(upload_id)` ON DELETE CASCADE

---

## 데이터 관계 설명

### 1. User → Diary (1:N)

- 한 사용자는 여러 일기를 작성할 수 있음
- 사용자 삭제 시 모든 일기가 함께 삭제됨 (CASCADE)

### 2. Diary → Photo (1:N)

- 한 일기는 여러 사진을 포함할 수 있음 (2~10장)
- 일기 삭제 시 모든 사진이 함께 삭제됨 (CASCADE)
- `order` 필드로 사진 표시 순서 관리

### 3. Upload Session → Temp Photo (1:N)

- 일기 생성 전 임시로 업로드된 사진 관리
- 일기 저장 시 `temp_photos`에서 `photos`로 이동
- 1시간 후 자동 만료 및 정리

---

## 저장 용량 추정

### 단일 사용자 기준

- 일기 1개: 약 1KB (텍스트)
- 사진 1장: 평균 3MB (원본) + 200KB (썸네일)
- 일기 1개 (사진 5장 기준): 약 16MB

### 성장 예측

- 월 4회 데이트 × 12개월 = 48개 일기/년
- 연간 저장 용량: 약 768MB/사용자
- 1000명 사용자: 약 750GB/년

---

## 데이터 정리 전략

### 임시 데이터 삭제

- `upload_sessions`, `temp_photos`: 1시간 경과 후 삭제
- 매시간 배치 작업으로 만료된 레코드 삭제
- S3 Lifecycle Policy로 임시 파일 자동 삭제

### 백업

- 데이터베이스: 일일 자동 백업
- S3 이미지: Versioning + Cross-Region Replication

---

## 확장 고려사항 (향후)

### Phase 2+에서 추가될 테이블

#### `couples` (커플 연동)

```sql
CREATE TABLE couples (
  couple_id UUID PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(user_id),
  user2_id UUID NOT NULL REFERENCES users(user_id),
  connected_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `diary_shares` (일기 공유)

```sql
CREATE TABLE diary_shares (
  share_id UUID PRIMARY KEY,
  diary_id UUID NOT NULL REFERENCES diaries(diary_id),
  shared_with_user_id UUID NOT NULL REFERENCES users(user_id),
  shared_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `tags` (태그)

```sql
CREATE TABLE tags (
  tag_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  name VARCHAR(50) NOT NULL,
  UNIQUE(user_id, name)
);

CREATE TABLE diary_tags (
  diary_id UUID NOT NULL REFERENCES diaries(diary_id),
  tag_id UUID NOT NULL REFERENCES tags(tag_id),
  PRIMARY KEY (diary_id, tag_id)
);
```
