export interface LeaderboardEntry {
  rank: number;
  member: {
    name: string;
    primaryZid: string;
    isProUser: boolean;
  };
  invitedBy: {
    name: string;
    primaryZID: string | null;
    isProUser: boolean;
  } | null;
  badges: Badge[];
  referrals: string;
  proSubs: string;
  joined: string;
  meow: string;
  code: string;
}

export interface Badge {
  name: string;
  description: string;
  effect: string;
}

export interface LeaderboardParams {
  page?: number;
  limit?: number;
  sortBy?: 'totalRewards';
}
