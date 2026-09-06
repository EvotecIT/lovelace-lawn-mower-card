# Integration compatibility

[Back to the README](../README.md)

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
