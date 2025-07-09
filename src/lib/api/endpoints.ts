const endpoints = {
  me: 'GET /api/admin/me',
  login: 'POST /api/admin/login',
  logout: 'POST /api/admin/logout',
  updateMe: 'PUT /api/admin/me',
  updateMePassword: 'PUT /api/admin/me/password',

  getS3Signatures: 'POST /api/common/s3_signatures',
  getS3Signature: 'POST /api/common/s3_signature',

  dashboard: '/api/admin/dashboard',
  paginateBrands: '/api/admin/brands',
  getBrand: '/api/admin/brands/:brand_id',
  getShopifyOauthUrl: 'GET /api/admin/brands/:brand_id/shopify_oauth_url',
  createBrand: 'POST /api/admin/brands',
  updateBrand: 'PUT /api/admin/brands/:brand_id',
  deleteBrand: 'DELETE /api/admin/brands/:brand_id',

  createBrandProduct: 'POST /api/admin/brand_products',
  updateBrandProduct: 'PUT /api/admin/brand_products/:product_id',
  deleteBrandProduct: 'DELETE /api/admin/brand_products/:product_id',
  paginateProducts: '/api/admin/brand_products',
  generateProductScanUrl: 'POST /api/admin/brand_products/:product_id/scan_url',

  getProduct: '/api/admin/brand_products/:product_id',

  paginateDeviceSessions: '/api/admin/device_sessions',
  deleteDeviceSession: 'DELETE /api/admin/device_sessions/:device_session_id',

  paginateBrandDeviceSessions: '/api/admin/brand_device_sessions',
  getBrandDeviceSession: '/api/admin/brand_device_sessions/:session_id',
  deleteBrandDeviceSession: 'DELETE /api/admin/brand_device_sessions/:session_id',

  getSocialAccounts: '/api/admin/social_accounts',
  createSocialAccount: 'POST /api/admin/social_accounts',
  removeSocialAccount: 'DELETE /api/admin/social_accounts/:platform',
  paginateScans: '/api/admin/scans',
  getScan: '/api/admin/scans/:scan_id',
  syncScan: 'POST /api/admin/scans/:scan_id/sync',
}

export default endpoints
