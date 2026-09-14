import { localize, visibleProfile } from '../contentAccess.js?v=20260914-site-1';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderOwnName(authors) {
  return escapeHtml(authors)
    .replaceAll('Zhan, H.', '<strong>Zhan, H.</strong>')
    .replaceAll('ZHAN Haojing', '<strong>ZHAN Haojing</strong>')
    .replaceAll('詹皓晶', '<strong>詹皓晶</strong>');
}

export function renderNavigation(content, language) {
  const profile = visibleProfile(content.profile);
  const navItems = content.navigation.map((item, index) => {
    const current = index === 0 ? ' aria-current="location"' : '';
    return `<a class="nav-link" href="#${escapeHtml(item.id)}" data-nav-target="${escapeHtml(item.id)}"${current}>${escapeHtml(localize(item.label, language))}</a>`;
  }).join('');

  const cvLink = profile.cvDownloadEnabled
    ? `<a class="header-link" href="./assets/cv-public.pdf" target="_blank" rel="noreferrer">CV</a>`
    : '';

  return `
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="#about">${language === 'zh' ? '主页' : 'Homepage'}</a>
        <nav class="site-nav" aria-label="${language === 'zh' ? '主页导航' : 'Primary navigation'}">
          ${navItems}
        </nav>
        <div class="header-actions">
          ${cvLink}
          <div class="language-switch" aria-label="${language === 'zh' ? '语言切换' : 'Language switcher'}">
            <button class="language-button" type="button" data-language="zh" aria-label="切换到中文">中文</button>
            <span aria-hidden="true">/</span>
            <button class="language-button" type="button" data-language="en" aria-label="Switch to English">EN</button>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function renderFooter(content, language) {
  const profile = visibleProfile(content.profile);
  return `
    <footer class="site-footer">
      <span>${escapeHtml(profile.name)}</span>
      <span>${language === 'zh' ? '个人学术主页' : 'Academic homepage'}</span>
    </footer>
  `;
}

export function renderLayout({ content, language, body }) {
  return `
    ${renderNavigation(content, language)}
    <main id="main-content" class="page-shell" tabindex="-1">
      ${body}
    </main>
    ${renderFooter(content, language)}
  `;
}
