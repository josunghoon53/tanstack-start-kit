import { messages } from './messages'
import { useLocaleStore } from './locale-store'

// 호출부(컴포넌트)는 로케일 상태가 어디서 오는지 몰라도 되고, useTranslation()만 쓰면 된다.
export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  return messages[locale]
}
