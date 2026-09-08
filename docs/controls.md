# Controls and mowing context

[Back to the README](../README.md) · [Configuration](configuration.md)

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
list is left unchanged. Use `controls_mode: custom` to render only those
controls in list order, or `controls_mode: append` to put them ahead of discovered
controls. See [customization](customization.md) for all content modes.

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
