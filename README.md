# Yingtie Lei — Academic Homepage

This site is built with Jekyll and deployed to GitHub Pages. The homepage uses its own layout and stylesheet (`_layouts/about.liquid` and `assets/css/home.css`), with a layout inspired by the [minimalist Hugo academic website](https://pascalmichaillat.org/hugo-website/). It does not load the al-folio theme styles or scripts.

## Local preview

```powershell
bundle install
bundle exec jekyll serve
```

Then open <http://127.0.0.1:4000/>.

Personal information lives in `_pages/about.md` and `_data/socials.yml`. Publications are managed in `_bibliography/papers.bib`.

The homepage palette uses light gray (`#F4F6F8`) for the background, deep blue (`#1F3A5F`) for text and links, blue gray (`#7A93A8`) for borders, and orange (`#E69F00`) for interaction accents. Muted text uses a darker blue gray for readability.

Mentor links share the border color. Google Scholar, LinkedIn, and email use 20px SVG icons beside the name, inheriting its deep blue color, with accessible labels and hover titles. The circular Scholar badge uses the Academicons glyph (see `assets/icons/SOURCE.txt`); LinkedIn uses a rounded square. Hovering fades the icons without adding an underline.

The homepage has Publications and Preprints buttons. Both lists start collapsed. Opening one closes the other; clicking the open category closes it. The page and paper cards use Times New Roman, with Times and serif fallbacks. Cards show the title, authors, venue and links. Venues use a bold abbreviation and year, such as **CVPR 2026** or **arXiv 2026**. The BibTeX button copies the citation to the clipboard. To list a paper under Preprints, add `preprint = {true}` to its BibTeX entry; omit or remove that field when it is published. The existing `/publications/` URL remains available for old links.
