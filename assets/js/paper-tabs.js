document.querySelectorAll("[data-paper-disclosures]").forEach((section) => {
  const buttons = Array.from(section.querySelectorAll("[data-paper-toggle]"));
  const panels = buttons.map((button) => document.getElementById(button.dataset.paperToggle));
  const container = document.createElement("div");
  container.className = "academic-research__panels";
  panels.forEach((panel) => container.appendChild(panel));
  section.appendChild(container);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activePanel = null;
  let heightAnimation;
  let fades = [];

  function showPanel(nextPanel) {
    const switching = activePanel !== null && nextPanel !== null && activePanel !== nextPanel;
    activePanel = nextPanel;
    const startHeight = container.getBoundingClientRect().height;
    const opacities = panels.map((panel) => (panel.hidden ? 0 : Number(getComputedStyle(panel).opacity)));
    container.style.height = `${startHeight}px`;
    heightAnimation?.cancel();
    heightAnimation = undefined;
    fades.forEach((fade) => fade.cancel());
    fades = [];

    function finish() {
      panels.forEach((panel) => {
        panel.hidden = panel !== nextPanel;
        panel.style.position = "";
      });
      fades.forEach((fade) => fade.cancel());
      fades = [];
      container.style.height = nextPanel ? "" : "0px";
      heightAnimation?.cancel();
      heightAnimation = undefined;
    }

    panels.forEach((panel, index) => {
      panel.inert = panel !== nextPanel;
      panel.hidden = panel !== nextPanel && opacities[index] === 0;
      panel.style.position = panel === nextPanel ? "" : "absolute";
    });

    if (!switching || reducedMotion.matches || typeof container.animate !== "function") {
      finish();
      return;
    }

    const nextStyle = getComputedStyle(nextPanel);
    const endHeight = nextPanel.getBoundingClientRect().height + parseFloat(nextStyle.marginTop) + parseFloat(nextStyle.marginBottom);
    const timing = { duration: 200, easing: "linear", fill: "both" };
    fades = panels
      .filter((panel) => !panel.hidden)
      .map((panel) => panel.animate([{ opacity: opacities[panels.indexOf(panel)] }, { opacity: panel === nextPanel ? 1 : 0 }], timing));
    const animation = container.animate(
      [
        { height: `${startHeight}px`, overflow: "hidden" },
        { height: `${endHeight}px`, overflow: "hidden" },
      ],
      { ...timing, easing: "cubic-bezier(0.33, 0, 0.67, 1)" }
    );
    heightAnimation = animation;
    animation.onfinish = () => {
      if (heightAnimation === animation) finish();
    };
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const wasExpanded = button.getAttribute("aria-expanded") === "true";
      buttons.forEach((other) => {
        const expanded = other === button && !wasExpanded;
        other.setAttribute("aria-expanded", String(expanded));
      });
      showPanel(wasExpanded ? null : document.getElementById(button.dataset.paperToggle));
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
  let statusTimeout;
  button.addEventListener("click", async () => {
    const citation = document.getElementById(button.dataset.copyBibtex);
    const status = button.parentElement.querySelector("[role='status']");
    window.clearTimeout(statusTimeout);
    button.disabled = true;
    status.textContent = "";
    try {
      await copyCitation(citation.textContent.trim());
      status.textContent = "Copied!";
      statusTimeout = window.setTimeout(() => {
        status.textContent = "";
      }, 2000);
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
