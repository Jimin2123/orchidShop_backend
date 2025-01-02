export enum ProductDiscountType {
  PERCENTAGE = 'PERCENTAGE', // 퍼센트 할인 (예: 10% 할인)
  FIXED_AMOUNT = 'FIXED_AMOUNT', // 고정 금액 할인 (예: 10,000원 할인)
  BUY_ONE_GET_ONE = 'BUY_ONE_GET_ONE', // 1+1 프로모션
  FREE_SHIPPING = 'FREE_SHIPPING', // 무료 배송
  SEASONAL = 'SEASONAL', // 계절별 할인
  MEMBER_ONLY = 'MEMBER_ONLY', // 특정 멤버 전용 할인
}
