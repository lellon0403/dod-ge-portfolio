# 다현 님 계정으로 이전하기

## 준비할 계정

- 다현 님 GitHub 계정
- 다현 님 Supabase 계정
- 다현 님 Vercel 계정

## 이전 순서

1. 현재 GitHub 저장소를 다현 님 계정으로 Transfer하거나 새 저장소에 미러링합니다.
2. 다현 님 Supabase 계정에서 새 프로젝트를 만듭니다.
3. Supabase SQL Editor에서 `supabase/migrations/0001_initial.sql`을 한 번 실행합니다.
4. Vercel에서 다현 님 GitHub 저장소를 Import합니다.
5. `.env.example`에 적힌 여섯 환경 변수를 Vercel에 등록합니다.
6. Vercel에서 Production Deploy를 실행합니다.

## 중요한 보안 규칙

- `service_role` 키는 Supabase와 Vercel의 서버 환경 변수에만 저장합니다.
- `service_role` 키를 `NEXT_PUBLIC_` 변수에 넣으면 안 됩니다.
- 관리자 코드는 GitHub에 적지 않습니다.
- 계정을 이전할 때는 새 `ADMIN_SESSION_SECRET`을 생성합니다.
- 이전이 끝나면 기존 Supabase/Vercel 프로젝트의 키와 연결을 폐기합니다.

## 기존 작품도 옮기는 경우

현재 Supabase에서 `projects`, `categories`, `site_settings` 데이터를 내보내 새 프로젝트로 가져오고, `portfolio-images` 버킷의 파일도 복사해야 합니다. 아직 작품을 올리기 전이라면 이 과정은 생략해도 됩니다.
