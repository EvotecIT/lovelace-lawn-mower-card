# Troubleshooting a card-name conflict

[Back to the README](../README.md) · [Card options](options.md)

## Why another Lawn Mower Card conflicts

Several Home Assistant cards use the same dashboard type:

```yaml
type: custom:lawn-mower-card
```

This includes [`cociweb/lawn-mower-card`](https://github.com/cociweb/lawn-mower-card),
older versions and forks based on
[`bhuebschen/lawn-mower-card`](https://github.com/bhuebschen/lawn-mower-card),
and this project. They register the same `lawn-mower-card` browser element. A
browser page can register that name only once, so the resources must not be
loaded together.

Changing an npm `package.json` name or the name shown by HACS does not resolve
the conflict. The browser element and `custom:lawn-mower-card` type are the
runtime identity.

## Can I try this card and then go back?

Yes. Installing or uninstalling a dashboard card changes its JavaScript
resource; it does not remove saved card entries from a Home Assistant dashboard.
If you do not edit or delete the existing `custom:lawn-mower-card` entries during
the trial, reinstalling the old card makes those entries use their original
configuration again.

Four mowers normally mean four saved card entries. They are part of the
dashboard configuration, not data stored privately by the old card:

```yaml
- type: custom:lawn-mower-card
  entity: lawn_mower.backyard
- type: custom:lawn-mower-card
  entity: lawn_mower.frontyard
- type: custom:lawn-mower-card
  entity: lawn_mower.side
- type: custom:lawn-mower-card
  entity: lawn_mower.other
```

Use this procedure for a reversible test:

1. Note the exact GitHub repository used for the currently installed card. You
   will need that repository, not merely its shared **Lawn Mower Card** name, if
   you decide to reinstall it.
2. Do not delete the existing mower cards from any dashboard.
3. Uninstall the old card in HACS. Open **Edit dashboard → Manage resources** and
   verify that its JavaScript resource is gone.
4. Close every Home Assistant browser tab and app window, then reopen Home
   Assistant. The existing cards may temporarily show **Custom element doesn't
   exist**; this is expected while no card resource is installed.
5. Install this project and verify that only its resource is present. Its normal
   HACS URL contains `/hacsfiles/lovelace-lawn-mower-card/`.
6. Close every Home Assistant browser tab and app window, then reopen Home
   Assistant. This starts a new browser page without the old element
   registration.
7. Do not edit or save the existing mower card entries with this project's
   editor. Their older option schema may look different or produce a
   configuration error, but that does not alter the saved configuration.
8. Add a separate temporary card to test this project. Start with:

   ```yaml
   type: custom:lawn-mower-card
   entity: lawn_mower.my_mower
   ```

9. If you want to go back, remove the temporary test card and uninstall this
   project. Verify under **Manage resources** that its resource is gone.
10. Close all Home Assistant tabs and app windows, then reopen Home Assistant.
11. Reinstall the exact old repository noted in step 1 and verify that only its
    resource is present.
12. Close all Home Assistant tabs and app windows once more, then reopen Home
    Assistant.

The original cards should render with their original configuration. No
configuration conversion or restore is required because the entries were never
changed.

In a YAML-mode dashboard, resources may be declared in YAML instead of under
**Manage resources**. Remove and restore the resource declaration in the same
place where it was originally added. For a manual installation, make sure that
only the intended script is served from `/local/lawn-mower-card.js`.

## What can go wrong during the test?

The resource switch can cause a temporary display or loading problem, but it
should not erase the dashboard configuration.

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| Duplicate custom-element or `CustomElementRegistry` error in the browser console | Both projects loaded in the same browser page. | Remove the unwanted resource, close all Home Assistant tabs and app windows, then reopen Home Assistant. |
| `Custom element doesn't exist: lawn-mower-card` | No working resource registered the card, or its JavaScript failed while loading. | Check that exactly one intended resource exists and that its URL is available, then reopen Home Assistant. |
| The wrong card design appears | The previous module is still registered in the open page or cached. | Close every Home Assistant page and reopen it. If needed, hard-refresh or reset the frontend cache. |
| Existing cards are blank or show a configuration error with this project | The saved entries use options from another card with the same type. | Leave those entries unchanged. Use a separate minimal test card, or reinstall the old resource. |

Home Assistant's
[frontend cache troubleshooting](https://www.home-assistant.io/faq/#the-home-assistant-user-interface-is-acting-weird)
lists browser-specific hard-refresh and cache-reset steps.
