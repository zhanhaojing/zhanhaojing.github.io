import { normalizeLanguage } from './contentAccess.js?v=20260809-single-page-30';
import { renderLayout } from './render/common.js?v=20260809-single-page-30';
import { renderSinglePage } from './render/singlePage.js?v=20260809-single-page-31';

const app = document.querySelector('#app');
let content = null;
let language = readStoredLanguage();
let sectionObserver = null;

function readStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem('academic-site-language'));
  } catch {
    return 'en';
  }
}

function storeLanguage(nextLanguage) {
  try {
    window.localStorage.setItem('academic-site-language', nextLanguage);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function updateLanguageState() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
}

function markCurrentSection(sectionId) {
  document.querySelectorAll('[data-nav-target]').forEach((link) => {
    if (link.dataset.navTarget === sectionId) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function resolveCurrentSection(sections) {
  const activationLine = Math.min(window.innerHeight * 0.28, 220);
  const measured = Array.from(sections).map((section) => ({
    id: section.id,
    rect: section.getBoundingClientRect()
  }));
  const current = measured.find(({ rect }) => rect.top <= activationLine && rect.bottom > activationLine);
  if (current) return current.id;
  const upcoming = measured.find(({ rect }) => rect.top > activationLine);
  return upcoming?.id || measured.at(-1)?.id;
}

function observeSections() {
  sectionObserver?.disconnect();
  const sections = document.querySelectorAll('[data-observed-section]');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  sectionObserver = new IntersectionObserver(() => {
    const sectionId = resolveCurrentSection(sections);
    if (sectionId) markCurrentSection(sectionId);
  }, {
    rootMargin: '-18% 0px -62% 0px',
    threshold: [0.05, 0.25, 0.5]
  });

  sections.forEach((section) => sectionObserver.observe(section));
}

function render() {
  if (!app || !content) return;
  app.innerHTML = renderLayout({
    content,
    language,
    body: renderSinglePage(content, language)
  });
  updateLanguageState();
  observeSections();
}

function renderError(error) {
  if (!app) return;
  app.innerHTML = `
    <main class="loading-state error-state">
      <div>
        <h1>Content could not be loaded</h1>
        <p>Please refresh the page or try again later.</p>
        <small>${error instanceof Error ? error.message : 'Unknown error'}</small>
      </div>
    </main>
  `;
}

if (app) {
  fetch('./content/siteContent.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      content = data;
      render();
    })
    .catch(renderError);

  app.addEventListener('click', (event) => {
    const navLink = event.target.closest('[data-nav-target]');
    if (navLink) markCurrentSection(navLink.dataset.navTarget);

    const button = event.target.closest('[data-language]');
    if (!button) return;
    language = normalizeLanguage(button.dataset.language);
    storeLanguage(language);
    render();
  });
}
