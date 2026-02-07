# Focus Dividend Implementation Specification

**Version:** 1.0  
**Date:** February 7, 2026  
**Total Estimated Work:** 150-200 hours over 6 months

---

## Executive Summary

### Current State
- **Total Articles:** 325 articles (Focus: 92, Work: 91, Money: 76, Habits: 66)
- **Structure:** Flat category organization
- **Monetization:** AdSense only

### Goal State
- **5 Pillar Pages:** Framework (mega-pillar) + 4 category pillars
- **30 New Articles:** High-CPC topics
- **Affiliate Integration:** Amazon Associates, ShareASale, Personal Capital
- **Revenue Target:** $1,300/month at 6 months, $2,200/month at 12 months

### Implementation Phases
1. **Phase 0 (Month 1-2):** Create 5 pillar pages ✅ *Done (structure + placeholders)*
2. **Phase 1 (Month 2-3):** Implement affiliate programs on existing articles
3. **Phase 2 (Month 3-5):** Write and publish 5 priority new articles
4. **Phase 3 (Month 5-6):** Internal linking optimization
5. **Phase 4 (Month 6+):** Add remaining 25 articles based on performance

---

## Site Architecture (Implemented)

### Navigation
- **Header:** Home | Framework | Focus | Work | Money | Habits
- **Footer:** Framework | RSS

### URL Structure
```
/framework                          ← Framework (replaces /about)
/focus                              ← Category
/focus/attention-management-guide   ← Pillar
/work/sustainable-productivity-guide
/money/intentional-money-guide
/habits/behavior-design-guide
/{slug}                             ← Individual articles (unchanged)
```

### Redirects
- `/about` → `/framework` (301) via `public/_redirects`

---

## Phase 0 Checklist (Completed)

- [x] Framework page at `/framework` (minimal content; expand to 8,000 words later)
- [x] Header: Framework link added
- [x] Footer: About → Framework
- [x] Redirect `/about` → `/framework`
- [x] Reserved slug `framework` in `[slug].astro` and sitemap script
- [x] Four pillar placeholder pages:
  - `/focus/attention-management-guide`
  - `/work/sustainable-productivity-guide`
  - `/money/intentional-money-guide`
  - `/habits/behavior-design-guide`
- [x] Sitemap script updated (framework + 4 pillar URLs)

---

## Phase 0 Content (Current)

1. **Framework page:** Full content in `src/pages/framework.mdx` (~8,000 words). Internal links: pillar URLs like `/focus/attention-management-guide` (no trailing slash); article URLs use `/{slug}`.
2. **Pillar pages:** All four pillars are `.mdx` with `FrameworkLayout`:
   - `src/pages/focus/attention-management-guide.mdx` – Full content with corrected internal links.
   - `src/pages/work/sustainable-productivity-guide.mdx` – Full content with corrected internal links.
   - `src/pages/money/intentional-money-guide.mdx` – Full content after running `scripts/pillar-link-fix.mjs` (see README “Finalize before deploy”).
   - `src/pages/habits/behavior-design-guide.mdx` – Full content after running `scripts/pillar-link-fix.mjs` (see README “Finalize before deploy”).

### Internal link rules

- **Articles:** Live at `/{slug}` (e.g. `/attention-management-beats-time-management`). Do not use `/focus/slug` for articles.
- **Pillar pages:** Use full path, no trailing slash: `/focus/attention-management-guide`, `/work/sustainable-productivity-guide`, `/money/intentional-money-guide`, `/habits/behavior-design-guide`.
- **Framework:** `/framework`.

### Generating full pillar content from source MD files

元 MD は **`src/content/pillar-sources/`** に置く。Downloads から移動・コピーする場合はファイル名をそのまま使う（`src/content/pillar-sources/README.md` 参照）。プロジェクト直下で:

```bash
node scripts/pillar-link-fix.mjs src/content/pillar-sources/attention-management-guide.md src/pages/focus/attention-management-guide.mdx --frontmatter
node scripts/pillar-link-fix.mjs src/content/pillar-sources/sustainable-productivity-guide.md src/pages/work/sustainable-productivity-guide.mdx --frontmatter
node scripts/pillar-link-fix.mjs src/content/pillar-sources/intentional-money-guide.md src/pages/money/intentional-money-guide.mdx --frontmatter
node scripts/pillar-link-fix.mjs src/content/pillar-sources/behavior-design-guide.md src/pages/habits/behavior-design-guide.mdx --frontmatter
```

（frontmatter は `--frontmatter` で自動付与。3 本まとめて: `node scripts/write-pillars.mjs`）

The script (`scripts/pillar-link-fix.mjs`) converts `/category/slug/` to `/{slug}` for articles and keeps pillar URLs; it also applies slug aliases for titles that don’t match filenames.

---

## File Structure

```
src/pages/
  framework.astro
  focus/attention-management-guide.astro
  work/sustainable-productivity-guide.astro
  money/intentional-money-guide.astro
  habits/behavior-design-guide.astro
  about.astro  ← can be removed (redirect handles /about)
```

---

## Reference: Full Spec

The complete specification (pillar outlines, new article briefs, affiliate guide, internal linking, SEO, metrics) is in the project conversation history. Key sections:

- **Pillar specs:** Framework outline, Attention Management, Sustainable Productivity, Intentional Money, Behavior Design
- **Phase 2 articles:** Sleep & investments, portfolio checking, SaaS sprawl, index funds vs stocks, sleep/career/investments
- **Affiliate:** Amazon, ShareASale, Personal Capital, disclosure page
- **Internal linking:** Theme clusters, cross-category links, placement rules

---

*Last updated: February 7, 2026*
