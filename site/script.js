const cursor = document.querySelector(".cursor-orb");
const finePointer = window.matchMedia("(pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (cursor && finePointer.matches && !reducedMotion.matches) {
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let initialized = false;

  const draw = () => {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    window.requestAnimationFrame(draw);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!initialized) {
        currentX = targetX;
        currentY = targetY;
        initialized = true;
      }

      const interactive =
        event.target instanceof Element &&
        event.target.closest("a, button, [role='button']");

      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-interactive", Boolean(interactive));
    },
    { passive: true },
  );

  document.documentElement.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-interactive");
  });

  window.requestAnimationFrame(draw);
}
