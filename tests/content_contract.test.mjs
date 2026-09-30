import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'site/content/siteContent.json'), 'utf8');
const content = JSON.parse(source);

test('navigation defines six non-redundant single-page anchors', () => {
  assert.deepEqual(content.navigation.map((item) => item.id), [
    'about',
    'education',
    'papers',
    'research',
    'service',
    'experience'
  ]);
  assert.equal('contact' in content, false);
});

test('public profile settings expose only approved information', () => {
  assert.equal(content.profile.displayName, 'H. Zhan');
  assert.equal(content.profile.privacy.showFullName, false);
  assert.equal(content.profile.privacy.showPhoto, true);
  assert.equal(content.profile.photo.src, './assets/profile.jpg');
  assert.deepEqual(content.profile.location, { zh: '中国广东', en: 'Guangdong, China' });
  assert.equal(content.profile.privacy.cvDownloadEnabled, false);
  assert.equal(content.profile.privacy.publicEmailEnabled, true);
  assert.equal(content.profile.private.fullName, '');
  assert.doesNotMatch(source, /1[3-9]\d{9}/);
});

test('working papers include the Psychiatry Research revision', () => {
  assert.equal(content.papers.length, 4);
  const paper = content.papers.find((item) => item.id === 'jiang-zhan-oc-metacognition');
  assert.ok(paper);
  assert.match(paper.authors, /Jiang, W\., Zhan, H\., Shi, Z\.\*, & Zhang, X\.\*/);
  assert.equal(paper.status.en, 'Under revision at Psychiatry Research');
  assert.equal(paper.citationStatus.en, 'under revision');
  assert.equal(paper.venue, 'Psychiatry Research');
  assert.equal(paper.metrics, 'JIF = 3.9, JCR Q1');
  assert.match(paper.title, /cross-lagged panel network analysis/i);
});

test('working papers mark Li, Y. as corresponding author', () => {
  const englishAuthors = (paper) => typeof paper.authors === 'string' ? paper.authors : paper.authors.en;
  const papersWithLi = content.papers.filter((paper) => englishAuthors(paper).includes('Li, Y.'));
  assert.equal(papersWithLi.length, 2);
  assert.equal(papersWithLi.every((paper) => englishAuthors(paper).includes('Li, Y.*')), true);
});

test('working papers include the bilingual open scholarship glossary data paper', () => {
  const paper = content.papers.find((item) => item.id === 'open-scholarship-glossary-data-paper');
  assert.ok(paper);
  assert.equal(paper.title.zh, '中文版开放学术术语数据集');
  assert.equal(paper.title.en, 'A Chinese-Language Glossary of Open Scholarship Terms');
  assert.equal(content.papers.at(-1).id, 'open-scholarship-glossary-data-paper');
  assert.match(paper.authors.zh, /^詹皓晶#, 刘若婷#/);
  assert.match(paper.authors.en, /^Zhan, H\.#, Liu, R\.#/);
  assert.match(paper.authors.zh, /杨金骉\*, 金淑娴\*$/);
  assert.match(paper.authors.en, /Yang, J\.\*, & Jin, S\.\*$/);
  assert.deepEqual(paper.status, { zh: '评审中', en: 'Under review' });
  assert.deepEqual(paper.citationStatus, { zh: '评审中', en: 'under review' });
  assert.deepEqual(paper.venue, { zh: '中国科学数据', en: 'China Scientific Data' });
});

test('research topics are bilingual and concise', () => {
  assert.equal(content.profile.keywords.length, 4);
  assert.deepEqual(content.profile.keywords.map((item) => item.en), [
    'Realistic and technological threats',
    'National attachment',
    'Government trust',
    'Intergroup relations'
  ]);
  assert.equal(content.profile.keywords.every((item) => item.zh && item.en), true);
});

test('opening profile stays focused on the core social psychology program', () => {
  const opening = JSON.stringify({ headline: content.profile.headline, bio: content.profile.bio });
  assert.match(content.profile.headline.en, /survival and security/i);
  assert.match(content.profile.headline.zh, /自身生存和安全/);
  assert.match(content.profile.bio[0].en, /group identification, institutional trust, and group boundaries/i);
  assert.match(content.profile.bio[1].zh, /AI 及其他现实威胁如何影响国家认同/);
  assert.match(content.profile.bio[1].en, /normative pressures amid sociocultural change/i);
  assert.match(content.profile.bio[2].zh, /合作想法，欢迎与我联系。\(\^-\^\)$/);
  assert.match(content.profile.bio[2].en, /glad to hear from you\. \(\^-\^\)$/);
  assert.doesNotMatch(opening, /collective threats|集体性威胁/i);
  assert.doesNotMatch(opening, /metacogn|mental health|obsessive-compulsive|元认知|心理健康|强迫症状/i);
});

test('research descriptions reflect the approved project evidence', () => {
  const ai = content.researchProjects.find((project) => project.id === 'ai-threat-national-attachment');
  const realistic = content.researchProjects.find((project) => project.id === 'realistic-threat-national-identification');
  const disease = content.researchProjects.find((project) => project.id === 'disease-avoidance-intergroup-cooperation');
  const ocs = content.researchProjects.find((project) => project.id === 'ocs-metacognitive-beliefs');

  assert.match(ai.designData.en, /N = 32,330/);
  assert.match(ai.designData.en, /N = 541/);
  assert.match(ai.designData.en, /N = 600/);
  assert.match(ai.methods.en, /HLM and mediation-path analyses/);
  assert.match(realistic.question.en, /evolutionary psychological lens/);
  assert.match(realistic.question.en, /relative adaptive value/);
  assert.match(realistic.methods.en, /security seeking/);
  assert.match(disease.methods.en, /N = 300 and N = 101/);
  assert.equal(ocs.group, 'collaborative');
  assert.match(ocs.designData.en, /cross-lagged panel network/);
  assert.equal(ocs.role.zh, '合作作者，参与论文修改与审稿意见回复，重点完善 Introduction 与 Discussion，优化理论逻辑、文献整合及纵向网络结果的解释。');
  assert.doesNotMatch(ocs.role.zh, /参与论文返修/);
  assert.match(ocs.role.en, /Co-author; contributed to manuscript revision and responses to reviewer comments/);
  assert.match(ocs.role.en, /Introduction and Discussion/);
});

test('public profile includes the approved ORCID identity link', () => {
  assert.deepEqual(content.profile.links, [{
    label: 'ORCID',
    accessibleLabel: {
      zh: '打开 ORCID 个人主页，编号 0009-0006-1518-5986',
      en: 'Open ORCID profile, identifier 0009-0006-1518-5986'
    },
    url: 'https://orcid.org/0009-0006-1518-5986',
    rel: 'me',
    kind: 'orcid'
  }]);
});

test('education entries include supervisor information', () => {
  assert.deepEqual(content.background.education.map((item) => item.supervisor), [
    {
      name: 'Dr. Yan-Mei Li',
      url: 'https://psych.cas.cn/sourcedb/cn/expert/201003/t20100304_6369816.html'
    },
    {
      name: 'Dr. Wenqi Wei',
      url: ''
    }
  ]);
});

test('work experience entries include bilingual periods', () => {
  assert.deepEqual(content.background.experience.map((item) => item.period), [
    { zh: '2024 年 7 月-2025 年 7 月', en: 'Jul 2024-Jul 2025' },
    { zh: '2023 年 6 月-2023 年 9 月', en: 'Jun 2023-Sep 2023' }
  ]);
});

test('work experience highlights retain concrete research evidence', () => {
  const [byd, byteDance] = content.background.experience;
  assert.equal(byd.highlights.length, 2);
  assert.match(byd.highlights[0].en, /14,000 responses/);
  assert.match(byd.highlights[0].en, /92 employees and managers/);
  assert.match(byd.highlights[1].en, /3,000 organizational units/);
  assert.equal(byteDance.highlights.length, 3);
  assert.match(byteDance.highlights[0].en, /20,000 valid responses/);
  assert.match(byteDance.highlights[1].en, /50 user interviews and focus groups/);
  assert.match(byteDance.highlights[2].en, /N = 1,000/);
});

test('content contains no em dash or en dash characters', () => {
  assert.doesNotMatch(source, /[—–]/);
});
