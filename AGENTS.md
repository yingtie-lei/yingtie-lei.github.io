# Agent guidelines

This repository is Yingtie Lei's personal academic homepage, adapted from
https://github.com/zhengchen1999/Home-Page-Template. It is a small Jekyll site,
not an al-folio starter or gem-based theme.

- Keep the homepage simple: white background, blue text links, Lato, and a responsive 800px layout.
- Biography and profile settings live in `_pages/about.md`; contact links live in `_data/socials.yml`.
- Publications have one source of truth: `_bibliography/papers.bib`. Keep `preprint = {true}` for preprints.
- Homepage and paper markup live in `_layouts/`; CSS and citation behavior live in `assets/css/home.css` and `assets/js/citations.js`.
- Keep the Google verification file, canonical URL, social preview metadata, and template/font attribution intact.
- Do not reintroduce al-folio plugins, theme assets, example content, or unused build tools.
- Keep `Gemfile` and `_config.yml` plugin declarations aligned.
- The site is hosted at the domain root, so `baseurl` stays empty. Use `relative_url` for local links.
- After edits, run `npm run lint:prettier` and `bundle exec jekyll build`.
- GitHub Pages deployment is managed by `.github/workflows/deploy.yml`.
