// 데모 계정입니다. 실제 서비스로 교체할 때 이 파일 하나만 지우고
// src/server/auth.ts의 loginFn 검증 로직을 DB/외부 인증 서비스 호출로 바꾸면 됩니다.
export const DEMO_ACCOUNT = {
  email: 'admin@example.com',
  password: 'admin1234',
}
