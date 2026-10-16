document.querySelectorAll("[data-paper-disclosures]").forEach((section) => {
  const buttons = Array.from(section.querySelectorAll("[data-paper-toggle]"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const wasExpanded = button.getAttribute("aria-expanded") === "true";
      buttons.forEach((other) => {
        const expanded = other === button && !wasExpanded;
        other.setAttribute("aria-expanded", String(expanded));
        document.getElementById(other.dataset.paperToggle).hidden = !expanded;
      });
    });
  });
});

async function copyCitation(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for browsers that deny the Clipboard API.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    textarea.remove();
  }
}

document.querySelectorAll("[data-copy-bibtex]").forEach((button) => {
  button.addEventListener("click", async () => {
    const citation = document.getElementById(button.dataset.copyBibtex);
    const status = button.parentElement.querySelector("[role='status']");
    button.disabled = true;
    status.textContent = "";
    try {
      await copyCitation(citation.textContent.trim());
      status.textContent = "Copied!";
    } catch {
      citation.hidden = false;
      status.textContent = "Select the citation below to copy.";
      const range = document.createRange();
      range.selectNodeContents(citation);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } finally {
      button.disabled = false;
      button.focus({ preventScroll: true });
    }
  });
});
