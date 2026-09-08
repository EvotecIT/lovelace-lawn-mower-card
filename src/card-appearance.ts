import type { LawnMowerCardConfig } from "./card-config.ts";

/** Appearance is opt-in for existing YAML; only newly generated cards get a preset. */
export function cardAppearance(config: LawnMowerCardConfig) {
  const preset = ["native", "modern", "minimal"].includes(config.appearance || "") ? config.appearance : undefined;
  const surface = ["tinted", "translucent"].includes(config.surface || "") ? config.surface! : "solid";
  const numeric = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined;
  const radius = numeric(config.corner_radius, 0, 32);
  const opacity = numeric(config.surface_opacity, 60, 100) ?? 88;
  const overlay = numeric(config.hero_overlay, 0, 100);
  const accent = typeof config.accent_color === "string" && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(config.accent_color.trim()) ? config.accent_color.trim() : undefined;
  const shadow = config.card_shadow === "none" ? "none" : config.card_shadow === "soft" ? "0 8px 28px #00000020" : config.card_shadow === "theme" ? "var(--ha-card-box-shadow,none)" : undefined;
  const artwork = config.hero_artwork === "none" ? false : config.hero_artwork === "image" ? true : preset !== "minimal";
  return {
    preset, surface, artwork,
    theme: preset ? "auto" as const : config.hero_theme,
    classes: `${preset ? ` appearance appearance-${preset} surface-${surface}` : ""}${!artwork ? " without-artwork" : ""}`,
    styles: {
      "--mower-custom-accent": accent,
      "--mower-custom-radius": radius === undefined ? undefined : `${radius}px`,
      "--mower-custom-shadow": shadow,
      "--mower-surface-opacity": `${opacity}%`,
      "--mower-art-overlay": overlay === undefined ? undefined : String(overlay / 100),
    },
  };
}

export type CardAppearance = ReturnType<typeof cardAppearance>;
