import { Method } from 'axios'
import request from './request'
import endpoints from './endpoints'
import config from '@/config'

export interface ApiResponse<T = object> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

interface IOption {
  headers?: { [key: string]: string }
  params?: object
  baseURL?: string
}

const gen = (params: string, baseURL?: string) => {
  let url = params
  let method: Method = 'GET'

  const paramsArray = params.split(' ')
  if (paramsArray.length === 2) {
    method = paramsArray[0] as Method
    url = paramsArray[1]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (data: any, options: IOption) {
    return request(url, {
      data: data,
      method,
      params: options?.params,
      baseURL: options?.baseURL || baseURL,
      headers: options?.headers || {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APIFunc = <T>(data?: any, option?: IOption) => Promise<ApiResponse<T>>

export type APIMap = {
  [key in keyof typeof endpoints]: APIFunc
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api: any = {}

for (const key in endpoints) {
  const apiURL = config.apiUrl

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api[key] = gen((endpoints as any)[key], apiURL)
}

export type EndPoints = keyof typeof endpoints

export default api as APIMap
