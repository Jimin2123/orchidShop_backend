export function GetMethodName() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 메서드 이름을 클래스의 `contextName`에 설정
      this.methodName = propertyKey;

      // 원래 메서드 실행
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
