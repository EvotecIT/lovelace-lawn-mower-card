# Development

[Back to the README](../README.md) · [Integration compatibility](integration-compatibility.md)

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

## Media implementation and diagnostics

These details are for contributors investigating the viewer. For normal use,
see [maps, video, and 3D](media.md).

The Dreame Lawn Mower integration can advertise a local
`point_cloud_api_path` on its map camera. The card validates that the path
belongs to `/api/dreame_lawn_mower/point-cloud/`, asks Home Assistant to sign it
for 60 seconds, and parses the returned PCD in a worker before handing bounded
geometry to Three.js. The 3D renderer and Three.js stay compressed inside the
single HACS JavaScript resource and are decompressed only when 3D is first
opened.

The browser renders at most 750,000 points on ordinary devices and 300,000 on
devices that report 4 GB of memory or less. Larger supported PCDs are
deterministically sampled in the worker, keeping parsing away from the main
thread. For larger clouds, a spatially sampled preview appears first, then full
detail replaces it without resetting the camera. Returning to the Hero 3D tab
reuses the same scene and camera view
without downloading or parsing it again. Compatible integration versions also
serve the private response with an ETag and a five-minute revalidation window.

For performance troubleshooting, the viewer exposes `data-load-stage` and
`data-load-timings` on its element and emits a `lawn-mower-media-timing` event.
Timings cover authorization, response headers, download, preview rendering,
full-detail rendering, and parsing. Render milestones mean submission to the
graphics renderer, not a measurement of when pixels reached the display.
