# Integration compatibility

[Back to the README](../README.md)

## Home Assistant versions

The supported minimum is **Home Assistant 2025.1.0**. Marketplace and HACS read
this requirement from `hacs.json`. Earlier versions are outside the supported
range; this baseline does not identify the earliest version that could load the card.

The published v0.2.43 resource was checked in isolated Home Assistant instances
on 29 October 2026 using Chromium on Windows:

| Home Assistant Core | Frontend | Result |
| --- | --- | --- |
| 2025.1.0 | 20250103.0 | Supported baseline |
| 2026.10.4 | 20260930.5 | Current stable host check |

Both hosts loaded Default, Compact, Wide, Hero, Tile, and Hero Dashboard layouts,
plus a Tile card in a Sections view. The visual editor saved a title change and
restored it when reopened. Start, Pause, and Dock used Home Assistant's service
API and updated a standard in-memory `lawn_mower` entity with all three supported
actions. No physical mower was connected.

These checks cover resource loading, generic mower controls, layouts, and basic
editor persistence. They do not qualify every intermediate HA release, browser
engine, companion app, optional integration feature, or physical device. Maps,
video, 3D, schedules, and history still depend on their integration and browser
requirements. See the [quality ledger](quality.md) for remaining qualification.

## Mower integrations

Any integration that exposes a standard Home Assistant `lawn_mower` entity can
use the card. Start, pause, and dock buttons follow the entity's standard
`supported_features` bitmask, so read-only or partially controllable mowers do
not show actions that Home Assistant will reject. A **Stop** button appears
while mowing or paused when the integration advertises Home Assistant's Stop
feature, such as Ecovacs; an entity without the bitmask doesn't get it. Dreame
mowers keep their own **Cancel task** instead.

Optional UI follows optional entities:

| Integration surface | Card behavior |
| --- | --- |
| `lawn_mower` only | State, available standard actions, and Hero Overview; the redundant one-item view bar is hidden |
| map camera | Adds Map |
| map camera with `point_cloud_api_path` | Adds 3D |
| live-video camera | Adds Camera |
| related sensors, calendars, selects, switches, and buttons | Adds the matching summaries, schedules, controls, and helpers |
| Dreame mower plus `dreame_lawn_mower.cancel_current_task` | Adds a confirmed **Cancel task** action while keeping Pause and Dock separate |
| same-device Last Mower Notification sensor with a `recent` array | Adds a collapsed condition history with observation time and active, cleared, or unknown state |
| same-device lifetime counters (`total_mowed_area`, `total_mowing_time` or Husqvarna's `total_cutting_time`, `total_mowing_sessions`) with `state_class: total_increasing` or `total` | Adds a season panel to History: this year's totals and one bar per month, with last year behind it, from Home Assistant's long-term statistics. A mower without task history gets a History tab with just the season |

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
