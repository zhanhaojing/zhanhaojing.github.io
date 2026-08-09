# H. Zhan academic homepage

A bilingual, single-page academic homepage designed for GitHub Pages.

## Preview locally

For the simplest preview, open `site/preview.html` directly. It is a self-contained offline preview and does not require a local server.

To preview the deployable file structure instead, run:

```bash
npm run serve
```

Then open `http://localhost:4173`.

Run `npm run build:preview` after editing the content or styles to refresh the offline preview.

## Edit content

All public profile content lives in `site/content/siteContent.json`. The privacy controls in `profile.privacy` determine whether the full name, portrait, public email, and CV link are shown.

## Publish with GitHub Pages

1. Create the public repository `zhanhaojing.github.io` under the GitHub account `zhanhaojing`.
2. Use this project folder as the repository root and push it to the `main` branch.
3. In GitHub, open Settings, then Pages, and select **GitHub Actions** as the publishing source.
4. The included workflow tests the site and publishes the contents of `site` automatically after every push to `main`.

The public address will be `https://zhanhaojing.github.io/`. A paid domain is optional and can be connected later.

## Before public launch

- Add the approved public full name.
- Add a public CV PDF and set `cvDownloadEnabled` to `true`.
- Add verified Scholar, ORCID, or GitHub links.
- Confirm manuscript author order and status wording.
