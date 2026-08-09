import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderLayout } from '../site/src/render/common.js';
import { renderSinglePage } from '../site/src/render/singlePage.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const content = JSON.parse(readFileSync(join(root, 'site/content/siteContent.json'), 'utf8'));

test('single-page renderer includes every anchor section', () => {
  const html = renderSinglePage(content, 'en');
  for (const id of ['about', 'education', 'research', 'papers', 'experience']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /class="profile-panel"/);
  assert.match(html, /class="academic-content"/);
  assert.match(html, /<h1 class="profile-name">H\. Zhan<\/h1>/);
  assert.match(html, /class="profile-photo" src="\.\/assets\/profile\.jpg"/);
  assert.match(html, /alt="H\. Zhan standing in front of a mountain landscape"/);
  assert.match(html, /<h2 class="visually-hidden">About<\/h2>/);
  assert.doesNotMatch(html, /id="contact"|>Contact</);
  assert.doesNotMatch(html, /<p class="section-kicker">/);
});

test('layout uses anchor navigation instead of route pages', () => {
  const html = renderLayout({ content, language: 'en', body: renderSinglePage(content, 'en') });
  assert.match(html, /class="brand" href="#about">Homepage<\/a>/);
  assert.match(html, /href="#about"/);
  assert.match(html, /href="#research"/);
  assert.match(html, /href="#papers"/);
  assert.match(html, /data-nav-target="education"/);
  assert.match(html, /data-nav-target="experience"/);
  assert.doesNotMatch(html, /aria-current="page"/);
});

test('paper renderer bolds the profile owner and includes revision metadata', () => {
  const html = renderSinglePage(content, 'en');
  assert.match(html, /Jiang, W\., <strong>Zhan, H\.<\/strong>, Shi, Z\.#, &amp; Zhang, X\.#/);
  assert.match(html, /\(under revision\)\./);
  assert.match(html, /<em class="paper-venue">Psychiatry Research<\/em>\./);
  assert.match(html, /\[JIF = 3\.9, JCR Q1\]/);
  assert.match(html, /Unravelling the associations between obsessive-compulsive symptoms/);
  assert.match(html, /class="apa-citation"/);
});

test('working papers precede research in the single-page flow', () => {
  const html = renderSinglePage(content, 'en');
  assert.ok(html.indexOf('id="education"') < html.indexOf('id="papers"'));
  assert.ok(html.indexOf('id="papers"') < html.indexOf('id="research"'));
  assert.ok(html.indexOf('id="research"') < html.indexOf('id="experience"'));
  assert.match(html, /<h2>Work experience<\/h2>/);
  assert.doesNotMatch(html, /Applied research experience|Professional background/);
  assert.match(html, /<h2>Honors and Awards<\/h2>/);
  assert.doesNotMatch(html, /Selected honors/);
});

test('collaborative OCS work states the author role without a redundant subsection label', () => {
  const html = renderSinglePage(content, 'en');
  assert.match(html, /Longitudinal Network Study of Obsessive-Compulsive Symptoms/);
  assert.match(html, /manuscript development and editing/);
  assert.doesNotMatch(html, /Collaborative research/);
  assert.ok(html.indexOf('AI Threat and National Identification') < html.indexOf('Longitudinal Network Study'));
  assert.ok(html.indexOf('Longitudinal Network Study') < html.indexOf('Selected previous research'));
});

test('education renders linked and unlinked supervisors', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(en, /class="education-supervisor">Supervisor: <a href="https:\/\/psych\.cas\.cn\/sourcedb\/cn\/expert\/201003\/t20100304_6369816\.html"[^>]*>Dr\. Yan-Mei Li<\/a>/);
  assert.match(en, /class="education-supervisor">Supervisor: Dr\. Wenqi Wei<\/p>/);
  assert.match(zh, /class="education-supervisor">导师: <a [^>]*>Dr\. Yan-Mei Li<\/a>/);
});

test('work experience renders right-aligned bilingual periods', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(en, /<time class="experience-period">Jul 2024-Jul 2025<\/time>/);
  assert.match(en, /<time class="experience-period">Jun 2023-Sep 2023<\/time>/);
  assert.match(zh, /<time class="experience-period">2024 年 7 月-2025 年 7 月<\/time>/);
  assert.match(zh, /回收 14,000 余份问卷（回收率 89%）/);
  assert.match(en, /collecting more than 14,000 responses \(89% response rate\)/);
});

test('work experience renders evidence-based bullet points', () => {
  const html = renderSinglePage(content, 'en');
  assert.match(html, /<ul class="experience-highlights">/);
  assert.match(html, /more than 14,000 responses/);
  assert.match(html, /more than 20,000 valid responses/);
  assert.match(html, /more than 50 user interviews and focus groups/);
});

test('honors use the revised Applied Psychology cohort ranking', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(zh, /华南师范大学应用心理学专业年级综合评分第一，获保送研究生资格/);
  assert.match(en, /Ranked first in comprehensive evaluation in the Applied Psychology cohort and qualified for recommended admission to postgraduate study, South China Normal University/);
});

test('research status is rendered inside the project heading', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(en, /<h3>AI Threat and National Identification: Psychological Mechanisms<span class="entry-status">\(Manuscript in preparation\)<\/span><\/h3>/);
  assert.match(zh, /<h3>人工智能威胁对国家认同的影响及其心理机制<span class="entry-status">（稿件准备中）<\/span><\/h3>/);
  assert.doesNotMatch(en, /<p class="entry-status">/);
});

test('research details use concise bilingual inline labels', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(en, /<li><span class="research-meta-label">Content:<\/span> This project tests whether AI threat weakens national identification/);
  assert.match(zh, /<li><span class="research-meta-label">内容：<\/span>本项目检验 AI 威胁是否削弱国家认同/);
  assert.doesNotMatch(zh, /research-meta-label">(?:内容|方法|角色)：<\/span>\s/);
  assert.match(en, /<span class="research-meta-label">Methods:<\/span>/);
  assert.match(zh, /<span class="research-meta-label">方法：<\/span>/);
  assert.match(zh, /<span class="research-meta-label">角色：<\/span>/);
  assert.doesNotMatch(en, /<dl class="research-meta">/);
  assert.doesNotMatch(en, /class="research-question"/);
});

test('research section starts directly with projects without repeating the opening profile', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.doesNotMatch(en, /My core research examines/);
  assert.doesNotMatch(zh, /我的核心研究考察/);
  assert.match(en, /<div class="section-heading">\s*<h2>Research<\/h2>\s*<\/div>\s*<div class="research-list">/);
});

test('research methods are presented once in the profile column', () => {
  const html = renderSinglePage(content, 'en');
  const methodsIndex = html.indexOf('class="profile-methods"');
  const profileEndIndex = html.indexOf('</aside>');
  assert.ok(methodsIndex > -1 && methodsIndex < profileEndIndex);
  assert.match(html, /<h2 id="profile-methods-title">Research methods<\/h2>/);
  assert.equal((html.match(/Research methods/g) || []).length, 1);
  assert.doesNotMatch(html, /class="methods-block"|class="background-pair"/);
});

test('research topics precede methods in the profile column', () => {
  const html = renderSinglePage(content, 'en');
  const topicsIndex = html.indexOf('class="profile-topics"');
  const methodsIndex = html.indexOf('class="profile-methods"');
  assert.ok(topicsIndex > -1 && topicsIndex < methodsIndex);
  assert.match(html, /<h2 id="profile-topics-title">Research topics<\/h2>/);
  const topicsText = html.slice(topicsIndex, methodsIndex).replace(/<[^>]+>/g, '');
  assert.match(topicsText, /Realistic and technological threats, National attachment, Government trust, Intergroup relations/);
});

test('profile panel renders the ORCID identity link', () => {
  const html = renderSinglePage(content, 'en');
  assert.match(html, /href="https:\/\/orcid\.org\/0009-0006-1518-5986"/);
  assert.match(html, /rel="me noreferrer" aria-label="Open ORCID profile, identifier 0009-0006-1518-5986"/);
  assert.match(html, /class="profile-link-icon profile-link-icon--orcid" aria-hidden="true">iD<\/span><span>ORCID<\/span>/);
  assert.doesNotMatch(html, />ORCID 0009-0006-1518-5986<\/a>/);
});

test('profile panel renders the bilingual research location', () => {
  const en = renderSinglePage(content, 'en');
  const zh = renderSinglePage(content, 'zh');
  assert.match(en, /class="profile-location"[\s\S]*?<span>Guangdong, China<\/span>/);
  assert.match(zh, /class="profile-location"[\s\S]*?<span>中国广东<\/span>/);
  assert.match(en, /class="profile-location-icon" aria-hidden="true"><svg/);
});

test('renderer escapes content-derived fields', () => {
  const unsafe = structuredClone(content);
  unsafe.profile.headline.en = '<script>alert(1)</script>';
  unsafe.papers[0].authors = 'Zhan, H. <img src=x onerror=alert(1)>';
  unsafe.papers[0].title = '<script>paper</script>';
  const html = renderSinglePage(unsafe, 'en');
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;paper&lt;\/script&gt;/);
});

test('privacy controls still hide private identity and disabled portraits', () => {
  const unsafe = structuredClone(content);
  unsafe.profile.private.fullName = 'Private Scholar';
  unsafe.profile.private.phone = '19900000000';
  unsafe.profile.privacy.showPhoto = false;
  unsafe.profile.photo.src = './assets/private.jpg';
  const html = renderSinglePage(unsafe, 'en');
  assert.match(html, /H\. Zhan/);
  assert.doesNotMatch(html, /Private Scholar/);
  assert.doesNotMatch(html, /19900000000/);
  assert.doesNotMatch(html, /private\.jpg/);
});

test('rendered page contains no em dash or en dash characters', () => {
  const html = renderLayout({ content, language: 'en', body: renderSinglePage(content, 'en') });
  assert.doesNotMatch(html, /[—–]/);
});
