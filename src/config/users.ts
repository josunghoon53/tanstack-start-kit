import type { StatusTone } from '@/components/status-dot'

export type UserStatus = '활성' | '비활성'

export interface UserItem {
  name: string
  email: string
  role: string
  status: UserStatus
  joinedAt: string
}

export const USER_STATUS_TONE: Record<UserStatus, StatusTone> = {
  활성: 'success',
  비활성: 'neutral',
}

export const USERS: Array<UserItem> = [
  { name: '김민지', email: 'minji.kim@example.com', role: '관리자', status: '활성', joinedAt: '2026-01-14' },
  { name: '이서준', email: 'seojun.lee@example.com', role: '편집자', status: '활성', joinedAt: '2026-02-03' },
  { name: '박지훈', email: 'jihoon.park@example.com', role: '뷰어', status: '비활성', joinedAt: '2026-03-21' },
  { name: '최유나', email: 'yuna.choi@example.com', role: '편집자', status: '활성', joinedAt: '2026-05-09' },
]
