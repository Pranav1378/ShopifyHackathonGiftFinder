export type RecipientProfile = {
  id: string;
  displayName: string;
  budgets?: number[];
  favColors?: string[];
  styleTags?: string[];
  dislikedTags?: string[];
};

export type GachaIntent = {
  profileId: string;
  budget: number;
  occasion?: string;
  vibes: string[];
  dislikes?: string[];
  colors?: string[];
};

