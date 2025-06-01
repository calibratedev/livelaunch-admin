const endpoints = {
  login: '/api/admin/login',
  logout: '/api/admin/logout',
  me: '/api/admin/me',

  getS3Signatures: 'POST /api/common/s3_signatures',
  getS3Signature: 'POST /api/common/s3_signature',

  dashboard: '/api/admin/dashboard',
  paginateBrands: '/api/admin/brands',
  getBrand: `/api/admin/brands/:brand_id`,
  createBrand: 'POST /api/admin/brands',
  updateBrand: `PUT /api/admin/brands/:brand_id`,
  deleteBrand: `DELETE /api/admin/brands/:brand_id`,
  createBrandProduct: 'POST /api/admin/brand_products',
  updateBrandProduct: `PUT /api/admin/brand_products/:product_id`,
  deleteBrandProduct: `DELETE /api/admin/brand_products/:product_id`,
  paginateProducts: '/api/admin/brand_products',
  getProduct: `/api/admin/brand_products/:product_id`,
  paginateDeviceSessions: '/api/admin/device_sessions',
  getDeviceSession: `/api/admin/device_sessions/:session_id`,
  paginateBrandDeviceSessions: '/api/admin/brand_device_sessions',
  getBrandDeviceSession: `/api/admin/brand_device_sessions/:session_id`,
  
}

export default endpoints;