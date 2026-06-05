// On admin pages, point the PWA manifest to the admin one so "Add to Home
// Screen" installs an icon that opens the back-office (Comptoir) directly,
// not the customer home page.
export function applyAdminManifest() {
  const link = document.querySelector('link[rel="manifest"]');
  if (link) link.setAttribute('href', '/admin.webmanifest');
  const title = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (title) title.setAttribute('content', 'Comptoir');
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', '#0f172a');
}
