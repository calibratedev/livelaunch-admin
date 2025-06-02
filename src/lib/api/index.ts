import { Method } from 'axios'
import request from './request'
import endpoints from './endpoints'
import config from '@/config'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  statusCode: number
  code?: number
  data: T
  msg?: string
}

type Option = {
  headers?: object
  params?: object
}

// Define the type for the getQueryKey function
type GetQueryKeyFunction = (...optionalParams: unknown[]) => unknown[]

// Define the type for each API method with getQueryKey
type ApiMethodWithQueryKey = {
  <T>(data?: unknown, option?: Option): Promise<ApiResponse<T>>
  getQueryKey: GetQueryKeyFunction
}

// Update APIMap to reflect the actual structure
type APIMap = {
  [key in keyof typeof endpoints]: ApiMethodWithQueryKey
}

const gen = (params: string, baseURL = config?.apiUrl) => {
  let url = params
  let method: Method = 'GET'

  const paramsArray = params.split(' ')
  if (paramsArray.length === 2) {
    method = paramsArray[0] as Method
    url = paramsArray?.[1]
  }

  return function (data: unknown, options: Option) {
    return request(url, {
      method,
      baseURL,
      data,
      params: options?.params,
      headers: options?.headers,
    })
  }
}

// Update the Api object typing
const Api: Partial<APIMap> = {}

for (const key in endpoints) {
  if (Object.prototype.hasOwnProperty.call(endpoints, key)) {
    const apiMethod = gen(endpoints[key as keyof typeof endpoints]) as ApiMethodWithQueryKey
    apiMethod['getQueryKey'] = (...params: unknown[]) => [key, ...params]
    Api[key as keyof typeof endpoints] = apiMethod
  }
}

export default Api as APIMap
