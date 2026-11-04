# Create competitor from a provider source

Prototype proposal, 20 October 2026. Browser data only; no backend commands or leading-feed configuration are changed.

## Demo

Open Competitor Workspace → Provider Competitors → SportRadar → Soccer → Team. Newcastle United (`sr:competitor:demo-newcastle`, a synthetic demo ID) is initially unmapped and has no corresponding competitor.

- **Create competitor** is available on an unmapped provider row and inside its Map dialog.
- Review the source provider/ID and the fixed sport/type. Edit the suggested name if needed.
- **Create and map** saves one competitor and one association together, then opens its overview. The overview shows the originating provider and source ID. The competitor is available in subsequent mapping selections.
- **Map to existing competitor** opens the compatible competitor selection instead.
- Cancel, close, outside click and Escape make no changes. Confirmation is required to save. Data survives reload in this browser.

SportRadar Liverpool demonstrates exact-name duplicate detection: creation is rejected and the operator can select the existing Liverpool instead. Names alone do not establish identity; this check only protects against an obvious duplicate within the same sport/type. Composite creation requires resolved individual member IDs; no members are invented.

## Boundaries

Manual creation is independent of tournament leading-feed selection. Only the selected provider source is associated; no other provider competitor or event link is automatically changed. Existing competitors and provider associations are retained. A revision check rejects stale saves and an already mapped source cannot be used for creation. Browser storage errors leave the previous saved state intact.

The active workspace is `competitor.html`. Legacy standalone create/map/view pages are separate demonstrations. The new workspace store is `multifeed:competitor-workspace:v1`; no server or tenant isolation is implied by this local demonstration. Existing workspace edit-name and mapping actions now save through this same store.
