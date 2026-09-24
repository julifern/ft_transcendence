import type { ProfileBase } from "./ObjStudent";

export interface User {
  authenticated: boolean,
  user_dict : {
    ProfileBase: ProfileBase,
    kind: string,
    location: string,
    followed: string[],
  }
}
