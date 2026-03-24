export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  score_date: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
}