import Axios from 'axios'
import api, { ApiResponse } from '.'

type IResource = 'user' | 'brand' | 'brand_product'

async function uploadS3(url: string, formData: FormData, meta: Partial<AppTypes.Attachment> = {}) {
  const amzCredential = formData.get('x-amz-credential')?.toString()

  return new Promise<ApiResponse<AppTypes.Attachment>>((resolve, reject) => {
    Axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Amz-Credential': amzCredential,
      },
    })
      .then(() => {
        const file_key = formData.get('key')?.toString()
        const content_type = formData.get('content-type')?.toString()
        const data: AppTypes.Attachment = {
          content_type: content_type,
          file_key: file_key,
          ...(meta ?? {}),
        }
        resolve({
          success: true,
          message: 'Upload success',
          statusCode: 200,
          data: data,
        })
      })
      .catch((error) => {
        reject({
          success: false,
          statusCode: 400,
          message: error.message,
          data: {},
        })
      })
  })
}

export async function uploadFiles(files: AppTypes.AttachmentFile[], resource: IResource) {
  if (!Array.isArray(files)) {
    files = [files]
  }

  const validFiles = files?.filter((file) => {
    if (file?.file_key) {
      return !file?.file_key?.startsWith('uploads')
    }
    if (file instanceof File) {
      return !!file?.name
    }
    return false
  })
  const attachments: AppTypes.Attachment[] = files?.filter((file) => {
    if (file?.file_key) {
      return file?.file_key?.startsWith('uploads')
    }
    if (file instanceof File) {
      return !!file?.name
    }
    return false
  })

  let calls: Promise<AppTypes.Attachment>[] = []

  if (validFiles?.length) {
    const results = await api.getS3Signatures<AppTypes.Records<AppTypes.S3Signature>>({
      records: validFiles.map((file) => ({
        content_type: file instanceof File ? file.type : file.content_type,
        resource,
      })),
    })

    calls = results.data?.records?.map(async (item, index) => {
      const file = validFiles?.[index]

      const formData = new FormData()
      const { url, key, ...other } = item
      Object.keys(other).forEach((k) => formData.append(k, other[k as keyof typeof other]))
      formData.append('key', key)

      // @ts-expect-error file is not typed correctly
      if (file?.file) {
        // @ts-expect-error file is not typed correctly
        formData.append('file', file?.file)
      } else {
        formData.append('file', file as File)
      }

      const { data } = await uploadS3(url, formData, {
        ...file,
        metadata: {
          name: file instanceof File ? file?.name : file?.file_name,
          size: file instanceof File ? file?.size : file?.metadata?.size,
        },
      })

      return data
    })
  }

  const data = await Promise.all(calls)

  data.push(...attachments)

  return data as AppTypes.Attachment[]
}

export async function uploadFile(imageFile: File, prefix: IResource) {
  const respSignature = await api.getS3Signature<AppTypes.S3Signature>({
    content_type: imageFile.type,
    resource: prefix,
  })
  if (!respSignature.success) {
    throw respSignature.data
  }

  const formData = new FormData()
  const { url, key, ...other } = respSignature?.data

  Object.keys(other).forEach((k) => formData.append(k, other[k as keyof typeof other]))

  formData.append('key', key)
  formData.append('file', imageFile as File)
  const { success, data } = await uploadS3(url, formData)

  if (!success) {
    throw data
  }

  data.metadata = Object.assign(data.metadata ?? {}, {
    name: imageFile?.name,
    size: imageFile?.size,
  })

  return { success, data }
}

export async function createFile(path: string, name: string, type: string): Promise<File> {
  const response = await fetch(path)
  const data = await response.blob()
  const metadata = {
    type: type,
  }

  return new File([data], name, metadata)
}
