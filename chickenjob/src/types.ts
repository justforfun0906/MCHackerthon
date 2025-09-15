export type JobType = 'shift' | 'hourly' | 'remote' | 'contract'

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  pay?: string
  type?: JobType
  description?: string
  contact?: {
    phone?: string
    email?: string
    url?: string
  }
  tags?: string[]
  createdAt: string
}
