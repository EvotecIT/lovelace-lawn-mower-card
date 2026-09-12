# Card options

[Back to the README](../README.md) · [Configuration examples](configuration.md) · [Customization](customization.md)

- `entity`: required `lawn_mower` entity id
- `name`: optional card title override
- `locale`: optional language override: `auto` (default), `en`, `cs`, `de`, `fr`,
  `it`, `pl`, `ru`, `uk`, or `es`. Automatic mode follows the Home Assistant user
  language, then the browser language, and safely falls back to English.
- `layout`: optional `default`, `compact`, `wide`, or `hero`
- `appearance`: optional `native`, `modern`, or `minimal` preset. New cards use
  `native`; omitted settings preserve existing appearance. Presets follow HA colors.
- `surface`: `solid` (default), `tinted`, or `translucent`; requires a preset
- `surface_opacity`: translucent surface opacity, 60–100; default 88
- `accent_color`: optional `#RGB` or `#RRGGBB` accent; otherwise follows the theme
- `corner_radius`: optional 0–32 pixel outer radius; otherwise follows the preset
- `card_shadow`: optional `theme`, `none`, or `soft`; otherwise follows the preset
- `hero_artwork`: `auto` (default), `image`, or `none`. Minimal hides overview
  artwork in auto mode; map and camera availability is unchanged.
- `hero_overlay`: photographic overview overlay strength, 0–100; default 100
- `hero_layout`: optional `cinematic` (default) or `dashboard` composition
  when `layout: hero` is selected
- `hero_image`: optional Hero overview background. Use an HTTPS URL or a
  `/local/...` path for a file stored under Home Assistant's `config/www`.
- `hero_image_position`: optional image focus: `center` (default), `left`,
  `right`, `top`, or `bottom`
- `map_entity`: optional camera entity for the mower map. If your integration
  exposes `mowing_map_api_path`, choose that camera for the interactive mowing
  view. Otherwise, a live-path or runtime-overlay camera can show observed
  movement in its image. A local `point_cloud_api_path` attribute enables the
  3D viewer.
- `map_fit`: optional `contain` (default) to show the complete map or `cover` to
  fill the map viewport by cropping it
- `map_position`: optional crop focus: `center` (default), `top`, `bottom`,
  `left`, `right`, `top-left`, `top-right`, `bottom-left`, or `bottom-right`;
  it is most noticeable with `map_fit: cover`
- `camera_entity`: optional live-video camera used by the Hero Camera view. A
  compatible companion camera is detected automatically when this is omitted.
- `show_map`: optional boolean override for the map section
- `show_point_cloud`: optional boolean override for the 3D point-cloud viewer;
  defaults to visible when `map_entity` advertises a supported local endpoint
- `status_entity`: optional entity shown as the primary subtitle
- `battery_entity`: optional entity used for the compact header summary
- `progress_entity`: optional mission-progress sensor, normally measured in `%`;
  unrelated status entities are ignored by the Hero mission tile
- `coverage_entity`: optional current or completed mowed-area sensor used by the
  Hero coverage metric
- `coverage_total_entity`: optional total or target-area sensor displayed
  alongside `coverage_entity`
- `show_default_actions`: optional boolean, defaults to `true`
- `show_helper_actions`: optional boolean, defaults to `true`
- `show_advanced_details`: optional boolean, defaults to `false`; shows the
  Planned Run and Live Session panels
- `control_entities`: optional list of `select`, `number`, `switch`, or `time`
  entities rendered as inline mower controls
- `controls_mode`: optional `auto`, `append`, `custom`, or `hidden`; omit to keep existing discovery behavior
- `summary_mode`: optional `auto`, `append`, `custom`, or `hidden`; omit to keep the existing layout default
- `summary_entities`: optional list of entity IDs or objects using the same fields as `tiles`, rendered as summary chips in every layout
- `hero_sections`: optional ordered list of `controls`, `tiles`, `actions`, and `details`; omitted sections are hidden, and an empty list hides all four
- `hero_density`: optional `comfortable` (default) or `compact` spacing for custom content
- `hero_theme`: optional `dark` (original Hero colors, default) or `auto` (Home Assistant theme outside the media canvas)
- `tile_columns`: optional integer from 1 to 4; narrow cards use at most two columns
- `actions`: optional list of extra action chips
  - `type`: one of `start`, `pause`, `dock`, `more-info`, or `service`
  - `label`: optional button label override
  - `icon`: optional MDI icon override
  - `entity`: optional target entity for `type: more-info`
  - `service`: required for `type: service`, using `domain.service` format
  - `service_data`: optional service data payload for `type: service`
  - `confirmation`: optional message shown before executing the action
  - `visibility`: optional `{ entity, state }` raw-state condition
- `tiles`: optional list of extra stat tiles
  - `entity`: entity id
  - `label`: optional tile label override
  - `icon`: optional MDI icon override
  - `attribute`: optional scalar entity attribute to display instead of state
  - `unit`: optional displayed unit override; an empty string removes the unit
  - `show_unavailable`: optional boolean, defaults to `false`
  - `visibility`: optional `{ entity, state }` raw-state condition

The built-in visual editor covers the main card fields, Hero appearance,
explicit `control_entities`, `summary_entities`, extra `tiles`, and custom
`actions`.
`service_data` for service actions is edited as JSON in the editor, and entity
fields offer browser suggestions from the entities Home Assistant already knows
about. When you select a mower entity, the editor also tries to prefill common
companion entities such as map, state, battery, status tiles, and mower select
controls without overwriting deliberate custom choices. With the Dreame mower
integration, the normal card stays focused on current state and actions. Enable
`show_advanced_details` when you want the selected-map plan and detailed runtime
telemetry on the dashboard.
For a new automatic map selection, the card prefers a compatible primary map
camera with the interactive map endpoint. An explicitly configured camera is
preserved. See [maps and video](media.md) when choosing between map cameras.
