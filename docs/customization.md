# Customize the card

[Configuration](configuration.md) · [All options](options.md)

Header summary chips, extra tiles, controls, and custom actions work in every
layout, including Hero Cinematic and Hero Dashboard. Configure them in the
visual editor and use the up/down buttons to change their order. Switching
layouts keeps your configured items.

## Choose automatic or custom content

The **Content selection** field appears under Controls and Header summary chips.

| Editor choice | YAML value | Behavior |
| --- | --- | --- |
| Existing layout default | Omit the mode | Keeps the previous layout behavior described below. |
| Automatic | `auto` | Uses discovered content and ignores the configured list. |
| Custom plus automatic | `append` | Places configured items first, then adds automatic content. |
| Custom only | `custom` | Uses only the configured list; an empty list shows nothing. |
| Hidden | `hidden` | Hides that content without deleting its settings. |

Use `controls_mode` for controls and `summary_mode` for chips. In explicit Custom
only mode, controls appear in list order, including settings that automatic
discovery would group into expandable panels. Custom plus automatic also keeps
configured controls together, followed by discovered controls and settings.

When modes are omitted, controls use a nonempty `control_entities` list or fall
back to discovery. Existing schedule discovery and settings groups stay in
place. Hero shows configured summary chips; it adds no automatic chips unless
you select Automatic or Custom plus automatic. Traditional layouts retain their
automatic summary behavior. Explicit chips are no longer limited to four;
long lists wrap onto additional lines.

## Add chips and tiles

Select a Home Assistant entity, then optionally change its label and MDI icon.
Under **Value and visibility**, choose an attribute instead of the state, set a
unit, or show an unavailable placeholder. By default, missing or unavailable
entities are hidden. An attribute must be a scalar value, such as a number,
string, or boolean; objects and lists are treated as unavailable.

The same entity options work in `summary_entities` and `tiles`. Existing plain
entity strings in `summary_entities` remain supported.

```yaml
type: custom:lawn-mower-card
entity: lawn_mower.my_mower
layout: hero
summary_mode: custom
summary_entities:
  - entity: sensor.garden_temperature
    label: Garden
    icon: mdi:thermometer
tiles:
  - entity: sensor.my_mower_blade_life
    label: Blade life
    icon: mdi:content-cut
    show_unavailable: true
  - entity: sensor.my_mower_blade_life
    attribute: remaining_hours
    unit: h
    label: Until blade change
```

Replace example entity IDs and attributes with ones your Home Assistant instance
actually exposes. Attribute values do not inherit the entity state's unit; use
`unit` when an attribute needs a suffix. YAML `unit: ""` removes the state unit.

## Show content conditionally

Chips, tiles, and custom actions accept a `visibility` condition. It compares a
Home Assistant entity's raw state, so use values such as `on` or `mowing`, rather
than their translated dashboard labels. Missing, unknown, and unavailable
condition entities hide the item. Leave the condition entity empty in the
editor to remove the condition.

```yaml
summary_entities:
  - entity: binary_sensor.garden_rain
    label: Rain detected
    icon: mdi:weather-rainy
    visibility:
      entity: binary_sensor.garden_rain
      state: "on"
```

Use a Home Assistant template entity for more complex conditions or calculated
values. Conditions control presentation; they do not replace authorization or
device protections in Home Assistant and the mower integration.

## Add custom actions

Use the existing `start`, `pause`, `dock`, `more-info`, or `service` action types.
Built-in mower action types retain their normal state and capability checks.
Service actions can call Home Assistant scripts for routines involving several
steps. Set their targets explicitly in `service_data`.

An optional `confirmation` message opens a confirmation panel inside the card.
Cancel or Escape closes it without sending a command. The card rechecks the
action's current configuration, visibility, and availability before dispatch.

```yaml
actions:
  - type: service
    label: Evening routine
    icon: mdi:weather-night
    service: script.turn_on
    service_data:
      entity_id: script.mower_evening
    confirmation: Run the evening routine?
  - type: more-info
    entity: sensor.my_mower_blade_life
    label: Blade details
    icon: mdi:information-outline
```

The editor accepts service data as a JSON object and keeps incomplete or invalid
JSON out of the saved configuration.

## Arrange Hero content

Under **Content appearance**, select spacing, tile columns, and either the
original Hero colors or the Home Assistant theme. The photographic overview
keeps its dark overlay for legibility. On narrow cards, tile grids use at most
two columns and actions wrap.

Choose which extra sections appear and move them with the up/down buttons.
Explicit section ordering places those sections below the primary actions.
The header, media, view tabs, and primary mower actions keep their positions.
Without an explicit order, controls retain their original location before the
Cinematic action rail, and extra tiles/actions follow the rail. Dashboard keeps
its primary actions beside the media. **Restore section defaults** restores this
arrangement.

```yaml
layout: hero
hero_layout: dashboard
hero_theme: auto
hero_density: compact
tile_columns: 3
hero_sections:
  - tiles
  - actions
  - controls
  - details
```

Omit a section to hide it while keeping its configuration. An empty
`hero_sections: []` hides all four extra sections. The `details` section also
requires `show_advanced_details: true` and compatible telemetry. These placement
options apply to both Hero compositions; they do not rearrange traditional
layouts.
