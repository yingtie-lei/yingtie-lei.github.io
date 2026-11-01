# Yingtie Lei — Academic Homepage

A minimal Jekyll site adapted from [Home-Page-Template](https://github.com/zhengchen1999/Home-Page-Template), originally based on [Jon Barron's website](https://jonbarron.info/). White background, locally hosted Lato fonts, blue links, and an 800px responsive layout. Publications and preprints are visible immediately.

## Development

```powershell
bundle install
npm ci
npm run dev
```

Open <http://127.0.0.1:4000/>. To check formatting and build the site:

```powershell
npm run lint:prettier
npm run build
```

The build writes `_site/`. GitHub Pages builds and deploys it through `.github/workflows/deploy.yml` when changes are pushed to `main`.

## Content

- Biography and portrait settings: `_pages/about.md`
- Contact links: `_data/socials.yml`
- Publications: `_bibliography/papers.bib`
- Portrait and site images: `assets/img/`
- Website icon: `assets/img/site-logo.svg`, cropped to the left Block O from `TheOhioStateUniversity-Horiz-RGBHEX.svg`, with PNG fallbacks for browser and Apple icons.
- Markup: `_layouts/about.liquid` and `_layouts/paper_code.liquid`
- Styling: `assets/css/home.css`
- BibTeX copying: `assets/js/citations.js`

Add `preprint = {true}` to a bibliography entry for Preprints; omit it for Publications. Preprints sort newest first using `year` and the arXiv identifier in `eprint`. The old `/publications/` URL redirects to the homepage's publications section. The BibTeX button copies the citation and shows selectable text if clipboard access fails.

Only Jekyll Scholar and Jekyll Sitemap are loaded as plugins. There is no al-folio theme, Sass customization, external font request, or JavaScript build step. Lato's source and license are in `assets/fonts/lato/`; the original MIT notice is retained in `LICENSE`.
