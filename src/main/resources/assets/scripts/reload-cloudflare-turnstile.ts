declare global {
  interface Window {
    turnstile: Turnstile.Turnstile;
  }
}

export {};

/*
 * This listener re-initializes turnstile after a turbo navigation has been done
 */
document.addEventListener("turbo:frame-render", () => {
  if (window.turnstile) {
    document.querySelectorAll<HTMLElement>(".cf-turnstile[data-sitekey]").forEach((el) => {
      if (el.dataset.sitekey) {
        window.turnstile.render(el, {
          sitekey: el.dataset.sitekey,
        });
      }
    });
  }
});
