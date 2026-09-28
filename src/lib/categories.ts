export const CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;

/** Category + Framework nav slugs (shared EN/JA URL segments). */
export const NAV_CATEGORY_SLUGS = ['framework', 'focus', 'work', 'money', 'habits'] as const;

export const CATEGORY_TITLES: Record<string, string> = {
  framework: 'Framework',
  focus: 'Focus',
  work: 'Work',
  money: 'Money',
  habits: 'Habits',
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  framework: 'How the four pillars fit together for knowledge workers.',
  focus: 'Articles on attention, concentration, and protecting your focus.',
  work: 'Articles on productivity, remote work, and getting things done.',
  money: 'Articles on financial decisions, opportunity cost, and attention economics.',
  habits: 'Articles on building systems, routines, and sustainable practices.',
};

export const CATEGORY_SUBTITLES_JA: Record<string, string> = {
  framework: '考え方と意思決定',
  focus: '集中・注意・情報との距離',
  work: '仕事・キャリア・働き方',
  money: 'お金・収入・選択',
  habits: '習慣・行動・日々の設計',
};

export const CATEGORY_DESCRIPTIONS_JA: Record<string, string> = {
  framework: '知識労働者のための、注意・仕事・お金・習慣の考え方。',
  focus: '集中力、注意の設計、情報との距離について。',
  work: '生産性、キャリア、働き方について。',
  money: 'お金の判断、機会費用、認知的な負担について。',
  habits: '習慣、行動設計、続けられる仕組みについて。',
};
