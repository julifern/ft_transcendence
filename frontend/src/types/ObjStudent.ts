import type { Project } from "./Project";

export interface ProfileBase {
  id: number,
  login: string,
  email: string,
  first_name: string,
  last_name: string,
  image_url: string,
}

export interface profile extends ProfileBase {
  pool_year: string,
  pool_month: string,
  lvl: number,
  location: string,
  is_online: boolean,
  correction_point: number,
    soft_skills: {
    timidity: string | null
    stress: string | null
    peer_help: string | null
    self_research: string | null
    perseverance: string | null
  }
  presence: {
    total_hours: string | null
    daily_average_hours: string | null
    time_slots: {
      morning_hours: string | null
      afternoon_hours: string | null
      night_hours: string | null
    }
    preferred_slot: string
  }
  risk_score: string | null
  risk_level: string
  projects: Project[],
  comments: Comment[]
}

export interface profiles  {
  profils: profile[]
}
