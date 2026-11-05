import { CTA_SLOTS, CTA_SLOT_RE, activeOffers } from '../data/affiliate-offers';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderCta(slotKey: string, isDev: boolean): string {
  const slot = CTA_SLOTS[slotKey];
  const offers = activeOffers(slotKey);
  if (!slot || offers.length === 0) {
    return isDev
      ? `<div class="cta-placeholder not-prose">CTA_SLOT: ${esc(slotKey)}（広告リンク未設定 → src/data/affiliate-offers.ts）</div>`
      : '';
  }

  const items = offers
    .map((o) => {
      const badges = (o.badges ?? [])
        .map((b) => `<span class="cta-box__badge">${esc(b)}</span>`)
        .join('');
      const pixel = o.impressionPixel
        ? `<img src="${esc(o.impressionPixel)}" width="1" height="1" alt="" class="cta-box__pixel" loading="lazy" />`
        : '';
      return `<li class="cta-box__offer">
  <div class="cta-box__offer-body">
    <p class="cta-box__name">${esc(o.name)}</p>
    ${badges ? `<div class="cta-box__badges">${badges}</div>` : ''}
    ${o.note ? `<p class="cta-box__note">${esc(o.note)}</p>` : ''}
  </div>
  <a class="cta-box__button" href="${esc(o.url)}" target="_blank" rel="sponsored nofollow noopener" data-aff-slot="${esc(slotKey)}" data-aff-name="${esc(o.name)}">${esc(o.cta ?? '公式サイトを見る')}<span aria-hidden="true"> →</span></a>${pixel}
</li>`;
    })
    .join('\n');

  return `<aside class="cta-box not-prose" aria-label="PR: ${esc(slot.heading)}">
  <p class="cta-box__eyebrow"><span class="cta-box__pr">PR</span>${esc(slot.heading)}</p>
  <p class="cta-box__lead">${esc(slot.lead)}</p>
  <ul class="cta-box__offers">${items}</ul>
  ${slot.footnote ? `<p class="cta-box__footnote">${esc(slot.footnote)}</p>` : ''}
</aside>`;
}

/** Replace every `<!-- CTA_SLOT: xxx -->` in a rendered HTML page. */
export function injectCtaSlots(html: string, isDev: boolean): string {
  return html.replace(CTA_SLOT_RE, (_m, slot: string) => renderCta(slot, isDev));
}
