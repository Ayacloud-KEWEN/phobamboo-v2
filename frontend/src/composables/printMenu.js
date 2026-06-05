import { CATEGORY_ORDER } from '../stores/menu';
import { localizedName } from '../i18n';

// Build a printable A4 menu and trigger the browser print dialog.
// Mirrors the original "Menu PDF" export: grouped by category + sub-category.
const GROUPED = ['menus', 'plats', 'boissons', 'alcool'];

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function printMenu(products, restaurantName = 'PHO BAMBOO') {
  const byCat = (cat) => products.filter((p) => p.category === cat);

  let html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#000;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #2d5a27;">
      <h1 style="color:#2d5a27;font-size:32px;margin:0 0 10px;letter-spacing:2px;font-weight:bold;">${esc(restaurantName.toUpperCase())}</h1>
      <div style="font-size:14px;color:#555;">
        <p style="margin:5px 0;">Galerie commerciale Gare RER La Défense, 92800 Puteaux</p>
        <p style="margin:5px 0;"><strong>Tél: 07 60 73 64 65</strong></p>
        <p style="margin:5px 0;">www.phobamboo.fr</p>
      </div>
    </div>`;

  for (const cat of CATEGORY_ORDER) {
    const items = byCat(cat);
    if (!items.length) continue;

    const groups = {};
    if (GROUPED.includes(cat)) {
      for (const d of items) (groups[d.subCategory || 'General'] ||= []).push(d);
    } else {
      groups['General'] = items;
    }

    html += `<div style="margin-bottom:30px;page-break-inside:avoid;">
      <h2 style="background:#f0fdf4;color:#166534;font-size:18px;padding:10px;border-left:5px solid #166534;margin-bottom:15px;text-transform:uppercase;font-weight:bold;">${esc(cat)}</h2>
      <table style="width:100%;border-collapse:collapse;">`;

    for (const key of Object.keys(groups).sort()) {
      if (key !== 'General') {
        html += `<tr><td colspan="2" style="padding:15px 0 5px;font-weight:bold;font-size:14px;color:#4a7c59;border-bottom:1px solid #eee;text-transform:uppercase;letter-spacing:1px;">• ${esc(key)}</td></tr>`;
      }
      for (const item of groups[key]) {
        const name = esc(localizedName(item));
        html += `<tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:10px 15px 10px 0;vertical-align:top;">
            <div style="font-size:15px;font-weight:bold;color:#222;">${name}</div>
            ${item.description ? `<div style="font-size:12px;color:#666;margin-top:4px;">${esc(item.description)}</div>` : ''}
          </td>
          <td style="padding:10px 0;text-align:right;vertical-align:top;width:80px;font-weight:bold;font-size:15px;color:#166534;">${item.price.toFixed(2)}€</td>
        </tr>`;
      }
    }
    html += `</table></div>`;
  }

  html += `<div style="text-align:center;margin-top:50px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px;">
    Prix TTC service compris - ${new Date().toLocaleDateString('fr-FR')}</div></div>`;

  // Print in an isolated iframe so the SPA layout is untouched.
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<html><head><title>Menu</title></head><body>${html}</body></html>`);
  doc.close();
  frame.contentWindow.focus();
  setTimeout(() => {
    frame.contentWindow.print();
    setTimeout(() => document.body.removeChild(frame), 1000);
  }, 300);
}
