import { env as devEnv } from './dev'
import { env as localEnv } from './local'

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
}

export const env = config[buildEnv as keyof typeof config]

export type Env = typeof env

console.log('Using env: ', buildEnv)
console.log(env)
