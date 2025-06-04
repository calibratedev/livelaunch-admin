'use client'
import { getCookie } from 'cookies-next/client'

import axios, { AxiosRequestConfig } from 'axios'
import { compile, parse } from 'path-to-regexp'
import cloneDeep from 'lodash.clonedeep'
import { stringify } from 'qs'

const request = (url: string, options: AxiosRequestConfig & { isAuthorized?: boolean }) => {
  const { data, baseURL, headers = { 'Content-Type': 'application/json' } } = options

  const cloneData = cloneDeep(data)

  try {
    let domain = ''
    const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/)
    if (urlMatch) {
      ;[domain] = urlMatch
      url = url.slice(domain.length)
    }

    const match = parse(url)
    url = compile(url)(data)

    if (Array.isArray(match)) {
      for (const item of match) {
        if (item instanceof Object && item.name in cloneData) {
          delete cloneData[item.name]
        }
      }
    }
    url = domain + url //why do we need split the URL and then join it back together?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e?.message)
  }
  options.url = url
  options.baseURL = baseURL
  options.headers = headers

  const token = getCookie('token')
  console.log('***** token', token)
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }
  if (options.method?.toUpperCase() === 'GET') {
    options.params = cloneData
  } else if (data instanceof FormData) {
    options.data = data
  } else {
    options.data = cloneData
  }

  options.paramsSerializer = (params) => {
    return stringify(params, { arrayFormat: 'repeat' })
  }

  return axios(options)
    .then((response) => {
      const { statusText, status, data } = response

      const result = {
        success: true,
        message: statusText,
        statusCode: status,
        data,
      }

      return Promise.resolve(result)
    })
    .catch((error) => {
      const { status } = error.response || {}

      if (status === 401 || status === 403) {
      }

      if (status <= 504 && status >= 500) {
        // history.push("/500");
      }
      if (status >= 404 && status < 422) {
      }

      return Promise.reject(error?.response?.data || error)
    })
}

export default request
