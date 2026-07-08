/*
 * publications.js
 * ---------------
 * Fetches publications.md, parses its lightweight markdown format into
 * structured records, and renders the publication list — in the SAME ORDER
 * as the file — using the site's existing .publication-item markup/CSS.
 *
 * No external dependencies. Your own name is highlighted by wrapping it in
 * **double asterisks** in the "Authors" field (rendered as
 * <span class="highlighted-author">), matching the hand-written markup.
 *
 * Format (see publications.md for the authored source + docs):
 *   ## Paper Title
 *   - Authors: A†, **Yifan Zeng**†, B
 *   - Venue: EMNLP 2025
 *   - Logo: /assets/img/logos/emnlp-2025.png   (optional; replaces the Info piece after the venue pill with a logo image)
 *   - Info: 973 (2), 163 | 2024-09        (pieces split on " | "; hidden when Logo is set)
 *   - Links: [arXiv](https://...) [Code](https://...)   (optional)
 */
(function () {
  "use strict";

  var KNOWN_FIELDS = {
    author: "authors",
    authors: "authors",
    venue: "venue",
    journal: "venue",
    logo: "logo",
    info: "info",
    link: "links",
    links: "links",
    note: "note",
    year: "year",
    url: "url",
  };

  // Icon-only link buttons: a link's visible label (e.g. "PDF", "Code",
  // "Project") is matched (case-insensitively, by keyword) to one of these
  // SVGs instead of being shown as text. The label is kept as the link's
  // accessible name (aria-label/title). Unmatched labels fall back to text.
  var LINK_ICONS = {
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 3.5L18.5 9H15V5.5ZM7 13h2.2a2.2 2.2 0 0 1 0 4.4H8.4V19H7v-6Zm1.4 1.3v1.8h.7a.9.9 0 1 0 0-1.8h-.7ZM12 13h2.1c1.8 0 2.9 1.1 2.9 3s-1.1 3-2.9 3H12v-6Zm1.4 1.3v3.4h.6c1 0 1.5-.5 1.5-1.7s-.5-1.7-1.5-1.7h-.6ZM18 13h3v1.3h-1.6v1.2h1.4v1.3h-1.4V19H18v-6Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C15.9 5.5 17 5.8 17 5.8c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z"/></svg>',
    website: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.3A8.1 8.1 0 0 1 18.9 8ZM12 4c.8 1 1.5 2.3 1.9 4h-3.8c.4-1.7 1.1-3 1.9-4ZM4.3 14a8.3 8.3 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3a15.7 15.7 0 0 0 1.4 3.3A8.1 8.1 0 0 1 5.1 16Zm3-8h-3a8.1 8.1 0 0 1 4.4-3.3A15.7 15.7 0 0 0 8.1 8ZM12 20c-.8-1-1.5-2.3-1.9-4h3.8c-.4 1.7-1.1 3-1.9 4Zm2.3-6H9.7a14.5 14.5 0 0 1 0-4h4.6a14.5 14.5 0 0 1 0 4Zm.2 5.3a15.7 15.7 0 0 0 1.4-3.3h3a8.1 8.1 0 0 1-4.4 3.3Zm1.8-5.3a16.5 16.5 0 0 0 0-4h3.4a8.3 8.3 0 0 1 0 4h-3.4Z"/></svg>',
  };

  function iconKeyForLabel(label) {
    var l = String(label).trim().toLowerCase();
    if (l.indexOf("pdf") !== -1) return "pdf";
    if (l.indexOf("code") !== -1 || l.indexOf("github") !== -1 || l.indexOf("repo") !== -1) return "github";
    if (l.indexOf("project") !== -1 || l.indexOf("website") !== -1 || l.indexOf("site") !== -1 || l.indexOf("demo") !== -1 || l.indexOf("page") !== -1) return "website";
    return null;
  }

  // "†" after an author's name (and in the "denotes equal contribution"
  // note) is swapped for /assets/icon/equal.svg (a shooting-star icon with
  // its own fixed colors, so it's shown as a plain <img> rather than inlined
  // as currentColor-tinted SVG).
  var EQUAL_CONTRIB_ICON_HTML =
    '<span class="equal-contrib-icon-wrap" role="img" aria-label="equal contribution" title="Equal contribution">' +
    '<img class="equal-contrib-icon" src="/assets/icon/equal.svg" alt="">' +
    "</span>";

  // Swaps every literal "†" in already-rendered (escaped) HTML for the icon.
  // Safe to run on renderInline() output: escapeHtml() never touches "†",
  // so a plain string split/join can't clobber surrounding markup.
  function withEqualContribIcon(html) {
    return html.split("†").join(EQUAL_CONTRIB_ICON_HTML);
  }

  // --- Inline markdown helpers -------------------------------------------

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Allow only safe URL schemes; everything else collapses to "#".
  function sanitizeUrl(url) {
    var u = String(url).trim();
    if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(u)) return u;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return "https://" + u; // bare domain
    return "#";
  }

  // Render a constrained subset of inline markdown to safe HTML:
  // links [text](url), bold **x** (-> <strong> or a span when boldClass given),
  // italic *x* / _x_. Input is escaped first, so literal HTML is shown verbatim.
  // Emphasis is applied ONLY to non-link text segments, so it can never corrupt
  // generated <a> markup.
  function renderInline(text, boldClass) {
    if (text == null) return "";
    var openB = boldClass ? '<span class="' + boldClass + '">' : "<strong>";
    var closeB = boldClass ? "</span>" : "</strong>";

    function emphasize(s) {
      s = s.replace(/\*\*([^*]+)\*\*/g, openB + "$1" + closeB);
      s = s.replace(/__([^_]+)__/g, openB + "$1" + closeB);
      s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
      s = s.replace(/(^|[^_\w])_([^_\n]+)_/g, "$1<em>$2</em>");
      return s;
    }

    var escaped = escapeHtml(text);
    // link url may contain balanced parens, e.g. DOIs like .../S2405-8440(24)08709-7
    var linkRe = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;
    var out = "";
    var last = 0;
    var m;
    while ((m = linkRe.exec(escaped)) !== null) {
      out += emphasize(escaped.slice(last, m.index)); // text before the link
      out += '<a href="' + sanitizeUrl(m[2]) + '" target="_blank" rel="noopener">' + m[1] + "</a>";
      last = m.index + m[0].length;
    }
    out += emphasize(escaped.slice(last)); // trailing text
    return out;
  }

  // Extract [label](url) pairs (url may contain balanced parens).
  function parseLinks(value) {
    var links = [];
    var re = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;
    var m;
    while ((m = re.exec(value)) !== null) {
      links.push({ label: m[1].trim(), url: sanitizeUrl(m[2].trim()) });
    }
    if (links.length === 0) {
      var t = value.trim();
      if (/^https?:\/\/\S+$/i.test(t)) links.push({ label: "Link", url: sanitizeUrl(t) });
    }
    return links;
  }

  // --- Block parser ------------------------------------------------------

  function stripComments(text) {
    return text.replace(/<!--[\s\S]*?-->/g, "");
  }

  function parsePublications(markdown) {
    var text = stripComments(String(markdown)).replace(/\r\n?/g, "\n");
    var lines = text.split("\n");
    var entries = [];
    var current = null;

    var titleRe = /^\s*##\s+(.+?)\s*#*\s*$/;
    var fieldRe = /^\s*(?:[-*+]\s+)?([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/;

    function flush() {
      if (current && current.title) entries.push(current);
      current = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var t = titleRe.exec(line);
      if (t) {
        flush();
        current = { title: t[1].trim(), authors: "", venue: "", logo: "", info: [], links: [], note: "", year: "", url: "" };
        continue;
      }
      if (!current) continue;
      var f = fieldRe.exec(line);
      if (!f) continue;
      var key = KNOWN_FIELDS[f[1].trim().toLowerCase()];
      var val = f[2].trim();
      if (!key) continue;
      if (key === "links") {
        current.links = current.links.concat(parseLinks(val));
      } else if (key === "info") {
        current.info = current.info.concat(
          val.split(/\s*\|\s*/).map(function (s) { return s.trim(); }).filter(Boolean)
        );
      } else {
        current[key] = val;
      }
    }
    flush();
    return entries;
  }

  // The paper's primary link, used to make the title clickable — always
  // kept in sync with the paper's own "PDF" link in `Links:`, so the title
  // never points somewhere different from the PDF button. Falls back to an
  // explicit `URL:` field, then an arXiv id in Info
  // (arXiv:2509.18575 -> https://arxiv.org/abs/2509.18575). Returns null when
  // there is nothing to link to.
  function primaryUrl(e) {
    var pdfLink = (e.links || []).filter(function (l) { return iconKeyForLabel(l.label) === "pdf"; })[0];
    if (pdfLink) return pdfLink.url;

    if (e.url) {
      var u = sanitizeUrl(e.url.trim());
      return u === "#" ? null : u;
    }
    var hay = (e.info || []).join("  ");
    var m = hay.match(/arxiv:\s*(\d{4}\.\d{4,5})(?:v\d+)?/i);
    if (m) return "https://arxiv.org/abs/" + m[1];
    return null;
  }

  // --- Rendering (matches the site's existing .publication-item markup) --

  function renderEntry(e, idx) {
    var parts = [];
    parts.push('<div class="publication-item" style="--pi:' + (idx || 0) + '">');
    var titleInner = renderInline(e.title);
    var url = primaryUrl(e);
    if (url) {
      titleInner =
        '<a class="publication-title-link" href="' + escapeHtml(url) +
        '" target="_blank" rel="noopener">' + titleInner + "</a>";
    }
    parts.push('<h3 class="publication-title">' + titleInner + "</h3>");
    if (e.authors) parts.push('<div class="publication-authors">' + withEqualContribIcon(renderInline(e.authors, "highlighted-author")) + "</div>");

    var pieces = [];
    if (e.venue) pieces.push('<span class="publication-venue">' + renderInline(e.venue) + "</span>");
    if (e.logo) {
      pieces.push('<img class="publication-venue-logo" src="' + escapeHtml(e.logo) + '" alt="' + escapeHtml(e.venue || "") + '">');
    } else {
      e.info.forEach(function (d) {
        pieces.push('<span class="publication-date">' + renderInline(d) + "</span>");
      });
    }
    if (pieces.length) {
      parts.push('<div class="publication-info">' + pieces.join('<span class="publication-separator">•</span>') + "</div>");
    }

    if (e.note) parts.push('<div class="publication-note">' + renderInline(e.note) + "</div>");

    if (e.links.length) {
      var links = e.links
        .map(function (l) {
          var key = iconKeyForLabel(l.label);
          var inner = key ? LINK_ICONS[key] : escapeHtml(l.label);
          return '<a class="publication-link" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener" aria-label="' +
            escapeHtml(l.label) + '" title="' + escapeHtml(l.label) + '">' + inner + "</a>";
        })
        .join("");
      parts.push('<div class="publication-links">' + links + "</div>");
    }

    parts.push("</div>");
    return parts.join("");
  }

  function renderList(entries) {
    var items = entries.map(renderEntry).join("");
    return '<div class="publications-container">' + items + "</div>";
  }

  // --- Timeline (group by year) ------------------------------------------

  // Derive a paper's year from the "completion date of the initial version":
  // an explicit `Year:` field wins, then the arXiv id (YYMM -> 20YY), then a
  // YYYY-MM date in Info, then any bare year in Info, then the venue year.
  // Returns a number, or null when nothing can be parsed.
  function deriveYear(e) {
    if (e.year) {
      var ey = String(e.year).match(/(?:19|20)\d{2}/);
      if (ey) return parseInt(ey[0], 10);
    }
    var hay = (e.info || []).join("  ");
    var m = hay.match(/arxiv:\s*(\d{2})\d{2}/i); // arXiv:YYMM.xxxxx -> 20YY
    if (m) return 2000 + parseInt(m[1], 10);
    m = hay.match(/\b(20\d{2})[-/.]\d{1,2}\b/); // 2024-09
    if (m) return parseInt(m[1], 10);
    m = hay.match(/\b(?:19|20)\d{2}\b/); // a bare year somewhere in Info
    if (m) return parseInt(m[0], 10);
    if (e.venue) {
      m = e.venue.match(/\b(20\d{2})\b/); // fall back to the venue year
      if (m) return parseInt(m[1], 10);
    }
    return null;
  }

  // Group entries by derived year (file order preserved within a year), then
  // order the groups newest-first; undated entries go last.
  function groupByYear(entries) {
    var map = {};
    var order = [];
    entries.forEach(function (e) {
      var y = deriveYear(e);
      var key = y == null ? "other" : String(y);
      if (!map[key]) {
        map[key] = { year: y, items: [] };
        order.push(key);
      }
      map[key].items.push(e);
    });
    var groups = order.map(function (k) { return map[k]; });
    groups.sort(function (a, b) {
      if (a.year == null) return 1;
      if (b.year == null) return -1;
      return b.year - a.year;
    });
    return groups;
  }

  function renderTimeline(entries) {
    var groups = groupByYear(entries);
    var gi = 0; // global index -> drives the staggered fade-in across the list
    var out = '<div class="publications-container pub-timeline">';
    groups.forEach(function (g) {
      out += '<div class="pub-year-group">';
      out += '<div class="pub-year-marker">';
      if (g.year != null) out += '<span class="pub-year">' + g.year + "</span>";
      out += "</div>";
      out += '<div class="pub-year-items">';
      g.items.forEach(function (e) {
        out += renderEntry(e, gi++);
      });
      out += "</div></div>";
    });
    out += "</div>";
    return out;
  }

  function renderInto(container, markdown) {
    var entries = parsePublications(markdown);
    if (!entries.length) {
      container.innerHTML = '<p class="publications-empty">No publications found.</p>';
      return 0;
    }
    container.innerHTML = renderList(entries);
    container.classList.add("is-ready");
    return entries.length;
  }

  // --- DOM bootstrap (browser only) --------------------------------------

  function init() {
    var container = document.getElementById("publications-list");
    if (!container) return;
    var src = container.getAttribute("data-src") || "publications.md";
    fetch(src, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (md) {
        renderInto(container, md);
      })
      .catch(function (err) {
        container.innerHTML =
          '<p class="publications-empty">Could not load publications. ' +
          'See <a href="' + escapeHtml(src) + '">the source list</a>.</p>';
        if (window.console) console.error("publications.js:", err);
      });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  // Node export for unit testing.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      escapeHtml: escapeHtml,
      sanitizeUrl: sanitizeUrl,
      renderInline: renderInline,
      parseLinks: parseLinks,
      stripComments: stripComments,
      parsePublications: parsePublications,
      renderEntry: renderEntry,
      renderList: renderList,
      primaryUrl: primaryUrl,
      deriveYear: deriveYear,
      groupByYear: groupByYear,
      renderTimeline: renderTimeline,
    };
  }
})();
