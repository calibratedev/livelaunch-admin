declare global {
  export namespace AppTypes {
    export type AttachmentFile =
      | (File & { file_key?: never }) // File explicitly cannot have file_key
      | Attachment // Attachment can have file_key

    type PaginationParams = {
      page: number
      limit: number
      keyword: string
      include_count: boolean
    }

    export interface S3Signature {
      key: string
      url: string
      policy: string
      'x-amz-credential': string
      'x-amz-algorithm': string
      'x-amz-signature': string
      'x-amz-date': string
      acl: string
      'content-type': string
    }

    export interface Records<T> {
      records: Array<T>
    }

    type PaginatedResponse<T> = {
      has_next: boolean
      has_prev: boolean
      per_page: number
      next_page: number
      current_page: number
      prev_page: number
      offset: string
      records: T[]
      total_record: number
      total_page: number
      metadata: object
      total_current_record: number
    }

    export interface PaginatedResponse<T> {
      data: T[]
      total: number
      page: number
      limit: number
    }

    export interface User {
      id: string
      email: string
      first_name: string
      last_name: string
      avatar?: Attachment
      role: string
    }

    export interface LoginResponse {
      user: User
      token: string
    }

    export interface LoginForm {
      email: string
      password: string
    }

    export interface Attachment {
      content_type?: string
      file_url?: string
      file_key?: string
      file_name?: string
      thumbnail_url?: string
      metadata?: Record<string, unknown>
    }

    export interface Brand {
      id: string
      created_at: string
      updated_at: string

      shopify_id: string
      shopify_domain: string
      domain: string
      access_token: string
      name: string
      email: string
      currency: string
      source_primary_location_id: string
      has_fetched_products: boolean
      primary_color: string
      get_started_image_attachment: Attachment
      logo_image_attachment: Attachment
      background_image_attachment: Attachment
      frame_image_attachment: Attachment
    }

    export interface Product {
      id: string
      created_at: string
      updated_at: string

      shopify_id: number

      brand_id: string
      brand: Brand

      title: string
      price: number
      handle: string
      description: string
      product_type: string
      status: string
      tags: string
      image: string
      category: string
      branch_link: string
    }

    export type BrandDeviceSession = {
      id: string
      brand_id: string
      device_id: string
      created_at: number
      updated_at: number

      ip_address: string
      device_name: string
      app_version: string
      app_platform: string
      app_name: string
      app_env: string
      region_code: string
      timezone: string
      latitude: number
      longitude: number
    }

    export type DeviceSession = {
      id: string
      created_at: number
      updated_at: number

      device_id: string
      user_agent: string
      ip_address: string
      email: string
    }

    export interface DashboardStats {
      totalUsers: number
      activeBrands: number
      totalProducts: number
      revenue: string
      recentBrands: Brand[]
      recentProducts: Product[]
    }
  }
}

export {}
