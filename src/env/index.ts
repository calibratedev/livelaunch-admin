import { env as devEnv } from './dev'
import { env as localEnv } from './local'
import { env as prodEnv } from './prod'
const buildEnv = process.env.BUILD_ENV || 'dev'

const commonEnv = {
  BUILD_DATE: new Date().toISOString(),
}

const config = {
  dev: {
    ...commonEnv,
    ...devEnv,
  },
  local: {
    ...commonEnv,
    ...localEnv,
  },
  prod: {
    ...commonEnv,
    ...prodEnv,
  },
}

export const env = config[buildEnv as keyof typeof config]

export type Env = typeof env
