import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './messages'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

// 여러 컴포넌트(사이드바, 헤더, 모든 페이지)가 공유하는 순수 클라이언트 상태라 Zustand를 쓴다.
// nav.ts/footer.ts처럼 React 트리 밖(모듈 스코프)에서도 useLocaleStore.getState().locale로
// 바로 읽을 수 있어서, getNavItems(locale) 같은 함수형 패턴과 잘 맞는다.
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'ko',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'locale' },
  ),
)
