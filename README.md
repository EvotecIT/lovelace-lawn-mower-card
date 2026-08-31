# Lawn Mower Card for Home Assistant

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/)
[![Validate](https://img.shields.io/github/actions/workflow/status/EvotecIT/lovelace-lawn-mower-card/validate.yml?branch=main&label=Validate)](https://github.com/EvotecIT/lovelace-lawn-mower-card/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/EvotecIT/lovelace-lawn-mower-card/release.yml?label=Release)](https://github.com/EvotecIT/lovelace-lawn-mower-card/actions/workflows/release.yml)
[![License](https://img.shields.io/github/license/EvotecIT/lovelace-lawn-mower-card)](LICENSE)

Give a Home Assistant lawn mower a dashboard that looks and behaves like a
mower—not a renamed vacuum card.

![Lawn Mower Card Hero layout preview](assets/lawn-mower-card-hero.png)

The Hero layout starts with mower state, battery, and supported controls, then
adds mission coverage, 2D/3D maps, and live camera only when those companion
entities are available. Traditional compact, default, and wide layouts remain
available for denser dashboards.

The card works with a standard `lawn_mower` entity and becomes richer when an
integration exposes companion map, camera, schedule, control, and telemetry
entities. Optional features disappear cleanly when they are not available, so
a mower-only setup does not show empty tabs or controls it cannot use.

## What the card includes

| Area | Included today                                                                                                                           |
| --- |------------------------------------------------------------------------------------------------------------------------------------------|
| Mower basics | State and activity, battery, and capability-aware Start, Pause, and Dock controls                                                        |
| Dashboard layouts | Image-led Hero plus compact, default, and wide layouts for different dashboard densities                                                 |
| Maps and media | Optional 2D map, live-path overlays, on-demand 3D point clouds, and Home Assistant camera playback                                       |
| Direct controls | Auto-discovered or explicitly configured selects, numbers, switches, time inputs, target selectors, and schedule switches                |
| Mowing context | Mission progress, area coverage, summary chips, map identity, rain delay, errors, and configurable status tiles                          |
| Advanced workflows | Multi-zone selection when supported, Planned Run confirmation, device settings, and Live Session telemetry                               |
| Customization | Visual editor, custom Hero image and focus, map fit and crop focus, extra tiles, helper actions, and custom services                     |
| Localization | Card and editor translations in English, German, French, Italian, Polish, Russian, Ukrainian, and Spanish, including native plural rules |

Start with only the mower entity. The card automatically adds compatible
companions it can identify, while every important companion can also be chosen
explicitly in the visual editor or YAML. Integration-specific protocol and
device writes remain owned by the Home Assistant integration; the card uses
standard Home Assistant entities and services wherever possible.

The first fully exercised pairing is
[Dreame Lawn Mower](https://github.com/EvotecIT/homeassistant-dreamelawnmower),
but the card remains integration-agnostic at its core.

![Live-path map inside the Lawn Mower Card Hero layout](assets/lawn-mower-card-map.png)

## 🧩 More from Evotec

Our Home Assistant projects:

- [Dreame Lawn Mower](https://github.com/EvotecIT/homeassistant-dreamelawnmower)
  with its companion
  [Lawn Mower Card](https://github.com/EvotecIT/lovelace-lawn-mower-card)
- [Siegenia](https://github.com/EvotecIT/homeassistant-siegenia) for local
  window control
- [KEF](https://github.com/EvotecIT/homeassistant-kef) for local speaker control
- [Devialet](https://github.com/EvotecIT/homeassistant-devialet) for local
  speaker control
- [EasyControlX](https://github.com/EvotecIT/homeassistant-easycontrolx) for
  workstation control

Our Apple apps:

- [CasaRay](https://casaray.dev/) offers a calm whole-home view on iPhone, iPad,
  and Mac. [View it on the App Store](https://apps.apple.com/us/app/casaray/id6778025328).
- [Tactra Remote](https://tactra.dev/) focuses on Home Assistant media control
  across iPhone, iPad, Apple Watch, and Mac.
  [View it on the App Store](https://apps.apple.com/us/app/tactra-remote/id6775426723).

CasaRay's complete-home Free experience remains genuinely useful. CasaRay Plus
and Tactra purchases help fund continued work on that free experience and these
open-source Home Assistant projects. If you prefer to support the open-source
work directly, [GitHub Sponsors](https://github.com/sponsors/PrzemyslawKlys) is
another option. None of them is required to use this project.

## Installation

### HACS

1. Open HACS and search for **Lawn Mower Card** in the dashboard catalog.
2. Install the card and restart Home Assistant if HACS asks you to.
3. If the card is not in the catalog yet, add
   `https://github.com/EvotecIT/lovelace-lawn-mower-card` as a custom
   **Dashboard** repository, then install it.
4. Add the resource only if HACS does not do it automatically:

```yaml
url: /hacsfiles/lovelace-lawn-mower-card/lawn-mower-card.js
type: module
```

### Manual

1. Build or download `lawn-mower-card.js`.
2. Place it in your Home Assistant `www` directory.
3. Add it as a Lovelace resource:

```yaml
url: /local/lawn-mower-card.js
type: module
```

## Configuration

### Visual editor (recommended)

You do not need to write YAML to use the card:

1. Open a dashboard and choose **Edit dashboard**.
2. Select **Add card**, then search for **Lawn Mower Card**.
3. Choose the mower entity and a layout. The editor safely fills compatible
   map, live-video, state, battery, progress, and control entities when it can.
4. Choose whether the map should remain fully visible or crop to fill the card.
   When cropping, select the part of the garden that should stay in view.
5. Review the live preview and save the card.

When schedule switches are available, the card discovers the switches belonging
to the selected mower and shows them in a separate schedule panel. It calls the
standard Home Assistant `switch.turn_on` and `switch.turn_off` services; schedule
protocol details remain owned by the mower integration.

The editor also supports explicit companion entities, control selectors,
summary chips, extra tiles, custom actions, and advanced planning and telemetry
without requiring raw configuration changes.

### Integration compatibility

Any integration that exposes a standard Home Assistant `lawn_mower` entity can
use the card. Start, pause, and dock buttons follow the entity's standard
`supported_features` bitmask, so read-only or partially controllable mowers do
not show actions that Home Assistant will reject.

Optional UI follows optional entities:

| Integration surface | Card behavior |
| --- | --- |
| `lawn_mower` only | State, available standard actions, and Hero Overview; the redundant one-item view bar is hidden |
| map camera | Adds Map |
| map camera with `point_cloud_api_path` | Adds 3D |
| live-video camera | Adds Camera |
| related sensors, calendars, selects, switches, and buttons | Adds the matching summaries, schedules, controls, and helpers |

Richer automatic setup works best when companion entities belong to the same
Home Assistant device and use stable translation keys such as `live_video`,
`map`, or `schedule`. Entity names may be changed by the user; device ownership
and translation keys are therefore preferred over name matching.

A mower without map or camera entities needs no special workaround:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
layout: hero
```

The Hero view bar appears only after a second usable view is available.

Integrations may expose optional tri-state feature metadata on the mower entity:

```yaml
feature_capabilities:
  live_video:
    state: supported # supported, unsupported, or unknown
    source: advertised # model, advertised, observed, or unknown
```

Missing metadata means unknown, not unsupported. The card continues normal
entity discovery for unknown features and always honors explicitly configured
entities. Integration-specific services can be added as custom actions without
changing the generic mower controls.

### Custom Hero background

Select the **Hero** layout to reveal a **Hero appearance** section in the visual
editor. Enter either an HTTPS image URL or a Home Assistant `/local/...` path,
then choose the part of the image that should stay in focus.

For an image stored on your Home Assistant instance:

1. Copy it to `/config/www/mower/my-mower.jpg`.
2. Set **Background image** to `/local/mower/my-mower.jpg`.
3. Choose **Center**, **Left**, **Right**, **Top**, or **Bottom** under
   **Image focus**.

Do not put personal images inside the HACS card directory: HACS owns that folder
and can replace it during an update. Clear **Background image** to restore the
built-in artwork. If a custom image cannot be loaded, the card also falls back
to the built-in artwork automatically.

The equivalent optional YAML is:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.dreame_a2_bodzio
layout: hero
hero_image: /local/mower/my-mower.jpg
hero_image_position: right
```

### YAML (optional)

The Hero layout keeps the main controls and telemetry on one surface, then
switches the media area between overview artwork, mower map, 3D point cloud, and
live camera.
It preloads the map with a stable Home Assistant entity revision, avoiding a new
cache-busting request on every dashboard update. Live video still starts only
after you open Camera, so a dashboard view never opens an expensive mower video
session by itself. The card uses Home Assistant's standard camera player, which
prefers an available WebRTC provider and falls back to HLS. A snapshot stays
behind the player during startup, and leaving Camera keeps the same player warm
for 15 seconds so a quick return does not restart playback.

For compatible integrations, this minimal configuration is often enough:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.dreame_a2_bodzio
layout: hero
```

Use explicit companion entities when your entity names differ from the mower's
object id:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.dreame_a2_bodzio
name: Backyard mower
layout: hero
map_entity: camera.dreame_a2_bodzio_live_path_map
map_fit: cover
map_position: right
show_point_cloud: true
camera_entity: camera.ogrod_dreame_a2_bodzio_live_video
status_entity: sensor.dreame_a2_bodzio_state_name
battery_entity: sensor.dreame_a2_bodzio_battery
progress_entity: sensor.dreame_a2_bodzio_runtime_mission_progress
coverage_entity: sensor.dreame_a2_bodzio_current_cleaned_area
coverage_total_entity: sensor.dreame_a2_bodzio_runtime_total_area
```

Automatic companion discovery can fill most of these entities for compatible
integrations. Existing dashboards keep their current layout unless
`layout: hero` is selected.

The Hero action rail follows `show_default_actions` and
`show_helper_actions`. Extra configured tiles, custom actions, and advanced
planning panels remain available in the traditional layouts.

For the traditional map-and-controls layouts, the full configuration remains
available:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.dreame_a2_bodzio
name: Backyard mower
layout: wide
map_entity: camera.dreame_a2_bodzio_live_path_map
show_map: true
show_point_cloud: true
status_entity: sensor.dreame_a2_bodzio_state_name
battery_entity: sensor.dreame_a2_bodzio_battery
progress_entity: sensor.dreame_a2_bodzio_runtime_mission_progress
show_default_actions: true
show_helper_actions: true
show_advanced_details: false
actions:
  - type: more-info
    label: Details
tiles:
  - entity: binary_sensor.dreame_a2_bodzio_docked
    label: Docked
  - entity: binary_sensor.dreame_a2_bodzio_charging
    label: Charging
  - entity: sensor.dreame_a2_bodzio_error
    label: Error
```

## Card Options

- `entity`: required `lawn_mower` entity id
- `name`: optional card title override
- `locale`: optional language override: `auto` (default), `en`, `de`, `fr`,
  `it`, `pl`, `ru`, `uk`, or `es`. Automatic mode follows the Home Assistant user
  language, then the browser language, and safely falls back to English.
- `layout`: optional `default`, `compact`, `wide`, or `hero`
- `hero_image`: optional Hero overview background. Use an HTTPS URL or a
  `/local/...` path for a file stored under Home Assistant's `config/www`.
- `hero_image_position`: optional image focus: `center` (default), `left`,
  `right`, `top`, or `bottom`
- `map_entity`: optional camera entity for the mower map. If your integration
  exposes a live-path or runtime-overlay camera, prefer that over a static map
  camera so the card can show the current cut path. A local
  `point_cloud_api_path` attribute enables the 3D viewer.
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
- `summary_entities`: optional list of entities rendered as header summary chips
- `actions`: optional list of extra action chips
  - `type`: one of `start`, `pause`, `dock`, `more-info`, or `service`
  - `label`: optional button label override
  - `icon`: optional MDI icon override
  - `entity`: optional target entity for `type: more-info`
  - `service`: required for `type: service`, using `domain.service` format
  - `service_data`: optional service data payload for `type: service`
- `tiles`: optional list of extra stat tiles
  - `entity`: entity id
  - `label`: optional tile label override
  - `icon`: optional MDI icon override

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
When multiple mower cameras exist, the card now prefers a `live_path_map`
camera first so the main preview follows the currently cut area instead of only
the broader stored map.

## 3D Point Clouds

The Dreame Lawn Mower integration can advertise a local
`point_cloud_api_path` on its map camera. The card validates that the path
belongs to `/api/dreame_lawn_mower/point-cloud/`, asks Home Assistant to sign it
for 60 seconds, and parses the returned PCD in a worker before handing bounded
geometry to Three.js. The 3D renderer and Three.js stay compressed inside the
single HACS JavaScript resource and are decompressed only when 3D is first
opened.

The download is deliberately on demand:

- in Hero, select the **3D** tab
- in compact, default, or wide layouts, press **Load 3D map**
- use the viewer to orbit, pan, zoom, change point size, reset, or refresh
- press **PCD** to make a separate signed request for the original file; the
  viewer does not retain the large downloaded source buffer after parsing

An ordinary dashboard render does not generate or fetch garden geometry. The
card never receives the vendor cloud URL or transient object name; it sees only
the integration-owned Home Assistant path. The integration currently limits
this endpoint to Home Assistant administrators, so non-admin users receive an
access message instead of the point cloud.

The browser renders at most 750,000 points on ordinary devices and 300,000 on
devices that report 4 GB of memory or less. Larger supported PCDs are
deterministically sampled in the worker, keeping parsing away from the main
thread. Returning to the Hero 3D tab reuses the same scene and camera view
without downloading or parsing it again. Compatible integration versions also
serve the private response with an ETag and a five-minute revalidation window.

While the mower prepares a fresh file, the viewer shows elapsed time and the
integration's normal 45-second generation window. The browser stops a request
after 65 seconds so a broken connection cannot leave the card spinning
indefinitely. Newer integration versions return a privacy-safe problem code,
stage, duration, and retryability flag; the card presents those details with
the next useful action. Older versions still receive the HTTP-status fallback.

If generation repeatedly fails, retry once and then download the mower
integration diagnostics before restarting Home Assistant. Include the visible
`point_cloud_*` reference in the issue report. The card never displays or stores
vendor URLs, transient object names, or point coordinates as troubleshooting
data.

## Layout Modes

- `default`: balanced layout for most dashboards
- `compact`: tighter spacing for smaller grid cards
- `wide`: puts the map on the left and actions/stats on the right when space allows
- `hero`: image-led overview with live battery, mission, and coverage values;
  Overview, Map, 3D, and Camera views; and a compact primary action rail

With the Dreame integration, completed runtime mission and area values remain
available after docking. The Hero layout labels those values `Last mission` and
`Last coverage`, then switches back to live labels when the next mowing session
starts. Other integrations can opt into the same presentation by exposing
`cached: true` on their progress or coverage entity attributes.

## Header Summary

The card builds header summary chips from the best information it can find.

By default it will try to use:

- battery from the configured battery entity or mower attributes
- runtime mission progress
- current and total area coverage
- an active rain delay
- active error information

You can also add explicit `summary_entities` when you want tighter control over
what appears in the header.

## Smart Helper Actions

When `show_helper_actions` is enabled, the card will look for companion
entities that share the mower entity object id and expose helper chips when
they exist. This is especially useful with `homeassistant-dreamelawnmower`.

Current auto-detected helpers include:

- live-video camera
- schedule calendar
- live-path map camera
- all-maps camera
- the mower's configured maintenance-point action

Diagnostic probes remain available on the Home Assistant device page rather
than appearing as everyday card actions.

## Control Selectors

When compatible `select`, `number`, `switch`, or `time` entities exist, every
layout, including Hero, can render them as direct inline controls. This is
especially useful for Dreame and MOVA mower setups that expose entities such as:

- `select.my_mower_map`
- `select.my_mower_mowing_action`
- `select.my_mower_edge`
- `select.my_mower_zone`
- `select.my_mower_spot`
- `select.my_mower_maintenance_point`
- `select.my_mower_selected_map_preference_mode`
- `number.my_mower_selected_map_mowing_height`
- `number.my_mower_selected_zone_mowing_height`
- `select.my_mower_selected_mowing_efficiency`
- `select.my_mower_selected_mowing_direction_mode`
- `number.my_mower_selected_mowing_direction`
- `select.my_mower_selected_turning_method`
- `switch.my_mower_selected_edgemaster`
- `select.my_mower_selected_obstacle_height`
- `select.my_mower_selected_obstacle_distance`
- `switch.my_mower_selected_lidar_obstacle_recognition`
- `switch.my_mower_charging_period`
- `time.my_mower_charging_period_start`
- `time.my_mower_charging_period_end`
- `switch.my_mower_rain_protection`
- `select.my_mower_rain_delay`
- `switch.my_mower_lift_alarm`
- `switch.my_mower_off_map_alarm`
- `switch.my_mower_real_time_location`
- `switch.my_mower_pin_check_before_power_off`

If you do not set `control_entities`, the card will try to auto-detect these
companions from the mower object id. Home Assistant may add an area or device
prefix to configuration entities, and existing entity registries may retain
older Dreame names after an integration update. The card accepts both forms.

It always shows the map and mowing-action selectors when available, then shows
only the target selector relevant to the current action. For example, `All area`
hides the edge, zone, and spot fields; `Zone` shows the zone field. Cutting,
direction, turning, edge, and obstacle preferences are grouped into a compact
expandable panel that follows the integration's current `Global` or `Custom`
scope. Charging-window, rain-protection, and reported anti-theft entities are
grouped in a separate Device settings panel. The panel includes native time
pickers for the charging start and end and omits anti-theft controls the mower
does not expose. Time values with precision beyond browser-supported
milliseconds remain visible but read-only instead of being rounded. In global
mode the controls
update the selected map's global preference;
in custom mode they update the selected zone. An explicit `control_entities`
list is left unchanged.

The Dreame integration keeps the device-write behavior in its Home Assistant
entities. The card calls the standard `select.select_option`, `number.set_value`,
`switch.turn_on`/`turn_off`, `time.set_value`, and `button.press` services; it
does not encode mower protocol requests itself.

When the selected action is `Zone`, the card can replace the zone dropdown with
a checkbox list. Home Assistant must identify the mower as a
`dreame_lawn_mower` entity, publish
`dreame_lawn_mower.start_zone_mowing`, provide a
stable current-map identity, and expose `available_zone_ids` aligned with that
mower's zone selector. Choose one or more zones, then press `Start`; the
integration validates those IDs against the active map before sending the
mower-native request. The most recently checked zone remains the preference
scope for the controls below the selector. Other integrations and older Dreame
versions keep the original single-zone selector and standard start action.

## Planned Run Preview

When `show_advanced_details` is enabled and the mower exposes current selection
details, the card renders a `Planned Run` panel that summarizes:

- selected mowing action
- selected map
- selected map preference mode when the integration exposes it
- active map when it differs from the selected map
- the selected zone, spot, or edge target
- selected-zone mowing preferences such as height, efficiency, direction, and obstacle avoidance

For Dreame mower setups this helps confirm the scoped run before pressing the
main `Start` action. When the selected map is still in global preference mode,
the panel also warns that zone-specific mowing settings may not be active yet.

When available, the card reads these companion sensors directly:

- `sensor.my_mower_selected_zone_mowing_height`
- `sensor.my_mower_selected_zone_efficiency_mode`
- `sensor.my_mower_selected_zone_direction_mode`
- `sensor.my_mower_selected_zone_obstacle_avoidance`
- `sensor.my_mower_selected_zone_obstacle_distance`
- `sensor.my_mower_selected_zone_obstacle_height`
- `sensor.my_mower_selected_zone_obstacle_classes`

If some of those sensors are missing, the card can still fall back to the mower
entity's `selected_zone_preference` attributes when the integration exposes
them.

## Live Session Panel

When `show_advanced_details` is enabled and the card can see live-session
companions, it renders a `Live Session` panel that can summarize:

- runtime mission progress
- current and total area coverage
- current zone
- Bluetooth connectivity
- live runtime trail length, points, segments, heading, and position

If a map camera is configured, the panel also reads runtime overlay details
from the map entity attributes. If no map camera is configured, the panel still
shows the companion sensor and binary-sensor data it can resolve.

## Development

```bash
npm install
npm test
npm run check
npm run build
```

To verify the exact release payload locally:

```bash
npm run pack
```

For watch mode:

```bash
npm run dev
```

For a standalone browser preview with mocked mower data:

```bash
npm run preview
```

Then open:

```text
http://localhost:4173/
```

The preview page renders multiple layout presets inside a mocked Home Assistant
dashboard shell so spacing, summary chips, helper actions, and surrounding
context are easier to judge at a glance. It serves a small synthetic PCD
fixture—never real garden geometry—for testing the 3D tab and load controls. You
can switch mower states, toggle rain delay, and focus on a single layout preset
or compare all of them side by side.

## Releases

Merged pull requests drive releases. Add one release label before merging when
the default policy is not enough: `release:none`, `release:patch`,
`release:minor`, or `release:major`. PowerForge updates the package metadata,
runs the repository tests and type check, packages `lawn-mower-card.js`, and
publishes the matching GitHub release from the prepared version commit.

The Release workflow can also recover a merged pull request. Run it manually
with the pull request number and, when available, its merge commit SHA; leave
the increment on `auto` unless the original label decision must be overridden.

## Scope

This card still does not try to solve every mower workflow on day one. Interactive
map editing, no-go editing, and deeper integration-specific write paths should be
added only after the backend contracts are stable.
