
export interface MyreAction {
  action_type: string,
  target_login: string,
  suggested_text: string,
}

export interface MyreAnswer {
  query: string,
  answer: string,
  sources: string[],
  action: MyreAction | null,
}
