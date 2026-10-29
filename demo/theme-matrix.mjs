// Theme matrix for the preview pages. Each entry mimics a kind of Home Assistant
// theme the card has to sit in: `?theme=ha-light`, `?theme=glass`, and so on.
// `?hero_theme=auto` makes the Hero follow the theme instead of its original palette.

const wallpaper =
  "radial-gradient(circle at 15% 20%, #ff8a5b 0, transparent 38%), " +
  "radial-gradient(circle at 85% 10%, #5b8cff 0, transparent 42%), " +
  "radial-gradient(circle at 60% 90%, #2fbf8f 0, transparent 40%), #1b1f3a";

export const themes = {
  demo: { label: "Demo dark" },
  "ha-light": {
    label: "HA light",
    scheme: "light",
    page: "#fafafa",
    vars: {
      "--primary-text-color": "#212121",
      "--secondary-text-color": "#727272",
      "--disabled-text-color": "#bdbdbd",
      "--card-background-color": "#ffffff",
      "--secondary-background-color": "#e5e5e5",
      "--divider-color": "rgba(0, 0, 0, 0.12)",
      "--primary-color": "#03a9f4",
      "--ha-card-border-radius": "12px",
    },
  },
  "ha-dark": {
    label: "HA dark",
    scheme: "dark",
    page: "#111111",
    vars: {
      "--primary-text-color": "#e1e1e1",
      "--secondary-text-color": "#9b9b9b",
      "--disabled-text-color": "#6f6f6f",
      "--card-background-color": "#1c1c1c",
      "--secondary-background-color": "#282828",
      "--divider-color": "rgba(225, 225, 225, 0.12)",
      "--primary-color": "#03a9f4",
      "--ha-card-border-radius": "12px",
    },
  },
  glass: {
    label: "Glass on wallpaper",
    scheme: "dark",
    page: wallpaper,
    vars: {
      "--primary-text-color": "#ffffff",
      "--secondary-text-color": "rgba(255, 255, 255, 0.72)",
      "--disabled-text-color": "rgba(255, 255, 255, 0.4)",
      "--card-background-color": "#232842",
      "--ha-card-background": "rgba(20, 24, 40, 0.35)",
      "--ha-card-backdrop-filter": "blur(14px)",
      "--ha-card-border-color": "rgba(255, 255, 255, 0.18)",
      "--divider-color": "rgba(255, 255, 255, 0.18)",
      "--primary-color": "#ff9f43",
      "--ha-card-border-radius": "22px",
    },
  },
  accent: {
    label: "Custom accent",
    scheme: "light",
    page: "#f3f0f7",
    vars: {
      "--primary-text-color": "#1f1a24",
      "--secondary-text-color": "#6b6375",
      "--card-background-color": "#ffffff",
      "--divider-color": "#ddd5e6",
      "--primary-color": "#8e44ad",
      "--switch-checked-color": "#8e44ad",
      "--state-lawn_mower-active-color": "#e67e22",
      "--ha-card-border-radius": "4px",
    },
  },
};

const params = new URLSearchParams(window.location.search);
export const themeKey = themes[params.get("theme")] ? params.get("theme") : "demo";
export const heroTheme = ["auto", "dark"].includes(params.get("hero_theme")) ? params.get("hero_theme") : undefined;

// Same surface rules as Home Assistant's ha-card, so the preview shows what HA draws.
if (!customElements.get("ha-card")) {
  customElements.define("ha-card", class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = `<style>
        :host {
          display: block; position: relative; box-sizing: border-box;
          background: var(--ha-card-background, var(--card-background-color, white));
          backdrop-filter: var(--ha-card-backdrop-filter, none);
          -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
          box-shadow: var(--ha-card-box-shadow, none);
          border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          color: var(--primary-text-color);
        }
      </style><slot></slot>`;
    }
  });
}

// The preview frame is dark by design; under a matrix theme it steps aside so
// cards sit directly on the theme's page background, as on a real dashboard.
const frameStyles = `
  .app-shell, .app-shell :where(aside, header, .panel, .metric, .rail section, .notes) {
    background: transparent !important; border-color: var(--divider-color) !important;
  }
  .panel { border-color: transparent !important; padding-inline: 0 !important; }
  .app-shell header { background: var(--card-background-color) !important; }
  .app-shell :where(.segment, .segment button, .toggle-button, select, .nav-item.active, .sidebar-note, .status-pill) {
    background: var(--card-background-color) !important; color: var(--primary-text-color) !important;
    border-color: var(--divider-color) !important;
  }
  /* A tint keeps the theme's text colour readable on any accent, light or dark. */
  .app-shell :where(.segment button.active, .toggle-button.active) {
    background: color-mix(in srgb, var(--primary-color) 18%, var(--card-background-color)) !important;
    border-color: var(--primary-color) !important;
  }
  .app-shell :where(h1, h2, h3, p, span, strong, div, label, small) { color: inherit; }
  .app-shell { color: var(--primary-text-color); }
`;

/** Applies the selected theme to the page, the way HA sets theme variables on the dashboard. */
export function applyTheme() {
  const theme = themes[themeKey];
  if (!theme.vars) return;
  const root = document.documentElement;
  for (const [name, value] of Object.entries(theme.vars)) root.style.setProperty(name, value);
  root.style.colorScheme = theme.scheme;
  document.body.style.background = theme.page;
  document.body.style.backgroundAttachment = "fixed";
  document.head.append(Object.assign(document.createElement("style"), { textContent: frameStyles }));
}

/** Adds theme and Hero colour pickers that reload the page with the new query. */
export function mountThemePicker(container) {
  const pick = (label, key, options, current) => {
    const wrap = document.createElement("label");
    wrap.innerHTML = `<span style="margin-right:8px">${label}</span>`;
    const select = document.createElement("select");
    for (const [value, text] of options) select.add(new Option(text, value, false, value === current));
    select.addEventListener("change", () => {
      const next = new URLSearchParams(window.location.search);
      if (select.value) next.set(key, select.value);
      else next.delete(key);
      window.location.search = next.toString();
    });
    wrap.append(select);
    container.append(wrap);
  };
  pick("Theme", "theme", Object.entries(themes).map(([key, theme]) => [key, theme.label]), themeKey);
  pick("Hero colours", "hero_theme", [["", "Original (default)"], ["auto", "Follow theme"]], heroTheme || "");
}

// Screenshot mode for before/after images in PRs: `?state=docked&capture=hero&width=420`
// sets the mower state, then shows only that card on the theme's page background.
window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state");
  const button = state && document.querySelector(`[data-state="${CSS.escape(state)}"]`);
  // The preview wires its state buttons after some async setup, so retry until the click takes.
  for (let attempt = 0; button && !button.classList.contains("active") && attempt < 50; attempt++) {
    button.click();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const card = params.get("capture") && document.getElementById(`preview-card-${params.get("capture")}`);
  if (!card) return;
  // Without a state click, wait for the preview to hand the card its data before moving it.
  for (let attempt = 0; !card.hass && attempt < 50; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const frame = document.createElement("div");
  frame.style.cssText = `width:${Number(params.get("width")) || 420}px;padding:16px`;
  frame.append(card);
  document.body.replaceChildren(frame);
  // A solid page colour lets the capture script trim the empty space below the card.
  document.body.style.backgroundImage = "none";
  // ?open=settings shows the settings sheet as well, for before/after captures.
  if (params.get("open") === "settings") {
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector(".settings-entry")?.click();
  }
  // ?open=3d switches the standard layouts' media area to 3D.
  if (params.get("open") === "3d") {
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector("#media-tab-point-cloud")?.click();
  }
  // ?open=maintenance opens the settings sheet at its Maintenance section.
  if (params.get("open") === "maintenance") {
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector(".settings-entry")?.click();
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector("#maintenance-panel")?.scrollIntoView({ block: "end" });
  }
  // ?open=week opens the week plan from the Hero's Next run.
  if (params.get("open") === "week") {
    await new Promise(resolve => setTimeout(resolve, 300));
    const nextRun = card.shadowRoot?.querySelector(".hero-metric.next-run");
    if (nextRun) nextRun.click();
    else card.shadowRoot?.querySelector(".settings-entry")?.click();
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector("#week-plan")?.scrollIntoView({ block: "nearest" });
  }
  // ?open=more opens the Hero's More menu.
  if (params.get("open") === "more") {
    await new Promise(resolve => setTimeout(resolve, 300));
    card.shadowRoot?.querySelector(".hero-action.more")?.click();
  }
});
