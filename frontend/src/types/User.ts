export interface User {
  authenticated: boolean,
  user_dict : {
    id: number,
    login: string,
    email: string,
    first_name: string,
    last_name: string,
    image_url: string,
    kind: string,
    location: string,
    followed: string[],
  }
}
