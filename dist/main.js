document.addEventListener('DOMContentLoaded', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const normalized = href.replace(/^\.\//, '');
    if (normalized === current) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const images = Array.from(document.querySelectorAll('img'));
  images.forEach((img, idx) => {
    if (!img.hasAttribute('loading') && idx > 0) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
});
