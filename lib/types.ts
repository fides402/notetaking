export interface Note {
  id: string
  title: string
  content: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}
