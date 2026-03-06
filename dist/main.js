document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isNarrowViewport = window.matchMedia('(max-width: 900px)').matches;
  if (isTouchLike || isNarrowViewport) {
    root.classList.add('mobile-performance');
  }

  const setAppVh = () => {
    const vh = window.innerHeight * 0.01;
    root.style.setProperty('--app-vh', `${vh}px`);
  };
  setAppVh();

  let resizeRaf = 0;
  const onViewportResize = () => {
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = requestAnimationFrame(setAppVh);
  };
  window.addEventListener('resize', onViewportResize, { passive: true });
  window.addEventListener('orientationchange', onViewportResize, { passive: true });

  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedNetwork =
    !!connection &&
    (connection.saveData === true || /(^|-)2g|3g/.test(String(connection.effectiveType || '')));
  if (lowMemory || lowCpu || constrainedNetwork) {
    root.classList.add('low-end-device');
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const pathMap = {
    '/': 'index.html',
    '/index': 'index.html',
    '/index.html': 'index.html',
    '/archive': 'archive.html',
    '/archive.html': 'archive.html',
    '/process': 'process.html',
    '/process.html': 'process.html',
    '/the-process': 'process.html',
    '/collective': 'collective.html',
    '/collective.html': 'collective.html',
    '/studio': 'collective.html',
    '/project-detail': 'project-detail.html',
    '/project-detail.html': 'project-detail.html'
  };

  const fallback = window.location.pathname.split('/').pop() || 'index.html';
  const current = pathMap[path] || fallback;

  const normalizeHref = (href) =>
    href
      .replace(/^\.\//, '')
      .replace(/\/$/, '')
      .toLowerCase();

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;

    const normalized = normalizeHref(href);
    if (normalized === current) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const images = Array.from(document.querySelectorAll('img'));
  images.forEach((img, idx) => {
    if (idx === 0 && !img.hasAttribute('fetchpriority')) {
      img.setAttribute('fetchpriority', 'high');
    }
    if (!img.hasAttribute('loading') && idx > 0) {
      img.setAttribute('loading', 'lazy');
    }
    if (idx === 0 && !img.hasAttribute('loading')) {
      img.setAttribute('loading', 'eager');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });

  if (root.classList.contains('mobile-performance')) {
    const renderLazyNodes = Array.from(document.querySelectorAll('section, article, footer'));
    renderLazyNodes.slice(2).forEach((node) => {
      node.style.contentVisibility = 'auto';
      node.style.containIntrinsicSize = '1px 900px';
    });
  }

  const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
  if (!isMobileViewport) {
    return;
  }

  const mobileLinks = [
    { href: './index.html', label: 'Manifesto' },
    { href: './archive.html', label: 'Archive' },
    { href: './process.html', label: 'Process' },
    { href: './collective.html', label: 'Studio' },
    { href: './project-detail.html', label: 'Case Study' }
  ];

  const mountMobileMenu = () => {
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'mobile-menu-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'mobileMenuOverlay');
    fab.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">menu</span><span>Menu</span>';

    const overlay = document.createElement('aside');
    overlay.id = 'mobileMenuOverlay';
    overlay.className = 'mobile-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="mobile-menu-panel" role="dialog" aria-label="Mobile navigation">
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">Navigate</span>
          <button class="mobile-menu-close" type="button" aria-label="Close menu">✕</button>
        </div>
        <nav class="mobile-menu-links">
          ${mobileLinks
            .map(({ href, label }) => {
              const active = normalizeHref(href) === current ? ' aria-current="page"' : '';
              return `<a class="mobile-menu-link" href="${href}"${active}><span>${label}</span><span class="mobile-menu-arrow">→</span></a>`;
            })
            .join('')}
        </nav>
      </div>
    `;

    const closeButton = overlay.querySelector('.mobile-menu-close');
    const setOpen = (open) => {
      document.body.classList.toggle('mobile-menu-open', open);
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    fab.addEventListener('click', () => setOpen(true));
    closeButton.addEventListener('click', () => setOpen(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        setOpen(false);
      }
    });
    overlay.querySelectorAll('.mobile-menu-link').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    });

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(mountMobileMenu, { timeout: 300 });
  } else {
    setTimeout(mountMobileMenu, 0);
  }
});
