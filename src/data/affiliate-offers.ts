/**
 * アフィリエイト CTA の設定（日本語版記事の `<!-- CTA_SLOT: xxx -->` に差し込まれる）
 *
 * 使い方:
 *   1. ASP（A8.net / もしもアフィリエイト / afb / バリューコマース 等）で提携した案件の
 *      広告リンクを、該当スロットの `offers` に追加する。
 *   2. `url` が空の offer は表示されない。offer が 1 件もないスロットは本番では何も出力しない
 *      （`npm run dev` 中だけ、設定漏れが分かるよう点線のプレースホルダーを表示）。
 *   3. offer があるスロットを含む記事には、冒頭に「PR」表記（ステマ規制対応）が自動で付く。
 *
 * 文言の方針: 記事本文と同じく中立・断定しない。「必ず」「No.1」などの根拠のない表現は書かない。
 */

export interface AffiliateOffer {
  /** サービス名（例: 'リクルートエージェント'） */
  name: string;
  /** ASP の広告リンク。空文字のあいだは表示されない */
  url: string;
  /** 1 行の特徴。公式情報で確認できる事実だけを書く */
  note?: string;
  /** 補足のタグ（例: ['無料', '求人紹介あり']） */
  badges?: string[];
  /** ボタン文言（省略時: 公式サイトを見る） */
  cta?: string;
  /** ASP が要求する計測用 1x1 画像（A8 等）。不要なら省略 */
  impressionPixel?: string;
}

export interface CtaSlot {
  /** ボックスの見出し */
  heading: string;
  /** 見出し下の説明（誰向けか・使う前に何を確認するか） */
  lead: string;
  offers: AffiliateOffer[];
  /** ボックス下の注意書き */
  footnote?: string;
}

export const CTA_SLOTS: Record<string, CtaSlot> = {
  job_search: {
    heading: '求人を見比べたい段階なら',
    lead:
      '応募したい職種や条件がある程度決まっているなら、転職エージェントや転職サイトを併用すると、比較できる求人が増えます。登録は無料のサービスが中心です。許可番号と、紹介の範囲を確認してから使いましょう。',
    offers: [
      // { name: '', url: '', note: '', badges: ['無料'] },
    ],
    footnote: '掲載内容は各社公式サイトの情報をもとにしています。最新の条件は公式サイトでご確認ください。',
  },
  career_consulting: {
    heading: '一人で整理しきれないときは',
    lead:
      '転職するかどうか自体を決めかねているなら、求人紹介ではなく「考えの整理」を目的にしたキャリア相談が合うことがあります。料金体系と、相談でできること・できないことを先に確認しましょう。',
    offers: [],
    footnote: '有料サービスを含みます。料金・解約条件は申込み前に公式サイトでご確認ください。',
  },
  financial_planning: {
    heading: '家計やお金の全体像を相談したいなら',
    lead:
      'FP（ファイナンシャルプランナー）への相談は、家計・保険・資産形成を第三者の視点で整理する手段の一つです。相談料が無料のサービスは、保険や金融商品の販売で収益を得ていることがあります。仕組みを確認したうえで選びましょう。',
    offers: [],
    footnote: '相談は無料でも、商品の購入は任意です。勧誘方針は各社公式サイトでご確認ください。',
  },
  brokerage: {
    heading: '口座を比べてみるなら',
    lead:
      'この記事の確認ポイント（登録・手数料・取扱商品・積立・使いやすさ）を見ながら、公式サイトの条件を比べてみてください。口座開設は無料のところが中心です。',
    offers: [],
    footnote: '投資には元本割れのリスクがあります。手数料やNISAの取扱いは公式サイトで最新の情報をご確認ください。',
  },
  reskilling: {
    heading: '学び直しを具体的に考えるなら',
    lead:
      'スキルの習得を転職や社内異動につなげたいなら、講座の内容と費用、給付金の対象かどうかを比べて選ぶのが現実的です。',
    offers: [],
    footnote: '給付金の対象条件は講座・時期によって異なります。公式サイトと厚生労働省の情報をご確認ください。',
  },
};

const SLOT_RE = /<!--\s*CTA_SLOT:\s*([a-z_]+)\s*-->/g;

export function activeOffers(slot: string): AffiliateOffer[] {
  return (CTA_SLOTS[slot]?.offers ?? []).filter((o) => o.url.trim() !== '');
}

/** 記事本文に含まれる CTA スロットのうち、表示される offer があるもの */
export function getActiveCtaSlots(body: string): string[] {
  const slots = [...body.matchAll(SLOT_RE)].map((m) => m[1]);
  return [...new Set(slots)].filter((s) => activeOffers(s).length > 0);
}

export { SLOT_RE as CTA_SLOT_RE };
