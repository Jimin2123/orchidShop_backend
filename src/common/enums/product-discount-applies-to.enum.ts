export enum DiscountAppliesTo {
  PRODUCT = 'PRODUCT', // 특정 상품에 적용
  CATEGORY = 'CATEGORY', // 특정 카테고리에 적용
  USER = 'USER', // 특정 사용자에 적용
  USER_GRADE = 'USER_GRADE', // 특정 사용자 그룹에 적용 (예: BRONZE, SILVER, GOLD)
  GLOBAL = 'GLOBAL', // 모든 사용자에게 적용
  SHIPPING = 'SHIPPING', // 배송비에 적용
  TEG = 'TEG', // 특정 태그에 적용
}
