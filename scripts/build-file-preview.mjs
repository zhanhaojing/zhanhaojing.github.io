import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLayout } from '../site/src/render/common.js';
import { renderSinglePage } from '../site/src/render/singlePage.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const content = JSON.parse(readFileSync(join(root, 'site/content/siteContent.json'), 'utf8'));
const styles = readFileSync(join(root, 'site/styles.css'), 'utf8');
const pages = {
  en: renderLayout({ content, language: 'en', body: renderSinglePage(content, 'en') }),
  zh: renderLayout({ content, language: 'zh', body: renderSinglePage(content, 'zh') })
};
const serializedPages = JSON.stringify(pages).replaceAll('<', '\\u003c');

const preview = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <meta name="description" content="Offline preview of H. Zhan's academic homepage." />
    <meta name="theme-color" content="#f4f6f8" />
    <title>H. Zhan | Academic Homepage Preview</title>
    <style>${styles}</style>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div id="app"></div>
    <script>
      (() => {
        const pages = ${serializedPages};
        const app = document.querySelector('#app');
        let language = 'en';
        let sectionObserver;

        function markCurrentSection(sectionId) {
          document.querySelectorAll('[data-nav-target]').forEach((link) => {
            if (link.dataset.navTarget === sectionId) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
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
          }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.05, 0.25, 0.5] });
          sections.forEach((section) => sectionObserver.observe(section));
        }

        function render() {
          app.innerHTML = pages[language];
          document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
          document.querySelectorAll('[data-language]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.language === language));
          });
          observeSections();
        }

        app.addEventListener('click', (event) => {
          const navLink = event.target.closest('[data-nav-target]');
          if (navLink) markCurrentSection(navLink.dataset.navTarget);

          const button = event.target.closest('[data-language]');
          if (!button) return;
          language = button.dataset.language === 'zh' ? 'zh' : 'en';
          render();
        });

        render();
      })();
    </script>
  </body>
</html>
`;

writeFileSync(join(root, 'site/preview.html'), preview);
