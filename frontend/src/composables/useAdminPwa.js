// Per-section PWA manifest switching, so "Add to Home Screen" installs an icon
// that opens the right page (start_url) depending on where the user added it.
function setManifest(href, theme, title) {
  const link = document.querySelector('link[rel="manifest"]');
  if (link) link.setAttribute('href', href);
  const t = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (t && title) t.setAttribute('content', title);
  const th = document.querySelector('meta[name="theme-color"]');
  if (th && theme) th.setAttribute('content', theme);
}

// Back-office pages → icon opens the Comptoir.
export function applyAdminManifest() {
  setManifest('/admin.webmanifest', '#0f172a', 'Comptoir');
}

// Order page → icon opens the ordering page directly.
export function applyOrderManifest() {
  setManifest('/order.webmanifest', '#2d5a27', 'Commander');
}

// Home page → default icon opens the menu home.
export function applyDefaultManifest() {
  setManifest('/manifest.webmanifest', '#2d5a27', 'Pho Bamboo');
}
