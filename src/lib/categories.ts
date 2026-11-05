export const CATEGORIES = ['focus', 'work', 'money', 'habits'] as const;

/** All category slugs that accept Japanese blog posts under /jp/{category}/{slug}. */
export const JP_CATEGORIES = ['framework', 'focus', 'work', 'money', 'habits'] as const;

/** Category + Framework nav slugs (shared EN/JA URL segments). */
export const NAV_CATEGORY_SLUGS = ['framework', 'focus', 'work', 'money', 'habits'] as const;

export const CATEGORY_TITLES: Record<string, string> = {
  framework: 'Framework',
  focus: 'Focus',
  work: 'Work',
  money: 'Money',
  habits: 'Habits',
};

/** Short Japanese labels for nav, cards and article meta on /jp. */
export const CATEGORY_TITLES_JA: Record<string, string> = {
  framework: '考え方',
  focus: '集中',
  work: '仕事・キャリア',
  money: 'お金',
  habits: '習慣',
};

/** <title> / meta description for /jp/{category} listing pages. */
export const CATEGORY_SEO_JA: Record<string, { title: string; description: string }> = {
  framework: {
    title: '決められないときの考え方｜選択肢と判断軸の整理',
    description: '迷って決められないときに、選択肢・判断軸・小さな次の一歩を整理するための記事一覧です。仕事・お金・習慣の判断に共通する考え方をまとめています。',
  },
  focus: {
    title: '集中できない・考えすぎるときの記事一覧',
    description: '集中できない、考えすぎて決められないときに、注意の向け方と情報との距離を見直すための記事一覧です。',
  },
  work: {
    title: '転職・キャリアの迷いを整理する記事一覧｜転職エージェント・キャリア相談',
    description: '転職するか迷う、会社を辞めたい、転職エージェントやキャリア相談を使うべきか――仕事とキャリアの判断材料を中立的に整理した記事一覧です。',
  },
  money: {
    title: 'お金の不安・家計・投資の始め方を整理する記事一覧',
    description: 'お金の不安、家計の見直し、投資を始める前の準備、証券会社やFP相談の選び方を、一次情報をもとに整理した記事一覧です。',
  },
  habits: {
    title: '習慣が続かないときの記事一覧｜続く仕組みの作り方',
    description: '習慣が続かない理由を意志の強さではなく、きっかけ・手間・環境から見直すための記事一覧です。',
  },
};

export function categoryLabel(slug: string, locale: 'en' | 'ja' = 'en'): string {
  return (locale === 'ja' ? CATEGORY_TITLES_JA[slug] : CATEGORY_TITLES[slug]) ?? slug;
}

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
