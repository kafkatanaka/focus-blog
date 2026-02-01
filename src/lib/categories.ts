export const CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;

export const CATEGORY_TITLES: Record<string, string> = {
  focus: 'Focus',
  work: 'Work',
  money: 'Money',
  habits: 'Habits',
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  focus: 'Articles on attention, concentration, and protecting your focus.',
  work: 'Articles on productivity, remote work, and getting things done.',
  money: 'Articles on financial decisions, opportunity cost, and attention economics.',
  habits: 'Articles on building systems, routines, and sustainable practices.',
};
