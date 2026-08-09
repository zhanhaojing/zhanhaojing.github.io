import { groupedProjects, localize, visibleProfile } from '../contentAccess.js?v=20260809-single-page-30';
import { escapeHtml, renderOwnName } from './common.js?v=20260809-single-page-30';

function renderProfilePanel(content, language) {
  const profile = visibleProfile(content.profile);
  const portrait = profile.showPhoto
    ? `<figure class="profile-photo-frame"><img class="profile-photo" src="${escapeHtml(profile.photo.src)}" alt="${escapeHtml(localize(profile.photo.alt, language))}" decoding="async" fetchpriority="high" /></figure>`
    : '<!-- TODO: add an approved professional portrait, square crop, at least 800 by 800 pixels. -->';
  const email = profile.email
    ? `<p class="profile-email"><span class="profile-email-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1.5"></rect><path d="m4 7 8 6 8-6"></path></svg></span><span>${escapeHtml(profile.email)}</span></p>`
    : '';
  const locationText = localize(profile.location, language);
  const location = locationText
    ? `<p class="profile-location"><span class="profile-location-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 21s6-5.2 6-12a6 6 0 1 0-12 0c0 6.8 6 12 6 12Z"></path><circle cx="12" cy="9" r="2"></circle></svg></span><span>${escapeHtml(locationText)}</span></p>`
    : '';
  const links = profile.links.length
    ? `<ul class="profile-links">${profile.links.map((link) => {
      const label = escapeHtml(localize(link.label, language));
      const accessibleLabel = escapeHtml(localize(link.accessibleLabel || link.label, language));
      const icon = link.kind === 'orcid'
        ? '<span class="profile-link-icon profile-link-icon--orcid" aria-hidden="true">iD</span>'
        : '';
      return `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="${link.rel === 'me' ? 'me ' : ''}noreferrer" aria-label="${accessibleLabel}">${icon}<span>${label}</span></a></li>`;
    }).join('')}</ul>`
    : '';
  const renderTerms = (items) => items
    .map((item, index) => {
      const separator = index < items.length - 1 ? (language === 'zh' ? '、' : ',') : '';
      const wrapOpportunity = index < items.length - 1
        ? (language === 'zh' ? '<wbr>' : '<wbr> ')
        : '';
      return `<span class="profile-term">${escapeHtml(localize(item, language))}${separator}</span>${wrapOpportunity}`;
    })
    .join('');
  const methods = renderTerms(content.background.methods);
  const topics = renderTerms(content.profile.keywords);

  return `
    <aside class="profile-panel" aria-label="${language === 'zh' ? '个人信息' : 'Profile'}">
      ${portrait}
      <h1 class="profile-name">${escapeHtml(profile.name)}</h1>
      <p class="profile-role">${escapeHtml(localize(content.profile.role, language))}</p>
      ${email}
      ${location}
      ${links}
      <section class="profile-topics" aria-labelledby="profile-topics-title">
        <h2 id="profile-topics-title">${language === 'zh' ? '研究主题' : 'Research topics'}</h2>
        <p>${topics}</p>
      </section>
      <section class="profile-methods" aria-labelledby="profile-methods-title">
        <h2 id="profile-methods-title">${language === 'zh' ? '研究方法' : 'Research methods'}</h2>
        <p>${methods}</p>
      </section>
    </aside>
  `;
}

function renderAbout(content, language) {
  return `
    <section id="about" class="academic-section about-section" data-observed-section>
      <h2 class="visually-hidden">${language === 'zh' ? '关于' : 'About'}</h2>
      <p class="about-headline">${escapeHtml(localize(content.profile.headline, language))}</p>
      <div class="prose">
        ${content.profile.bio.map((paragraph) => `<p>${escapeHtml(localize(paragraph, language))}</p>`).join('')}
      </div>
    </section>
  `;
}

function renderCurrentProject(project, language) {
  const status = escapeHtml(localize(project.status, language));
  const statusLabel = language === 'zh' ? `（${status}）` : `(${status})`;
  const labelGap = language === 'zh' ? '' : ' ';
  return `
    <article class="research-entry">
      <h3>${escapeHtml(localize(project.title, language))}<span class="entry-status">${statusLabel}</span></h3>
      <ul class="research-meta">
        <li><span class="research-meta-label">${language === 'zh' ? '内容：' : 'Content:'}</span>${labelGap}${escapeHtml(localize(project.question, language))}</li>
        <li><span class="research-meta-label">${language === 'zh' ? '方法：' : 'Methods:'}</span>${labelGap}${escapeHtml(localize(project.designData, language))} ${escapeHtml(localize(project.methods, language))}</li>
        <li><span class="research-meta-label">${language === 'zh' ? '角色：' : 'Role:'}</span>${labelGap}${escapeHtml(localize(project.role, language))}</li>
      </ul>
    </article>
  `;
}

function renderPreviousProject(project, language) {
  return `
    <article class="previous-entry">
      <h3>${escapeHtml(localize(project.title, language))}</h3>
      <p>${escapeHtml(localize(project.question, language))}</p>
      <p class="entry-meta">${escapeHtml(localize(project.methods, language))}</p>
    </article>
  `;
}

function renderResearch(content, language) {
  const projects = groupedProjects(content.researchProjects);
  return `
    <section id="research" class="academic-section" data-observed-section>
      <div class="section-heading">
        <h2>${language === 'zh' ? '研究' : 'Research'}</h2>
      </div>
      <div class="research-list">
        ${projects.current.map((project) => renderCurrentProject(project, language)).join('')}
      </div>
      ${projects.collaborative.length ? `
        <div class="collaborative-research">
          <div class="research-list research-list--secondary">
            ${projects.collaborative.map((project) => renderCurrentProject(project, language)).join('')}
          </div>
        </div>
      ` : ''}
      <div class="previous-research">
        <h3 class="subsection-title">${language === 'zh' ? '早期研究' : 'Selected previous research'}</h3>
        <div class="previous-grid">
          ${projects.previous.map((project) => renderPreviousProject(project, language)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderPaper(paper, language) {
  const citationStatus = localize(paper.citationStatus || paper.status, language);
  const venue = paper.venue ? ` <em class="paper-venue">${escapeHtml(paper.venue)}</em>.` : '';
  const metrics = paper.metrics ? ` <span class="paper-metrics">[${escapeHtml(paper.metrics)}]</span>` : '';
  return `
    <article class="paper-entry">
      <p class="apa-citation">${renderOwnName(paper.authors)} (${escapeHtml(citationStatus)}). ${escapeHtml(paper.title)}.${venue}${metrics}</p>
    </article>
  `;
}

function renderPapers(content, language) {
  return `
    <section id="papers" class="academic-section" data-observed-section>
      <div class="section-heading">
        <h2>${language === 'zh' ? '进行中的论文' : 'Working papers'}</h2>
      </div>
      <div class="paper-list">
        ${content.papers.map((paper) => renderPaper(paper, language)).join('')}
      </div>
    </section>
  `;
}

function renderEducation(content, language) {
  return `
    <section id="education" class="academic-section education-section" data-observed-section>
      <div class="section-heading">
        <h2>${language === 'zh' ? '教育经历' : 'Education'}</h2>
      </div>
      <div class="background-block education-block">
        <ol class="timeline-list">
          ${content.background.education.map((item) => `
            <li>
              <div>
                <strong>${escapeHtml(localize(item.institution, language))}</strong>
                <span class="education-degree">${escapeHtml(localize(item.degree, language))}</span>
                ${item.supervisor ? `<p class="education-supervisor">${language === 'zh' ? '导师' : 'Supervisor'}: ${item.supervisor.url
                  ? `<a href="${escapeHtml(item.supervisor.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.supervisor.name)}</a>`
                  : escapeHtml(item.supervisor.name)}</p>` : ''}
              </div>
              <time>${escapeHtml(item.period)}</time>
            </li>
          `).join('')}
        </ol>
      </div>
    </section>
  `;
}

function renderExperience(content, language) {
  return `
    <div class="background-block experience-block">
      <h2>${language === 'zh' ? '工作经历' : 'Work experience'}</h2>
      <div class="experience-list">
        ${content.background.experience.map((item) => `
          <article>
            <header class="experience-heading">
              <p><strong>${escapeHtml(localize(item.organization, language))}</strong><span>${escapeHtml(localize(item.role, language))}</span></p>
              <time class="experience-period">${escapeHtml(localize(item.period, language))}</time>
            </header>
            <ul class="experience-highlights">
              ${item.highlights.map((highlight) => `<li>${escapeHtml(localize(highlight, language))}</li>`).join('')}
            </ul>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProfessionalBackground(content, language) {
  return `
    <section id="experience" class="academic-section" data-observed-section>
      ${renderExperience(content, language)}
      <div class="background-block honors-block">
        <h2>${language === 'zh' ? '奖励与荣誉' : 'Honors and Awards'}</h2>
        <ul>
          ${content.background.honors.map((item) => `<li>${escapeHtml(localize(item, language))}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}

export function renderSinglePage(content, language) {
  return `
    <div class="academic-layout">
      ${renderProfilePanel(content, language)}
      <div class="academic-content">
        ${renderAbout(content, language)}
        ${renderEducation(content, language)}
        ${renderPapers(content, language)}
        ${renderResearch(content, language)}
        ${renderProfessionalBackground(content, language)}
      </div>
    </div>
  `;
}
