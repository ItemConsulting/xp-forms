declare global {
  interface Window {
    turnstile: Turnstile.Turnstile;
    xpFormsTurnstileOnload?: () => void;
  }
}

export {};

type PendingSubmit = {
  submitter: HTMLElement | null;
  timeoutId: number | undefined;
};

const FIELD_TURNSTILE_RESPONSE = "cf-turnstile-response";
const SELECTOR_WIDGET = ".cf-turnstile[data-sitekey]";
const SELECTOR_STATUS = ".forms-turnstile-status";
const PENDING_TIMEOUT_MS = 10000;

const pendingSubmits = new WeakMap<HTMLFormElement, PendingSubmit>();
const releasedForms = new WeakSet<HTMLFormElement>();

function renderAll(): void {
  document.querySelectorAll<HTMLElement>(SELECTOR_WIDGET).forEach((el) => {
    if (!el.dataset.sitekey || el.dataset.widgetId !== undefined) {
      return;
    }

    const widgetId = window.turnstile.render(el, {
      sitekey: el.dataset.sitekey,
      callback: () => submitPending(el.closest("form")),
      "error-callback": () => {
        releasePending(el.closest("form"));
        return false;
      },
      "before-interactive-callback": () => stopTimeout(el.closest("form")),
    });

    el.dataset.widgetId = widgetId ?? "";
  });
}

function hasToken(form: HTMLFormElement): boolean {
  const input = form.querySelector<HTMLInputElement>(`[name="${FIELD_TURNSTILE_RESPONSE}"]`);

  return Boolean(input?.value);
}

function setBusy(form: HTMLFormElement, submitter: HTMLElement | null, isBusy: boolean): void {
  const status = form.querySelector<HTMLElement>(SELECTOR_STATUS);
  const widget = form.querySelector<HTMLElement>(SELECTOR_WIDGET);

  if (isBusy) {
    submitter?.setAttribute("aria-busy", "true");
  } else {
    submitter?.removeAttribute("aria-busy");
  }

  if (status) {
    status.textContent = isBusy ? (widget?.dataset.pendingText ?? "") : "";
  }
}

function stopTimeout(form: HTMLFormElement | null): void {
  const pending = form ? pendingSubmits.get(form) : undefined;

  if (pending) {
    window.clearTimeout(pending.timeoutId);
    pending.timeoutId = undefined;
  }
}

/*
 * Sends a form that was held back while waiting for the token
 */
function submitPending(form: HTMLFormElement | null): void {
  const pending = form ? pendingSubmits.get(form) : undefined;

  if (!form || !pending) {
    return;
  }

  window.clearTimeout(pending.timeoutId);
  pendingSubmits.delete(form);
  setBusy(form, pending.submitter, false);

  if (pending.submitter?.isConnected) {
    form.requestSubmit(pending.submitter);
  } else {
    form.requestSubmit();
  }
}

/*
 * Turnstile failed or took too long. Send the form without a token, so that the server can answer with an error
 * message instead of leaving the user stuck.
 */
function releasePending(form: HTMLFormElement | null): void {
  if (form && pendingSubmits.has(form)) {
    releasedForms.add(form);
    submitPending(form);
  }
}

/*
 * This listener holds back the submit if the user is quicker than turnstile, and sends the form once the token is ready
 */
document.addEventListener(
  "submit",
  (event) => {
    const form = event.target;

    if (
      !(form instanceof HTMLFormElement) ||
      !form.querySelector(SELECTOR_WIDGET) ||
      releasedForms.has(form) ||
      hasToken(form)
    ) {
      return;
    }

    event.preventDefault();

    if (pendingSubmits.has(form)) {
      return;
    }

    pendingSubmits.set(form, {
      submitter: event.submitter,
      timeoutId: window.setTimeout(() => releasePending(form), PENDING_TIMEOUT_MS),
    });
    setBusy(form, event.submitter, true);
  },
  true,
);

/*
 * This listener re-initializes turnstile after a turbo navigation has been done
 */
document.addEventListener("turbo:frame-render", () => {
  if (window.turnstile) {
    renderAll();
  }
});

// The turnstile script is loaded async, so it might be ready before or after this script
if (window.turnstile) {
  renderAll();
} else {
  window.xpFormsTurnstileOnload = renderAll;
}
