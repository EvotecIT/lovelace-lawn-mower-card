// Local fixture stand-in for Home Assistant's icon host. Production uses ha-icon.
// Authored SVG geometry keeps the preview legible without downloading an icon font.
const shapes = {
  "mdi:thermometer": '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0Z"/><path d="M12 8v10"/>',
  "mdi:calendar-clock": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18m-9 3v4l3 1"/>',
  "mdi:content-cut": '<circle cx="5" cy="6" r="3"/><circle cx="5" cy="18" r="3"/><path d="m7 8 14 13M7 16 21 3"/>',
  "mdi:clock-outline": '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  "mdi:weather-night": '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
  "mdi:information-outline": '<circle cx="12" cy="12" r="10"/><path d="M12 10v7m0-11v.1"/>',
  "mdi:weather-rainy": '<path d="M6 15a5 5 0 1 1 2-10 6 6 0 0 1 11 3 4 4 0 0 1 0 8M7 18l-1 3m7-3-1 3m7-3-1 3"/>',
  "mdi:battery-high": '<path d="M9 2h6M8 5h8a1 1 0 0 1 1 1v15H7V6a1 1 0 0 1 1-1Z"/><path d="M10 10h4v8h-4Z" fill="currentColor"/>',
  "mdi:progress-clock": '<circle cx="12" cy="12" r="9" stroke-dasharray="22 4"/><path d="M12 6v6l4 2"/>',
  "mdi:play": '<path d="M7 3.5 21 12 7 20.5Z" fill="currentColor" stroke="none"/>',
  "mdi:pause": '<path d="M7 4v16M17 4v16" stroke-width="5"/>',
  "mdi:close": '<path d="m6 6 12 12M18 6 6 18"/>',
  "mdi:home-import-outline": '<path d="m2 11 10-8 10 8M5 10v11h5v-7h4v7h5V10"/>',
  "mdi:home-outline": '<path d="m2 11 10-8 10 8M5 10v11h5v-7h4v7h5V10"/>',
  "mdi:dots-horizontal": '<g fill="currentColor" stroke="none"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="20" cy="12" r="2"/></g>',
  "mdi:video-wireless-outline": '<rect x="2" y="6" width="13" height="13" rx="3"/><path d="m15 10 7-3v11l-7-3M5 2h7"/>',
  "mdi:play-circle-outline": '<circle cx="12" cy="12" r="10"/><path d="m10 7 7 5-7 5Z" fill="currentColor" stroke="none"/>',
  "mdi:battery-outline": '<path d="M9 2h6M8 5h8a1 1 0 0 1 1 1v15H7V6a1 1 0 0 1 1-1Z"/>',
  "mdi:robot-mower-outline": '<rect x="3" y="8" width="18" height="10" rx="4"/><path d="M5 8 7 4h10l2 4M7 12h10M7 18v3m10-3v3M1 12v4m22-4v4"/>',
  "mdi:leaf": '<path d="M3 17C1 6 12 6 21 2c1 11-4 18-14 18Z" fill="currentColor" stroke="none"/><path d="m3 22 12-12"/>',
  "mdi:grass": '<path d="M12 21C12 10 8 5 3 4c3 4 4 9 4 17m5-7c1-6 5-10 10-11-4 5-5 12-5 18M2 21h20"/>',
  "mdi:map-outline": '<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17"/>',
  "mdi:view-dashboard-outline": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  "mdi:pause-circle-outline": '<circle cx="12" cy="12" r="10"/><path d="M9 8v8m6-8v8"/>',
  "mdi:power": '<path d="M12 2v10m-5-7a9 9 0 1 0 10 0"/>',
  "mdi:alert-circle-outline": '<circle cx="12" cy="12" r="10"/><path d="M12 6v7m0 4v.1"/>',
  "mdi:shield-lock-outline": '<path d="m12 2 9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6Z"/><rect x="8" y="10" width="8" height="7" rx="1"/><path d="M10 10V8a2 2 0 0 1 4 0v2"/>',
};

customElements.define("ha-icon", class extends HTMLElement {
  static observedAttributes = ["icon"];
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  set icon(value) { this.setAttribute("icon", value); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    this.setAttribute("aria-hidden", "true");
    this.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);flex:none";
    this.shadowRoot.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shapes[this.getAttribute("icon")] || '<circle cx="12" cy="12" r="8"/>'}</svg>`;
  }
});
