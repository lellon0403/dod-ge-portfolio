# DodGe Portfolio

`DodGe / DG`의 캐릭터 일러스트와 팬아트를 전시하고 직접 관리하는 포트폴리오입니다.

> 2026-09-13: 화이트 톤의 블로그형 갤러리 디자인과 관리자 설정 안내가 반영되었습니다. 자세한 내용은 [`LATEST_UPDATE.md`](LATEST_UPDATE.md)에서 확인할 수 있습니다.

## 구성

- Next.js + Vercel
- Supabase Postgres: 작품, 카테고리, 사이트 문구, 관리자 보안 정보
- Supabase Storage: 작품 원본 이미지
- 관리자 코드 로그인, 로그인 시도 제한, 보안 쿠키
- 작품 업로드·교체·삭제·순서 변경
- 카테고리와 사이트 문구 편집

이미지는 Vercel 서버를 거치지 않고 관리자 확인 후 발급된 일회성 업로드 주소로 Supabase에 직접 전송됩니다. `service_role` 키는 서버에서만 사용합니다.

## Supabase 준비

1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 [`supabase/migrations/0001_initial.sql`](supabase/migrations/0001_initial.sql)을 실행합니다.
3. Project Settings → API에서 Project URL, anon key, service role key를 확인합니다.

## 환경 변수

`.env.example`을 참고해 로컬의 `.env.local`과 Vercel의 Environment Variables에 다음 값을 설정합니다.

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_CODE=
ADMIN_SESSION_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_CODE`, `ADMIN_SESSION_SECRET`은 공개 저장소에 커밋하면 안 됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## Vercel 배포

Vercel에서 GitHub 저장소를 Import한 뒤 위 환경 변수를 Production, Preview, Development에 등록합니다. 이후 `main` 브랜치에 푸시하면 자동으로 다시 배포됩니다.

다현 님 계정으로 이전할 때는 [`TRANSFER.md`](TRANSFER.md)를 따라 진행하면 됩니다.

다현 님이 직접 계정 연결과 배포를 시작할 때는 [`DAHYUN_START.md`](DAHYUN_START.md)를 먼저 읽으면 됩니다.

## 관리 기능이 작동하지 않을 때

1. `/api/categories`와 `/api/settings`가 정상 응답하는지 확인합니다.
2. 관리자 로그인이 안 되면 Vercel의 `ADMIN_CODE`, `ADMIN_SESSION_SECRET`을 확인합니다.
3. 환경 변수를 수정한 뒤에는 반드시 Production을 다시 배포합니다.
4. 이전에 관리자 코드를 변경한 적이 있다면 변경한 코드로 로그인합니다.
5. 초기 코드로 되돌릴 때만 Supabase SQL Editor에서 아래 명령을 실행한 뒤 다시 배포합니다.

```sql
delete from public.admin_credentials where id = 'main';
```

이 명령은 관리자 코드 기록만 초기화하며 작품과 사이트 문구는 삭제하지 않습니다.
