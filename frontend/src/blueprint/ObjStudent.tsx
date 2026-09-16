
export interface objStudent {
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  image_url: string;
  lvl: number;
  projects: {
  name: string;
  slug: string;
  valid: boolean;
  note: number;
  }[];
}

export function makeItPrety(str: string) {
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
}

