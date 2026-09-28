# 최소 인증(데모 계정 + 쿠키 세션) 설계

## 배경

지금까지 만든 어드민 킷은 인증이 전혀 없어서 URL만 알면 누구나 모든 페이지에
접근할 수 있다. 사이드바 하단의 프로필(`NavUser`)도 실제 로그인 상태가 아니라
하드코딩된 목업이다. "관리자 콘솔"이라는 이름에 맞게, 최소한의 로그인 게이트를
만든다.

## 목표

회원가입/비밀번호 재설정/권한(role) 없이, **로그인하지 않으면 어떤 페이지도
볼 수 없고, 로그인하면 세션이 유지된다**는 것만 보장한다. 나중에 실제
인증 서비스(DB, OAuth 등)로 교체하기 쉬운 얇은 경계를 남겨둔다.

## 범위

### 1. 데모 계정

- `src/config/auth.ts`에 데모 계정 하나를 상수로 정의 (`admin@example.com` /
  `admin1234`)
- 이 파일이 "실제 서비스로 교체할 때 손댈 자리"라는 걸 주석으로 명시

### 2. 세션 저장

- 서버 프로세스 메모리에 `Map<token, { email: string }>`으로 세션을 저장하는
  `src/server/session-store.ts` — 재시작하면 초기화되는 것을 감수하고, DB 없이
  시작. `create` / `get` / `revoke` 세 함수만 노출해서, 나중에 Redis/DB
  구현으로 교체할 때 이 파일만 바꾸면 되게 한다
- 세션 토큰은 `crypto.randomUUID()`로 생성

### 3. 쿠키

- `src/server/session-cookie.ts`에 TanStack Start 공식 패턴을 따라
  `setSessionCookie` / `clearSessionCookie` / `readSessionToken` 구현
  (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`)

### 4. 서버 함수 + 미들웨어

- `src/server/auth-middleware.ts`: `createMiddleware().server(...)`로
  쿠키에서 토큰을 읽어 세션을 조회하고, 없으면 컨텍스트에 `session: null`을
  넣어 `next()`로 넘긴다 (여기서 막지 않고, 호출부에서 판단 — 로그인 여부
  조회에도 재사용해야 하므로 강제 차단은 하지 않는다)
- `src/server/auth.ts`:
  - `loginFn` (`createServerFn({ method: 'POST' })`): 이메일/비밀번호를
    데모 계정과 비교, 맞으면 세션 생성 + 쿠키 설정, 틀리면 에러 반환
  - `logoutFn`: 세션 무효화 + 쿠키 삭제
  - `getCurrentUserFn`: 미들웨어를 거쳐 세션이 있으면 `{ email }`, 없으면
    `null` 반환

### 5. 라우트 보호

- `src/routes/__root.tsx`의 `createRootRoute`에 `beforeLoad` 추가:
  `getCurrentUserFn()` 호출 → 없고 현재 경로가 `/login`이 아니면
  `redirect({ to: '/login' })`; 있고 현재 경로가 `/login`이면
  `redirect({ to: '/' })`
- `beforeLoad`가 반환한 `user`를 라우트 컨텍스트에 담아 `RootDocument`에서
  사용(사이드바 프로필 표시에 활용 가능하지만, 이번 범위에서 `NavUser`는
  일단 그대로 두고 다음 작업으로 미룸 — 범위를 인증 자체로 한정)

### 6. `/login` 페이지

- `src/routes/login.tsx` — 사이드바/헤더 없는 독립 레이아웃 (지금 구조상
  모든 라우트가 `__root.tsx`의 사이드바 셸을 통과하므로, `/login`일 때는
  `RootDocument`가 셸 없이 `children`만 렌더링하도록 분기)
- 가운데 정렬된 카드: 이메일/비밀번호 입력, 로그인 버튼, 에러 메시지 표시
  (틀린 계정 정보 제출 시)
- 데모 계정 정보를 폼 아래 작은 안내 텍스트로 노출 (`admin@example.com` /
  `admin1234`) — 킷을 처음 받은 사람이 바로 로그인해볼 수 있게

### 7. 로그아웃 연결

- `src/components/nav-user.tsx`의 "로그아웃" 메뉴 항목(현재 no-op)이
  `logoutFn` 호출 후 `/login`으로 이동하도록 연결

## 이번에 하지 않는 것

회원가입, 비밀번호 재설정, 다중 계정, role/permission, 세션 영속 저장소
(Redis/DB), `NavUser`의 실제 로그인 사용자 이메일 표시(다음 작업으로 미룸)
