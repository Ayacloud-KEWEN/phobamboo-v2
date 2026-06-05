import { CATEGORY_ORDER } from '../stores/menu';
import { localizedName, i18n } from '../i18n';

// Build a nicely styled, printable A4 menu (with dish photos) and open the
// print dialog. Grouped by category + sub-category.
const GROUPED = ['menus', 'plats', 'boissons', 'alcool'];

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Strip the "0- " sort prefix from sub-category labels for display.
const cleanSub = (k) => k.replace(/^\s*\d+\s*[-.)]?\s*/, '');

export async function printMenu(products, restaurant = {}) {
  const name = restaurant.name || 'Pho Bamboo';
  const logo = restaurant.logo || '';
  const host = window.location.host || 'phobamboo.fr';
  const catLabel = (cat) => i18n.global.t(`categories.${cat}`);

  const byCat = (cat) => products.filter((p) => p.category === cat);

  const dishRow = (item) => {
    const nm = esc(localizedName(item));
    const desc = item.description ? `<div style="font-size:11.5px;color:#6b7280;margin-top:2px;line-height:1.3;">${esc(item.description)}</div>` : '';
    const thumb = item.image
      ? `<img src="${esc(item.image)}" style="width:62px;height:62px;object-fit:cover;border-radius:10px;border:1px solid #eee;flex-shrink:0;">`
      : '';
    return `<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px dotted #d1d5db;page-break-inside:avoid;">
      ${thumb}
      <div style="flex:1;min-width:0;">
        <div style="font-size:14.5px;font-weight:bold;color:#1f2937;">${nm}</div>
        ${desc}
      </div>
      <div style="font-size:15px;font-weight:bold;color:#166534;white-space:nowrap;">${item.price.toFixed(2)}€</div>
    </div>`;
  };

  let body = '';
  for (const cat of CATEGORY_ORDER) {
    const items = byCat(cat);
    if (!items.length) continue;

    const groups = {};
    if (GROUPED.includes(cat)) {
      for (const d of items) (groups[d.subCategory || 'General'] ||= []).push(d);
    } else {
      groups['General'] = items;
    }

    body += `<div style="page-break-inside:avoid;">
      <h2 style="background:linear-gradient(135deg,#2d5a27,#4a7c59);color:#fff;font-size:16px;padding:8px 14px;border-radius:8px;margin:22px 0 10px;text-transform:uppercase;letter-spacing:1px;">${esc(catLabel(cat))}</h2>`;
    for (const key of Object.keys(groups).sort()) {
      if (key !== 'General') {
        body += `<div style="font-size:12.5px;font-weight:bold;color:#4a7c59;text-transform:uppercase;letter-spacing:1px;margin:14px 0 4px;border-bottom:1px solid #e5e7eb;padding-bottom:3px;">${esc(cleanSub(key))}</div>`;
      }
      for (const item of groups[key]) body += dishRow(item);
    }
    body += `</div>`;
  }

  const html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#111;max-width:780px;margin:0 auto;padding:8px;">
    <div style="text-align:center;margin-bottom:18px;padding-bottom:16px;border-bottom:3px solid #2d5a27;">
      ${logo ? `<img src="${esc(logo)}" style="width:78px;height:78px;object-fit:contain;border-radius:50%;">` : ''}
      <h1 style="color:#2d5a27;font-size:30px;margin:6px 0 4px;letter-spacing:2px;font-weight:800;">${esc(name.toUpperCase())}</h1>
      <div style="font-size:12.5px;color:#555;">Galerie commerciale Gare RER La Défense — 92800 Puteaux</div>
      <div style="font-size:12.5px;color:#555;">Tél: 07 60 73 64 65 · <span style="color:#2d5a27;font-weight:bold;">${esc(host)}</span></div>
    </div>
    ${body}
    <div style="text-align:center;margin-top:28px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px;">
      Prix TTC service compris · ${new Date().toLocaleDateString('fr-FR')}
    </div>
  </div>`;

  // Render in an isolated iframe.
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<html><head><title>Carte ${esc(name)}</title></head><body style="margin:0;padding:12px;">${html}</body></html>`);
  doc.close();

  // Wait for images to load (else they print blank), with a safety timeout.
  const imgs = Array.from(doc.images);
  await Promise.race([
    Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })))),
    new Promise((r) => setTimeout(r, 5000)),
  ]);

  frame.contentWindow.focus();
  frame.contentWindow.print();
  setTimeout(() => document.body.removeChild(frame), 1000);
}
