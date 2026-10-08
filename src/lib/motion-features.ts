import { domMax } from 'motion/react'

// loadLayoutFeatures()가 동적 import하는 파일. 이 파일을 따로 둬야 domMax(레이아웃/드래그)가
// 메인 번들이 아니라 별도 청크로 빠진다.
export default domMax
