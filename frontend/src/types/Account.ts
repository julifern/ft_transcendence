
export interface Account {
  sync_config: { 
    year: string,
    month: string,
  }
  whitelist: string[],
  profils_count: number,
}
