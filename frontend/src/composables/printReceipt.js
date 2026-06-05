// Escape any value going into the print HTML — order notes/table come from the
// customer, so never inject them raw (would be XSS in the same-origin iframe).
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Print a compact kitchen/counter ticket for one order via an isolated iframe.
export function printReceipt(order, restaurantName = 'PHO BAMBOO') {
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:2px 0;">${esc(i.quantity)}× ${esc(i.name)}</td><td style="text-align:right;padding:2px 0;">${(i.price * i.quantity).toFixed(2)}€</td></tr>`
    )
    .join('');

  const html = `<div style="font-family:'Courier New',monospace;width:280px;font-size:13px;color:#000;">
    <div style="text-align:center;">
      <div style="font-size:18px;font-weight:bold;">${esc(restaurantName.toUpperCase())}</div>
      <div style="font-size:11px;">Puteaux - La Défense</div>
    </div>
    <hr style="border:none;border-top:1px dashed #000;margin:8px 0;">
    <div>Commande <strong>#${esc(order.dailyNumber || '-')}</strong></div>
    <div>${order.table ? 'Table: <strong>' + esc(order.table) + '</strong>' : 'À emporter'}</div>
    <div style="font-size:11px;">${new Date(order.createdAt).toLocaleString('fr-FR')}</div>
    ${order.phone ? `<div style="font-size:11px;">Tél: ${esc(order.phone)}</div>` : ''}
    <hr style="border:none;border-top:1px dashed #000;margin:8px 0;">
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    ${order.notes ? `<div style="margin-top:6px;font-size:11px;">Note: ${esc(order.notes)}</div>` : ''}
    <hr style="border:none;border-top:2px solid #000;margin:8px 0;">
    <table style="width:100%;font-weight:bold;font-size:16px;"><tr><td>TOTAL</td><td style="text-align:right;">${order.total.toFixed(2)}€</td></tr></table>
    <div style="text-align:center;margin-top:12px;font-size:11px;">Merci et à bientôt !</div>
  </div>`;

  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<html><head><title>Ticket #${order.dailyNumber || ''}</title></head><body>${html}</body></html>`);
  doc.close();
  frame.contentWindow.focus();
  setTimeout(() => {
    frame.contentWindow.print();
    setTimeout(() => document.body.removeChild(frame), 1000);
  }, 250);
}
