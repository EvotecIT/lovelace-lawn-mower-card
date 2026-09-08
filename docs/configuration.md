# Configuration

[Back to the README](../README.md) · [All card options](options.md) · [Controls](controls.md)

## Visual editor (recommended)

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

## Dashboard composition

In the visual editor, choose **Hero → Hero appearance → Composition → Dashboard**
for a map/media panel beside an on-demand camera and mission totals. On narrow
cards, the panels stack vertically. The existing cinematic composition remains
the default.

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
layout: hero
hero_layout: dashboard
```

Opening the camera keeps the map visible when one is available. Video still
starts only when selected; closing the camera uses the same short reconnection
grace period as the cinematic layout. Mission totals come from the mower, and
the map route shows observed movement—not an inferred cut-area mask.

## Custom Hero background

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
entity: lawn_mower.my_mower
layout: hero
hero_image: /local/mower/my-mower.jpg
hero_image_position: right
```

## YAML (optional)

The Hero layout keeps mower controls and telemetry together while you choose
Overview, Map, 3D, or Camera. See [maps and video](media.md) for playback behavior
and troubleshooting.

For compatible integrations, this minimal configuration is often enough:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
layout: hero
```

Use explicit companion entities when your entity names differ from the mower's
object id:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
name: Backyard mower
layout: hero
map_entity: camera.my_mower_map
map_fit: cover
map_position: right
show_point_cloud: true
camera_entity: camera.my_mower_live_video
status_entity: sensor.my_mower_state_name
battery_entity: sensor.my_mower_battery
progress_entity: sensor.my_mower_runtime_mission_progress
coverage_entity: sensor.my_mower_current_cleaned_area
coverage_total_entity: sensor.my_mower_runtime_total_area
```

Automatic companion discovery can fill most of these entities for compatible
integrations. Existing dashboards keep their current layout unless
`layout: hero` is selected.

The Hero action rail follows `show_default_actions` and
`show_helper_actions`. Both Hero compositions also support configured summary
chips, extra tiles, custom actions, and advanced planning panels. See
[customization](customization.md) for content modes, ordering, visibility, and
appearance settings.

For the traditional map-and-controls layouts, the full configuration remains
available:

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
name: Backyard mower
layout: wide
map_entity: camera.my_mower_map
show_map: true
show_point_cloud: true
status_entity: sensor.my_mower_state_name
battery_entity: sensor.my_mower_battery
progress_entity: sensor.my_mower_runtime_mission_progress
show_default_actions: true
show_helper_actions: true
show_advanced_details: false
actions:
  - type: more-info
    label: Details
tiles:
  - entity: binary_sensor.my_mower_docked
    label: Docked
  - entity: binary_sensor.my_mower_charging
    label: Charging
  - entity: sensor.my_mower_error
    label: Error
```

## Layout Modes

- `default`: balanced layout for most dashboards
- `compact`: tighter spacing for smaller grid cards
- `wide`: puts the map on the left and actions/stats on the right when space allows
- `hero`: image-led overview with live battery, mission, and coverage values;
  Overview, Map, 3D, and Camera views; and a compact primary action rail

The older `wide` preset uses a browser-width breakpoint. Use `hero`, `default`,
or `compact` in narrow columns on a wide desktop dashboard until its
container-resizing limitation is addressed.

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
