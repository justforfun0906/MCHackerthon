import type { Job, JobType } from '../types'

const now = () => new Date().toISOString()

let JOBS: Job[] = [
  {
    id: '1',
    title: 'Barista (Weekend)',
    company: 'Bean House',
    location: 'Downtown',
    pay: '$15/hr',
    type: 'shift',
    description: 'Help our team on weekends. No experience required.',
    contact: { phone: '+10000000000', email: 'hr@beanhouse.test' },
    tags: ['weekend', 'no-exp'],
    createdAt: now(),
  },
  {
    id: '2',
    title: 'Event Staff',
    company: 'City Events',
    location: 'Riverside',
    pay: '$18/hr',
    type: 'shift',
    description: 'Assist with setup and guest support at local events.',
    contact: { phone: '+10000000001' },
    tags: ['evening'],
    createdAt: now(),
  },
]

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export interface ListParams {
  q?: string
  location?: string
  type?: JobType
}

export async function listJobs(params: ListParams = {}): Promise<Job[]> {
  await delay()
  const q = params.q?.toLowerCase().trim()
  const loc = params.location?.toLowerCase().trim()
  return JOBS.filter((j) => {
    const hitsQ = !q || [j.title, j.company, j.description].some((v) => v?.toLowerCase().includes(q))
    const hitsLoc = !loc || j.location?.toLowerCase().includes(loc)
    const hitsType = !params.type || j.type === params.type
    return hitsQ && hitsLoc && hitsType
  })
}

export async function getJob(id: string): Promise<Job | undefined> {
  await delay()
  return JOBS.find((j) => j.id === id)
}

export interface CreateJobInput {
  title: string
  company: string
  location?: string
  pay?: string
  type?: JobType
  description?: string
  contact?: Job['contact']
  tags?: string[]
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  await delay()
  const job: Job = {
    id: String(Date.now()),
    createdAt: now(),
    ...input,
  }
  JOBS = [job, ...JOBS]
  return job
}
