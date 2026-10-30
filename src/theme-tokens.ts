import { css } from "lit";

/**
 * One token layer for every layout. Values come from the Home Assistant theme;
 * inner surfaces are tints over whatever the card background is (solid, glass or
 * wallpaper), never a second opaque card colour. The original Hero palettes only
 * assign different values to these tokens.
 *
 * Media (photos, camera, 3D canvas, map imagery) keeps its own dark scrim and
 * light text because it sits on an image, not on the theme.
 */
export const themeTokenStyles = css`
  ha-card {
    --mower-text:var(--primary-text-color,#212121);
    --mower-muted:var(--secondary-text-color,#727272);
    --mower-border:var(--divider-color,#e0e0e0);
    --mower-accent:var(--mower-custom-accent,var(--primary-color,#03a9f4));
    --mower-canvas:transparent;
    --mower-surface:var(--card-background-color,#fff);
    --mower-dialog:var(--ha-dialog-surface-background,var(--mower-surface));
    --mower-fill:color-mix(in srgb,var(--mower-text) 4%,transparent);
    --mower-fill-strong:color-mix(in srgb,var(--mower-text) 8%,transparent);
    --mower-panel:var(--mower-fill);
    --mower-field:color-mix(in srgb,var(--mower-text) 5%,transparent);
    --mower-hairline:color-mix(in srgb,var(--mower-text) 10%,transparent);
    --mower-fill-accent:color-mix(in srgb,var(--mower-accent) 12%,transparent);
    --mower-fill-accent-strong:color-mix(in srgb,var(--mower-accent) 20%,transparent);
    --mower-border-accent:color-mix(in srgb,var(--mower-accent) 45%,var(--mower-border));
    --mower-radius:var(--mower-custom-radius,var(--ha-card-border-radius,var(--ha-border-radius-lg,12px)));
    --mower-radius-inner:clamp(4px,calc(var(--mower-radius) - 2px),16px);
    --mower-radius-control:clamp(4px,calc(var(--mower-radius) - 4px),10px);
    --mower-switch-on:var(--switch-checked-color,var(--mower-accent));
    --mower-success:var(--success-color,#43a047);
    --mower-warning:var(--warning-color,#ffa600);
    --mower-error:var(--error-color,#db4437);
    --mower-info:var(--info-color,#039be5);
    --mower-state-mowing:var(--state-lawn_mower-mowing-color,var(--state-lawn_mower-active-color,var(--mower-success)));
    --mower-state-returning:var(--state-lawn_mower-returning-color,var(--info-color,#039be5));
    --mower-state-paused:var(--state-lawn_mower-paused-color,var(--mower-warning));
    --mower-state-docked:var(--state-lawn_mower-docked-color,var(--state-inactive-color,var(--mower-muted)));
    --mower-state-error:var(--state-lawn_mower-error-color,var(--mower-error));
    font-family:var(--ha-font-family-body,inherit);
  }
  .state-mowing { --mower-state:var(--mower-state-mowing); }
  .state-returning { --mower-state:var(--mower-state-returning); }
  .state-paused, .state-stopped { --mower-state:var(--mower-state-paused); }
  .state-docked { --mower-state:var(--mower-state-docked); }
  .state-error, .state-unavailable { --mower-state:var(--mower-state-error); }
`;
