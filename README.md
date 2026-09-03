# DodGe Portfolio

`DodGe / DG`의 캐릭터 일러스트와 팬아트를 전시하고 직접 관리할 수 있는 포트폴리오입니다.

## 주요 기능

- 작품 이미지 업로드, 교체, 수정, 삭제 및 순서 변경
- 카테고리 추가, 이름 변경, 삭제
- 작가명, DG 마크, 소개 문구, 연락처 등 화면 문구 편집
- 서버 검증 관리자 로그인, 로그인 시도 제한, 보안 쿠키
- D1 데이터베이스와 R2 이미지 저장소 사용

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

관리자 인증값은 커밋하지 않고 로컬 또는 배포 환경의 비밀 변수로 설정합니다.

```env
ADMIN_CODE=your-admin-code
ADMIN_SESSION_SECRET=your-long-random-secret
```

## 확인

```bash
npm run build
```
