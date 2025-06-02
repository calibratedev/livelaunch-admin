import config from '@/config'

export const getAttachmentUrl = (attachment?: AppTypes.Attachment) => {
  return attachment?.file_key ? `${config.storageUrl}/${attachment?.file_key}` : undefined
}

export const getAttachmentFileName = (attachment?: AppTypes.AttachmentFile | null) => {
  if (!attachment) {
    return ''
  }
  if (attachment instanceof File) {
    return attachment?.name || ''
  } else {
    return attachment?.file_name || ''
  }
}
