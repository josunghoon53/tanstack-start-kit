import type { StatusTone } from '@/components/status-dot'

export type ContentStatus = '발행' | '초안'

export interface ContentItem {
  title: string
  author: string
  status: ContentStatus
  date: string
}

export const CONTENT_STATUS_TONE: Record<ContentStatus, StatusTone> = {
  발행: 'success',
  초안: 'neutral',
}

export const CONTENTS: Array<ContentItem> = [
  { title: '9월 신규 기능 안내', author: '김민지', status: '발행', date: '2026-09-15' },
  { title: '가을맞이 프로모션 소개', author: '이서준', status: '발행', date: '2026-09-10' },
  { title: '고객센터 FAQ 개편안', author: '박지훈', status: '초안', date: '2026-09-22' },
  { title: '10월 뉴스레터 초안', author: '최유나', status: '초안', date: '2026-09-24' },
]
