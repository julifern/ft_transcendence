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
    timidity: string,
    stress: string,
    peer_help: string,
    self_research: string,
    perseverance: string,
  },
  presence: {
    total_hours: string,
    daily_average_hours: string,
    time_slots: {
      morning_hours: string,
      afternoon_hours: string,
      night_hours: string,
    },
    preferred_slot: string
  },
  risk_score: string,
  risk_level: string,
  projects: Project[],
  comments: Comment[]
}

export interface profiles  {
  profils: profile[]
}

// export interface objStudent {
//   login: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   image_url: string;
//   lvl: number;
//   projects: {
//   name: string;
//   slug: string;
//   valid: boolean;
//   note: number;
//   }[];
// }
