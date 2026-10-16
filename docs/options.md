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
- `hero_default_tab`: optional `overview` or `map` starting tab for either Hero
  composition. Omit it to keep automatic behavior (Map while mowing when an
  interactive map exists, otherwise Overview). If Map is unavailable, the card
  shows Overview. A clicked tab takes precedence during normal updates and brief
  same-dashboard remounts; a full page reload reapplies the starting choice.
- `dashboard_panels`: optional list of `camera` and `mission` side panels in
  Dashboard composition. Omit it to show both, or use `[]` to give the map the
  full card width. Hiding the camera side panel keeps the Camera tab available.
- `hero_label`: optional text shown above the card title in Cinematic Hero;
  defaults to the translated `Garden mower` label
- `show_hero_label`: optional boolean, defaults to `true`; set to `false` to
  hide the Cinematic Hero label without changing the card title
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
- `map_background`: optional starting background of the interactive map:
  `standard` (default), `real_scene`, `map` (street map) or `satellite`. A
  background the current scene cannot draw falls back to `standard`; the map
  toolbar can switch for the current view. See
  [street map and satellite](media.md#street-map-and-satellite).
- `map_tile_url` / `satellite_tile_url`: optional `http(s)` tile templates with
  `{z}`, `{x}` and `{y}` for the street map (default OpenStreetMap) and satellite
  (default Esri World Imagery) backgrounds
- `map_tile_attribution` / `satellite_tile_attribution`: attribution shown over
  a custom tile source; the defaults keep their provider's attribution
- `map_tile_max_zoom` / `satellite_tile_max_zoom`: optional highest tile level
  (1–23) a source serves; deeper views enlarge that level's tiles
- `mower_marker`: `real_size` (default) draws the mower on the interactive map
  at its real size when the integration provides the map projection, oriented
  by its heading; far out, the fixed icon is kept so it stays visible. `fixed`
  always uses the fixed icon.
- `mower_length` / `mower_width`: real-size footprint in centimetres (10–300).
  Defaults: 65.9 × 43.9 cm (MOVA LiDAX Ultra 1000; the AWD variant is 74 × 53.2 cm).
- `camera_entity`: optional live-video camera used by the Hero Camera view. A
  compatible companion camera is detected automatically when this is omitted.
- `schedule_calendar_entity`: optional `calendar` entity for the Schedule helper
  in every layout. Overrides automatic detection; see [matching rules](controls.md#schedule-calendar).
- `notification_entity`: optional condition-history sensor with a `recent` array;
  otherwise the card looks for one companion on the same mower device
- `show_recent_conditions`: optional boolean, defaults to `true`; history appears
  only when the selected sensor has usable fault or warning entries
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
- `show_photos`: optional boolean, defaults to `true`; shows the Hero Photos view
  when the Dreame integration saves mower photos
- `show_custom_action_label`: optional boolean, defaults to `true`; set to
  `false` to hide the translated heading above custom actions while keeping the
  actions and their accessible section name
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
