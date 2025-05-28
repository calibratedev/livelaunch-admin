export const queryKeys = {
    login: ['login'] as const,
    logout: ['logout'] as const,
    me: ['me'] as const,
    dashboard: ['dashboard'] as const,
    brands: ['brands'] as const,
    brand: (id: number) => ['brands', id] as const,
    products: ['products'] as const,
    product: (id: number) => ['products', id] as const,
    deviceSessions: ['deviceSessions'] as const,
    deviceSession: (id: string) => ['deviceSessions', id] as const,
    brandDeviceSessions: ['brandDeviceSessions'] as const,
    brandDeviceSession: (id: string) => ['brandDeviceSessions', id] as const,
  }
  