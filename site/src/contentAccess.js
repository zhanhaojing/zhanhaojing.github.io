export const SUPPORTED_LANGUAGES = ['zh', 'en'];

export function localize(value, language) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value[language] || value.en || value.zh || '';
}

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
}

export function visibleProfile(profile) {
  const privacy = profile.privacy || {};
  const showPhoto = Boolean(privacy.showPhoto && profile.photo?.src);

  return {
    name: privacy.showFullName && profile.private?.fullName
      ? profile.private.fullName
      : profile.displayName,
    email: privacy.publicEmailEnabled ? profile.publicEmail : '',
    location: profile.location || { zh: '', en: '' },
    showPhoto,
    photo: showPhoto ? profile.photo : { src: '', alt: { zh: '', en: '' } },
    cvDownloadEnabled: Boolean(privacy.cvDownloadEnabled),
    links: Array.isArray(profile.links) ? profile.links : []
  };
}

export function groupedProjects(projects) {
  return {
    current: projects.filter((project) => project.group === 'current'),
    collaborative: projects.filter((project) => project.group === 'collaborative'),
    previous: projects.filter((project) => project.group === 'previous')
  };
}
