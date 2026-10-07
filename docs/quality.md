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
| Cleanup | Removal and hiding stop owned streams, timers, workers, observers, and GPU resources; reopening works. | Measure repeated attach/detach and tab transitions in the browser. Unit tests alone do not prove retained-resource behaviour. |
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
