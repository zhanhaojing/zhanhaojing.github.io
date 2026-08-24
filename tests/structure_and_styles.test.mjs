import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const css = readFileSync(join(root, 'site/styles.css'), 'utf8');
const main = readFileSync(join(root, 'site/src/main.js'), 'utf8');
const singlePage = readFileSync(join(root, 'site/src/render/singlePage.js'), 'utf8');
const index = readFileSync(join(root, 'site/index.html'), 'utf8');
const preview = readFileSync(join(root, 'site/preview.html'), 'utf8');
const pagesWorkflow = readFileSync(join(root, '.github/workflows/deploy-pages.yml'), 'utf8');
const robots = readFileSync(join(root, 'site/robots.txt'), 'utf8');
const sitemap = readFileSync(join(root, 'site/sitemap.xml'), 'utf8');
const content = JSON.parse(readFileSync(join(root, 'site/content/siteContent.json'), 'utf8'));

test('static site files exist', () => {
  for (const path of [
    'site/index.html',
    'site/preview.html',
    'site/404.html',
    'site/.nojekyll',
    'site/robots.txt',
    'site/sitemap.xml',
    'site/styles.css',
    'site/assets/profile.jpg',
    'site/src/main.js',
    'site/src/render/singlePage.js',
    'site/content/siteContent.json',
    '.github/workflows/deploy-pages.yml',
    'PRODUCT.md'
  ]) {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  }
});

test('GitHub Pages workflow verifies and publishes the deployable site folder', () => {
  assert.match(pagesWorkflow, /branches: \[main\]/);
  assert.match(pagesWorkflow, /run: npm test/);
  assert.match(pagesWorkflow, /uses: actions\/configure-pages@v5/);
  assert.match(pagesWorkflow, /uses: actions\/upload-pages-artifact@v3[\s\S]*path: \.\/site/);
  assert.match(pagesWorkflow, /uses: actions\/deploy-pages@v4/);
});

test('offline preview is self-contained and immediately renderable', () => {
  assert.match(preview, /<style>[\s\S]*--color-accent/);
  assert.match(preview, /const pages = \{"en":/);
  assert.doesNotMatch(preview, /Loading academic profile|fetch\(/);
  assert.doesNotMatch(preview, /<script[^>]+src=/);
});

test('index is publicly indexable and retains accessibility metadata', () => {
  assert.match(index, /name="description"/);
  assert.match(index, /name="robots" content="index,follow"/);
  assert.match(index, /rel="canonical" href="https:\/\/zhanhaojing\.github\.io\/"/);
  assert.match(index, /property="og:url" content="https:\/\/zhanhaojing\.github\.io\/"/);
  assert.match(index, /property="og:image" content="https:\/\/zhanhaojing\.github\.io\/assets\/profile\.jpg"/);
  assert.match(preview, /name="robots" content="noindex,nofollow"/);
  assert.match(index, /class="skip-link"/);
  assert.match(index, /type="module"/);
  assert.match(index, /location\.protocol === 'file:'[\s\S]*location\.replace\('\.\/preview\.html'\)/);
});

test('search metadata points to the final GitHub Pages address', () => {
  assert.match(robots, /Sitemap: https:\/\/zhanhaojing\.github\.io\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/zhanhaojing\.github\.io\/<\/loc>/);
});

test('main uses one render and observes anchor sections', () => {
  assert.match(main, /renderSinglePage/);
  assert.match(main, /IntersectionObserver/);
  assert.match(main, /resolveCurrentSection\(sections\)/);
  assert.match(main, /navLink\.dataset\.navTarget/);
  assert.doesNotMatch(main, /hashchange/);
  assert.doesNotMatch(main, /window\.addEventListener\(['"]scroll/);
});

test('styles implement the sticky academic layout and explicit mobile collapse', () => {
  assert.match(css, /\.profile-panel\s*{[^}]*position:\s*sticky/s);
  assert.match(css, /\.academic-layout\s*{[^}]*grid-template-columns:\s*minmax\(13rem,\s*17rem\)/s);
  assert.match(css, /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.academic-layout\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /scroll-behavior:\s*smooth/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /--reading-width:\s*42rem/);
  assert.match(css, /text-align:\s*justify/);
  assert.doesNotMatch(css, /\.profile-topics\s*{[^}]*border-top:/s);
  assert.match(css, /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.profile-topics,\s*\.profile-methods\s*{[^}]*grid-column:\s*1 \/ -1/s);
});

test('paper citations share the desktop justified alignment', () => {
  assert.match(css, /@media\s*\(min-width:\s*48\.0625rem\)\s*{[\s\S]*?\.prose p,\s*\.apa-citation,[\s\S]*?text-align:\s*justify;[\s\S]*?text-align-last:\s*left;/s);
});

test('styles use one restrained accent and avoid decorative effects', () => {
  assert.match(css, /--color-accent:\s*#315f78/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/i);
  assert.doesNotMatch(css, /box-shadow/);
  const withoutIdentityMark = css.replace(/\.profile-link-icon\s*{[^}]*}/s, '');
  assert.doesNotMatch(withoutIdentityMark, /border-radius:\s*(?:[1-9]|0\.[1-9])/);
});

test('resume-style rules appear only below major content headings', () => {
  assert.match(
    css,
    /\.section-heading > h2,\s*\.background-block > h2\s*{[^}]*padding-bottom:\s*0\.5rem[^}]*border-bottom:\s*1px solid var\(--color-border\)/s,
  );
  assert.doesNotMatch(css, /\.academic-section:not\(\.about-section\)::before/);
  assert.doesNotMatch(css, /\.timeline-list li \+ li\s*{[^}]*border-/s);
  assert.doesNotMatch(css, /\.research-entry \+ \.research-entry\s*{[^}]*border-/s);
  assert.doesNotMatch(css, /\.experience-list article \+ article\s*{[^}]*border-/s);
  assert.doesNotMatch(css, /\.previous-entry\s*{[^}]*border-left:/s);
  assert.match(css, /\.timeline-list time\s*{[^}]*justify-self:\s*end[^}]*text-align:\s*right/s);
});

test('section spacing stays compact', () => {
  assert.match(css, /\.academic-section\s*{[^}]*padding:\s*clamp\(1\.65rem,\s*2\.5vw,\s*2\.3rem\) 0 0/s);
  assert.match(css, /\.about-section\s*{[^}]*padding:\s*clamp\(0\.35rem,\s*1\.5vw,\s*1\.1rem\) 0 0/s);
});

test('work experience uses a single vertical column', () => {
  assert.match(css, /\.experience-list\s*{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*1\.25rem/s);
  assert.doesNotMatch(css, /\.experience-list\s*{[^}]*repeat\(2/s);
  assert.match(css, /\.experience-heading\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto[^}]*margin-bottom:\s*0\.6rem/s);
  assert.match(css, /\.experience-period\s*{[^}]*justify-self:\s*end[^}]*font-variant-numeric:\s*tabular-nums[^}]*text-align:\s*right/s);
  assert.match(css, /\.experience-highlights\s*{[^}]*padding-left:\s*1rem[^}]*font-size:\s*var\(--type-detail\)/s);
  assert.match(css, /\.experience-highlights li \+ li\s*{[^}]*margin-top:\s*0\.45rem/s);
});

test('academic service is presented conservatively between work experience and honors', () => {
  assert.equal(content.background.academicService.length, 1);
  assert.equal(content.background.academicService[0].role.en, 'Project Contributor');
  assert.match(content.background.academicService[0].highlights[0].en, /Recently joined/);
  assert.match(singlePage, /'学术服务' : 'Academic Service'/);
  assert.match(singlePage, /renderExperience\(content, language\)[\s\S]*renderAcademicService\(content, language\)[\s\S]*honors-block/);
  assert.match(singlePage, /class="academic-service-link"/);
  assert.match(css, /\.academic-service-link\s*{[^}]*color:\s*var\(--color-text\)[^}]*text-decoration:\s*none/s);
});

test('profile photo preserves the original composition', () => {
  assert.match(css, /\.profile-photo-frame\s*{[^}]*aspect-ratio:\s*4 \/ 3[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.profile-photo\s*{[^}]*object-fit:\s*cover[^}]*object-position:\s*center/s);
  assert.doesNotMatch(css, /\.profile-photo\s*{[^}]*transform:/s);
});

test('styles provide a native Chinese typography stack', () => {
  assert.match(css, /html:lang\(zh-CN\)[\s\S]*?--font-sans:\s*"PingFang SC"/);
  assert.match(css, /--font-serif:\s*"Songti SC"/);
  assert.match(css, /html:lang\(zh-CN\) h1,[\s\S]*?letter-spacing:\s*0/);
});

test('styles use one restrained five-step type scale', () => {
  for (const token of ['meta', 'detail', 'body', 'subheading', 'heading']) {
    assert.match(css, new RegExp(`--type-${token}:`));
  }
  const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((match) => match[1].trim());
  assert.ok(sizes.length > 0);
  assert.equal(sizes.every((size) => /^var\(--type-(?:meta|detail|body|subheading|heading)\)$/.test(size)), true);
});

test('styles use consistent font roles and three intentional weights', () => {
  for (const token of ['regular', 'medium', 'semibold']) {
    assert.match(css, new RegExp(`--weight-${token}:`));
  }
  const families = new Set([...css.matchAll(/font-family:\s*([^;]+);/g)].map((match) => match[1].trim()));
  assert.deepEqual(families, new Set(['var(--font-sans)', 'var(--font-serif)']));
  const weights = [...css.matchAll(/font-weight:\s*([^;]+);/g)].map((match) => match[1].trim());
  assert.equal(weights.every((weight) => /^var\(--weight-(?:regular|medium|semibold)\)$/.test(weight)), true);
  assert.match(css, /strong\s*{[^}]*font-weight:\s*var\(--weight-semibold\)/s);
});

test('previous research titles remain visually secondary', () => {
  assert.match(css, /\.previous-research\s*{[^}]*margin-top:\s*2rem[^}]*padding:\s*0/s);
  assert.doesNotMatch(css, /\.previous-research\s*{[^}]*background:/s);
  assert.doesNotMatch(css, /\.previous-research\s*{[^}]*border:/s);
  assert.match(css, /\.subsection-title\s*{[^}]*color:\s*var\(--color-faint\)[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*var\(--type-meta\)[^}]*font-weight:\s*var\(--weight-medium\)/s);
  assert.match(css, /\.previous-entry h3\s*{[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*var\(--type-detail\)[^}]*font-weight:\s*var\(--weight-medium\)/s);
  assert.doesNotMatch(css, /html:lang\(zh-CN\) h3\s*{[^}]*font-weight:/s);
});

test('current research projects use quiet grouping without dividers or cards', () => {
  assert.match(css, /\.research-list\s*{[^}]*gap:\s*1\.75rem/s);
  assert.match(css, /\.entry-status\s*{[^}]*display:\s*block[^}]*margin:\s*0\.2rem 0 0[^}]*color:\s*var\(--color-faint\)[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*var\(--type-meta\)[^}]*font-weight:\s*var\(--weight-medium\)[^}]*white-space:\s*nowrap/s);
  assert.doesNotMatch(css, /\.entry-status::before/);
  assert.match(css, /\.research-meta\s*{[^}]*gap:\s*0\.55rem[^}]*padding:\s*0[^}]*list-style:\s*none/s);
  assert.match(css, /\.research-meta li\s*{[^}]*position:\s*relative[^}]*padding-left:\s*1rem[^}]*color:\s*var\(--color-muted\)[^}]*font-size:\s*var\(--type-detail\)/s);
  assert.match(css, /\.research-meta li::before\s*{[^}]*background:\s*var\(--color-accent\)[^}]*content:\s*""/s);
  assert.match(css, /\.research-meta-label\s*{[^}]*color:\s*var\(--color-accent\)[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*var\(--type-detail\)[^}]*font-weight:\s*var\(--weight-medium\)[^}]*white-space:\s*nowrap/s);
  assert.doesNotMatch(css, /\.research-meta li\s*{[^}]*grid-template-columns:/s);
  assert.doesNotMatch(css, /\.research-meta\s*{[^}]*background:/s);
  assert.doesNotMatch(css, /\.research-meta\s*{[^}]*border:/s);
  assert.doesNotMatch(css, /\.research-entry\s*{[^}]*border:/s);
});

test('Chinese research details use a compact language-specific flow', () => {
  assert.match(css, /html:lang\(zh-CN\) \.entry-status\s*{[^}]*display:\s*inline[^}]*margin:\s*0 0 0 0\.45rem/s);
  assert.match(css, /html:lang\(zh-CN\) \.research-meta\s*{[^}]*gap:\s*0\.45rem/s);
  assert.doesNotMatch(css, /\.research-question-label\s*{/s);
});

test('previous research follows the main vertical reading flow', () => {
  assert.match(css, /\.previous-grid\s*{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*1\.25rem/s);
  assert.doesNotMatch(css, /\.previous-grid\s*{[^}]*repeat\(2/s);
});

test('collaborative research uses the same project-title hierarchy', () => {
  assert.match(css, /\.collaborative-research\s*{[^}]*margin-top:\s*2rem/s);
  assert.doesNotMatch(css, /\.collaborative-research \.research-entry h3\s*{/s);
  assert.match(css, /\.research-entry h3\s*{[^}]*font-size:\s*var\(--type-subheading\)/s);
});

test('experience and honors use the same heading level as research', () => {
  assert.match(css, /\.background-block > h2\s*{[^}]*margin-bottom:/s);
  assert.doesNotMatch(css, /\.background-block > h2\s*{[^}]*font-size:/s);
});

test('major section headings have clear prominence', () => {
  assert.match(css, /--type-heading:\s*clamp\(1\.4rem,\s*1\.8vw,\s*1\.5rem\)/);
  assert.match(css, /h1,\s*h2\s*{[^}]*font-weight:\s*var\(--weight-semibold\)/s);
  assert.match(css, /h2\s*{[^}]*line-height:\s*1\.12/s);
});

test('opening statement has clear emphasis without introducing another size', () => {
  assert.match(css, /\.about-headline\s*{[^}]*font-family:\s*var\(--font-sans\)[^}]*font-size:\s*var\(--type-subheading\)[^}]*font-weight:\s*var\(--weight-semibold\)/s);
});

test('ORCID link is compact and visually secondary', () => {
  assert.match(css, /\.profile-links a\s*{[^}]*display:\s*inline-flex[^}]*color:\s*var\(--color-muted\)[^}]*font-size:\s*var\(--type-detail\)[^}]*text-decoration:\s*none/s);
  assert.match(css, /\.profile-links a:hover\s*{[^}]*color:\s*var\(--color-accent\)/s);
  assert.match(css, /\.profile-link-icon\s*{[^}]*border:\s*0[^}]*border-radius:\s*50%[^}]*background:\s*var\(--color-muted\)[^}]*color:\s*var\(--color-bg\)/s);
  assert.match(css, /\.profile-links a:hover \.profile-link-icon\s*{[^}]*background:\s*var\(--color-accent\)/s);
});

test('email is rendered as plain text rather than a link', () => {
  assert.match(singlePage, /<p class="profile-email">/);
  assert.match(singlePage, /class="profile-email-icon" aria-hidden="true"/);
  assert.doesNotMatch(singlePage, /mailto:/);
  assert.match(css, /\.profile-email\s*{[^}]*display:\s*flex[^}]*align-items:\s*center[^}]*gap:\s*0\.5rem[^}]*color:\s*var\(--color-muted\)/s);
  assert.match(css, /\.profile-email-icon svg\s*{[^}]*fill:\s*none[^}]*stroke:\s*currentColor[^}]*stroke-width:\s*1\.8/s);
  assert.doesNotMatch(css, /\.profile-email:hover/);
});

test('research location aligns with the profile link rows', () => {
  assert.match(css, /\.profile-location\s*{[^}]*display:\s*flex[^}]*align-items:\s*center[^}]*gap:\s*0\.5rem[^}]*font-size:\s*var\(--type-detail\)/s);
  assert.match(css, /\.profile-location-icon svg\s*{[^}]*stroke:\s*currentColor/s);
});

test('supervisor information remains subordinate to education details', () => {
  assert.match(css, /\.education-supervisor\s*{[^}]*color:\s*var\(--color-faint\)[^}]*font-size:\s*var\(--type-meta\)/s);
  assert.match(css, /\.education-supervisor a\s*{[^}]*color:\s*var\(--color-muted\)[^}]*text-decoration:\s*none/s);
  assert.match(css, /\.education-supervisor a:hover\s*{[^}]*color:\s*var\(--color-accent\)/s);
  assert.doesNotMatch(css, /\.education-supervisor\s*{[^}]*font-weight:/s);
});

test('Chinese sidebar details wrap naturally without splitting keywords', () => {
  assert.doesNotMatch(css, /\.profile-(?:topics|methods) p\s*{[^}]*text-align:\s*justify/s);
  assert.match(css, /\.profile-term\s*{[^}]*display:\s*inline-block[^}]*white-space:\s*nowrap/s);
  assert.match(singlePage, /<wbr>/);
  assert.match(css, /\.profile-topics\s*{[^}]*width:\s*100%[^}]*min-width:\s*0/s);
});

test('styles have balanced block braces', () => {
  let depth = 0;
  for (const character of css) {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    assert.equal(depth >= 0, true);
  }
  assert.equal(depth, 0);
});

test('every referenced CSS custom property is defined', () => {
  const definitions = new Set([...css.matchAll(/(--[a-z-]+)\s*:/g)].map((match) => match[1]));
  const references = new Set([...css.matchAll(/var\((--[a-z-]+)\)/g)].map((match) => match[1]));
  const missing = [...references].filter((name) => !definitions.has(name));
  assert.deepEqual(missing, []);
});
