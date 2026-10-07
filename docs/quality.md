# Card quality qualification

This card targets the Evotec Platinum card standard. Qualification is incomplete.
The Home Assistant Integration Quality Scale applies to backend integrations;
it does not award this card a tier. A passing source build is one evidence layer.

## Acceptance ledger

| Area | Acceptance | Current evidence and remaining work |
| --- | --- | --- |
| Installation | HACS and manual installation load the complete resource without missing assets. | Packaging produces one JavaScript resource with embedded media/3D assets. Install and inspect a published release in HA. |
| Updates | Existing card configuration and entity bindings survive upgrades. | Validate previous-to-current released artifacts on a saved HA dashboard. |
| Configuration | YAML and visual editor preserve supported settings and reject invalid input with actionable errors. | Configuration tests and synthetic editor preview exist. Complete actual HA save/reopen and invalid-input scenarios. |
| Host compatibility | Sections, masonry, edit mode, dialogs, and companion webviews work in the declared HA range. | Synthetic fixtures exercise host-like elements; actual HA and cross-browser proof remain open. |
| Layout | Narrow, wide, short landscape, zoomed, dense, and long-label states retain usable controls. | Preview supplies multiple layouts and widths. Complete the browser matrix below with screenshots. |
| Accessibility | Keyboard, touch, focus, screen-reader names, contrast, reduced motion, and non-color status cues remain usable. | Map keyboard labels and named controls exist. Automated accessibility checks and manual focus/contrast proof remain open. |
| Data states | Loading, missing entities, unavailable devices, unsupported capabilities, partial failure, and stale responses have distinct outcomes. | State/capability tests exist. Verify rendered transitions and recovery. |
| Actions | Requests respect capability and availability checks, prevent duplicate mutation, and show useful failures. | Mutation-lock, action-error, schedule, and control tests exist. Synthetic browser checks cover confirmation cancellation/success, disabled mutation controls while a response is pending, delayed failure with focus restoration, successful retry, and a standard Pause action/state update. Actual HA and approved live-action proof remain open. |
| Media | Map, camera, and 3D load only when needed, handle errors, and retain safe resource bounds. | Worker, preview, media timing, and presentation tests exist. Verify actual browser worker/WebGL/video lifecycle and integration versions. |
| Cleanup | Removal and hiding stop owned streams, timers, workers, observers, and GPU resources; reopening works. | Packaged overview checks cover 20 attach/detach cycles each for Traditional and Hero: the tracked visibility observer, listener, and timeout return to zero after each removal. Media transitions, workers, streams, GPU resources, and heap retention remain unqualified. |
| Performance | Bounded unrelated-HA-update work, requests, geometry, memory, and cold/warm rendering costs. | Update-scope and point-cloud tests exist; rendering limits are documented. Establish measured device/browser budgets before enforcing them. |
| Types and tests | Strict production TypeScript checking plus meaningful contract and browser tests. | `npm run check` and Node contract suite pass. Browser/editor coverage is incomplete; report the tested denominator. |
| Security and privacy | Treat entity/configuration values as untrusted; constrain resource URLs and inputs; avoid secret retention and unsafe HTML. | Resource and action validation have source tests. Inspect network behaviour and packaged dependency boundaries. |
| Localization and themes | Supported locale labels, formatting, theme colours, and long text remain readable. | Locale tests and light/dark previews exist. Complete rendered language/theme/contrast combinations. |
| Delivery and documentation | Reproducible locked build, source/resource parity, accurate instructions, and release-scoped evidence. | CI rebuilds and rejects a changed committed resource. Published artifact, installation, and upgrade qualification remain open. |

## Reproduce source and artifact checks

Use Node.js 24, matching CI:

```sh
npm ci
npm test
npm run check
npm run pack
git diff --exit-code -- lawn-mower-card.js
```

The final check prevents source updates from leaving the HACS resource stale.
Commit the regenerated resource with its source changes. `release/` is packer
output; its existence does not establish publication or installation.

## Browser matrix

Use the synthetic [development preview](development.md) before checks in HA.

- [ ] Traditional, Compact, Wide, Hero Cinematic, and Hero Dashboard layouts.
- [ ] 320/390-pixel cards, wide desktop, short landscape, 200% zoom, and long labels.
- [ ] Light/dark/custom themes and supported languages, with measured contrast.
- [ ] Editor changes, save/reopen, YAML round trip, invalid input, and entity replacement.
- [ ] Available/unavailable/missing data, rain, mutation pending/failure, and recovery.
- [ ] Map keyboard/pointer controls, camera start/stop, and 3D preview/full-detail/error states.
- [ ] Dialog focus containment/restoration, Escape, keyboard-only actions, and touch targets.
- [ ] Repeated card removal/recreation and media switches, with resource/network evidence.
- [ ] Actual HA layouts/editor and supported browser engines/companion apps.

Keep reusable browser installation and session management in HtmlTinkerX;
card-specific fixtures and assertions belong here. Record version, commit,
artifact identity, HA/browser versions, viewport, scenario, and result for each
qualification run. Synthetic preview results do not establish physical mower
behaviour or installed HA compatibility.

## Repeatable custom-action confirmation check

Open `/demo/customization.html` in the local preview and activate **Evening
routine** with Enter. Cancel receives focus. Escape closes the inline
confirmation, returns focus to Evening routine, and leaves the simulated action
count unchanged. Reopen, Tab to Confirm action, and press Enter: the preview
reports one `script.turn_on` call and returns focus to the trigger.

Use `/demo/customization.html?action=error` to exercise a rejected service call.
After confirmation, the card displays the simulated connection failure, restores
trigger focus, and allows the confirmation to reopen. Repeat with **Narrow ·
320 px** to inspect the wrapped error and usable Cancel/Confirm controls.

Use `/demo/customization.html?action=pending` to hold synthetic service responses.
Confirm Evening routine and check that its button, Pause, Dock, selection and
switch controls cannot issue another mutation while the request is pending. The
preview displays the number of service calls received. Choose **Fail pending
action**, verify the error and restored controls, then retry and choose **Complete
pending action**. A standard Pause action also waits for completion before the
simulated mower changes state. The response buttons affect only the local fixture.

These are inline confirmations, not modal dialogs; surrounding non-mutation
controls remain available. The preview has no device connection. This evidence
does not establish actual HA webview compatibility or physical actions.


## Packaged overview lifecycle evidence

On 2026-10-07, the committed resource at source commit
`6427f8f9d7eb7350278c241cc1c3758c64f7a317` was exercised in Chromium 154
on Windows at 1280 x 720. Its SHA-256 was
`E55CCB4F9FA04E63939AD9F34D98516A3DE036C4165EF25849E9681CEE8CAAC1`.

The synthetic customization preview supplied the HA state. A separate card used
`lawn_mower.demo`, with map, point cloud, and camera disabled. Each of Traditional
and Hero was attached and removed 20 times, reusing the same card within that
layout. Every attachment rendered the configured name. Instrumented browser APIs
reported one active IntersectionObserver, one document visibility listener, and
one pending timeout while attached; all three counts returned to zero after every
removal. The test waited for the Lit update and browser callbacks between steps.
Browser warnings and errors were empty.

To repeat, serve the committed resource with `node server.mjs`, open
`/demo/customization.html`, and instrument observer observe/disconnect,
visibilitychange listener registration/removal, and timeout creation, firing, and
cancellation around newly created card instances. Exclude the pre-existing
preview card and the measurement delays from counts. Restore the original APIs
and remove the synthetic instances when finished.

This verifies the measured overview resources and reattachment in the synthetic
preview. It does not establish garbage collection, mutation subscription counts,
media stream or worker shutdown, GPU release, tab hiding, actual HA installation,
or other browser engines. Those acceptance gates remain open.


## Packaged map lifecycle evidence

The same resource identified above was checked on 2026-10-07 in Chromium 154
on Windows at 1280 x 720. A separate `lawn-mower-mowing-map` element used a
synthetic 32 x 32 PNG and a valid scene delivered through local data URLs.
This exercised browser fetching, PNG decoding, rendering, and object URL ownership
without an HA connection or mower commands.

Across 20 load/remove cycles on the same element, each load rendered an SVG image
and owned one ResizeObserver, two timeouts, and one image object URL. All tracked
counts returned to zero after every removal. There were 40 synthetic signing
calls: one scene and one background per attachment. Measurement delays and
pre-existing preview resources were excluded from the counters.

Two additional checks held the signing response or fetch response pending while
the element was removed. Releasing a late signing response caused no URL resolution
or fetch. Removal aborted the pending fetch signal; a late response did not render
an image or start another signing request. The simulated fetch honored the abort
signal, so this establishes the cancellation contract rather than real network
transport behavior. Browser warnings and errors were empty.

To repeat, instrument ResizeObserver observe/disconnect, timeout creation/firing/
cancellation, and object URL creation/revocation around the separate map element.
Supply `path`, `active`, and a synthetic `hass` with `callWS` and `hassUrl`; wait for
the rendered SVG image before measuring the loaded state. For cancellation, hold
`callWS` or an abort-aware fetch at its boundary, remove the element, then release
the held response and inspect calls and rendered state. Restore all instrumented
APIs and remove the test element afterward.

These checks do not qualify long-running polling, real HA signed endpoints,
background-tab behavior, camera streams, 3D workers/GPU resources, or heap retention.


## Packaged 3D lifecycle evidence

The same resource identified above was checked on 2026-10-07 in Chromium 154
on Windows. The 3D tab in `/demo/index.html` loaded the embedded viewer module;
the synthetic 120,000-point fixture rendered visibly and produced no browser
warnings or errors in the completed-load check.

A separate `lawn-mower-point-cloud` element used the preview server's
`/api/dreame_lawn_mower/point-cloud/demo-entry/0` route. It was loaded and removed
three times, reusing the same element. Each cycle created one parser worker,
which terminated on completion. The loaded viewer owned one ResizeObserver and
one live WebGL context, with no remaining tracked object URLs. After each removal,
the observer count was zero and the recorded context reported `isContextLost()`.
No tracked workers or object URLs remained.

A separate cancellation check removed the element in a microtask immediately
after the parser worker received its input. One worker was created and terminated;
no worker or rendered canvas remained after removal. This checks cleanup with
parser work pending, without relying on how fast a particular machine parses.

To repeat, activate the preview's 3D tab to load the packaged module. Create a
separate viewer with `active` and `autoLoad` enabled, the fixture path above,
and synthetic HA signing that returns the requested local path. Instrument Worker
construction/termination, ResizeObserver observe/disconnect, object URL creation/
revocation, and canvas WebGL context creation. Wait for a rendered canvas and
worker completion before recording loaded counts, then remove and inspect the
recorded contexts. Restore instrumented APIs and remove the viewer afterward.

These checks establish the observed browser resource lifecycle for this fixture.
They do not measure physical GPU memory reclamation, JavaScript heap retention,
large-cloud performance, camera streams, background-tab behavior, or other browser
engines and devices.
