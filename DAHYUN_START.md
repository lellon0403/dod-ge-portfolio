# 다현 님이 처음 해야 할 일

이 사이트는 `DodGe / DG` 포트폴리오입니다. 그림 업로드, 수정, 삭제, 순서 변경, 카테고리와 소개 문구 편집은 배포 후 사이트의 **관리자 화면**에서 할 수 있습니다.

## 준비하기

- GitHub 계정을 만들고 저장소 공동 작업자 초대를 수락합니다.
- [Supabase](https://supabase.com) 계정을 만듭니다.
- [Vercel](https://vercel.com) 계정을 만들고 GitHub 계정을 연결합니다.

계정 비밀번호는 다른 사람이나 GPT에게 보내지 마세요. 필요한 로그인은 본인이 직접 하면 됩니다.

## GPT에게 이렇게 요청하세요

아래 문장을 이 저장소를 열 수 있는 GPT 또는 Codex에 보내면 됩니다.

> 이 저장소의 `DAHYUN_START.md`, `README.md`, `TRANSFER.md`를 먼저 읽어줘. 내 Supabase와 Vercel 계정으로 사이트를 배포할 수 있게 한 단계씩 도와줘. 로그인과 비밀키 입력은 내가 직접 할게. 비밀키를 GitHub 파일이나 채팅에 기록하지 말아줘.

## Supabase 설정

1. 새 Supabase 프로젝트를 만듭니다.
2. Supabase의 SQL Editor에서 `supabase/migrations/0001_initial.sql` 파일 내용을 한 번 실행합니다.
3. 프로젝트의 URL과 공개 키, 서버용 비밀키를 확인합니다.

서버용 비밀키(`service_role` 또는 secret key)는 절대로 GitHub에 올리지 마세요.

## Vercel 배포

1. Vercel에서 이 GitHub 저장소를 Import합니다.
2. 다음 환경 변수를 Vercel 프로젝트에 등록합니다.

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_CODE
ADMIN_SESSION_SECRET
```

- `SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_URL`에는 같은 Supabase 프로젝트 URL을 넣습니다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`에는 Supabase 공개용 anon/publishable 키를 넣습니다.
- `SUPABASE_SERVICE_ROLE_KEY`에는 서버용 service role/secret 키를 넣습니다.
- 첫 `ADMIN_CODE`는 전달받은 초기 코드를 사용합니다.
- `ADMIN_SESSION_SECRET`은 GPT에게 긴 무작위 문자열을 **로컬에서 생성하는 방법**을 안내해 달라고 요청하고, 결과는 Vercel에만 입력합니다.

환경 변수를 입력한 뒤 Vercel에서 다시 배포합니다.

## 배포 후 확인

- 사이트 첫 화면에 `DG`가 보이는지 확인합니다.
- 상단의 `관리자` 메뉴에서 로그인합니다.
- 첫 그림을 올려 봅니다.
- 카테고리, 소개글, 활동 지역, 이메일을 원하는 내용으로 바꿉니다.
- 초기 관리자 코드는 관리 화면의 `보안 설정`에서 더 긴 코드로 변경합니다.

설정 중 오류가 생기면 오류 화면을 캡처해서 GPT에게 보여주되, 화면에 비밀키가 보이면 가린 뒤 보내세요.

