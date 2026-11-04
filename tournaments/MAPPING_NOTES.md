# Tournament mapping prototype — instant mapping (2026-10-19)

One master tournament can map to many provider tournaments, including multiple source IDs from one provider. Each provider/source pair has one effective association and independent change history. Add mapping stays available on master details.

Create/Edit mapping select a master from a searchable list, review the change and apply it on confirmation. Delete mapping soft-deletes only the selected provider association, retaining the master and other provider mappings. There is no draft, activation, deprecation or business version. Current mapping appears first in Mapping history; earlier mapping periods follow, without creation audit rows. Audit is retained internally.

Master tournament fields (name, sport, category, leading feed provider) remain separate from mapping changes. Leading feed provider is still set directly at tournament level. A master tournament cannot be deleted while effective provider mappings reference it.

Legacy schema-1 data migrates to schema 2 under the original storage key, retaining the master catalog, IDs, sequence, source sport/category context and effective associations. Original state is archived at multifeed:tournament-mapping-lifecycle:v1:before-soft-delete. Old drafts are never automatically applied. Archived mapping periods are retained as audit history.

Premier League demonstrates many provider mappings, including two ExeFeed IDs. SportRadar LaLiga has a mapping to LaLiga 2 that can be corrected immediately with Edit mapping. EFL Cup, Copa del Rey and Serbian Cup are unmapped sources.

Browser-only demo. Event tournament and competitor mapping fixtures remain separate and unchanged; this task does not integrate tournament projections into backend event processing. No backend code or Jira issues were changed.

Master-detail Add mapping (2026-10-20): Map opens a confirmation for the selected unmapped provider source and the current master. Confirming saves through the shared browser model and refreshes the overview in place; there is no navigation to provider mapping. Cancel does not save. Already mapped sources are excluded and source revision is checked again on confirmation. Manage mapping remains available on existing associations.

Category prerequisite (2026-10-20): provider tournaments retain stable providerCategoryId references to the shared Category administration state. Creating or editing a tournament mapping requires an effective category association to a nondeleted category, checked again when applying the change. Deleting an existing tournament association remains allowed. Missing/unreadable category state blocks writes. Older known fixtures receive explicit demo category IDs without rewriting their mappings or history.

SportRadar UEFA Champions League (sr:tournament:7) is added as an unmapped tournament under International (sr:category:39), initially unmapped in the category demo. The mapping screen explains the prerequisite and links to category mapping in the same tab; storage/focus changes refresh availability. Tournament Overview Add mapping enforces the same check. Existing event fixture mappings and backend code remain unchanged.

Category prerequisite return flow (2026-10-20): Map category carries the originating provider/tournament identity and optional preselected tournament target. Successful category Create/Edit returns to that tournament mapping; Cancel does not navigate or write. A Back to tournament mapping link allows an explicit return. The destination is constructed from identities using a fixed local route; arbitrary return URLs are not accepted.


Create tournament from provider (2026-10-20): unmapped provider rows and Manage mapping offer Create tournament. A shared dialog reviews source provider/ID, fixed sport and the effective mapped category, suggested editable name and an explicit leading feed provider (ExeFeed by default). Create and map saves a new tournament and only that source association together, then opens its overview with the source shown. Cancel/close/Escape do not save. Existing-name duplicates within the same sport/category, stale source/category changes, missing category mappings and unreadable saved data are rejected. Category gating is rechecked on confirmation. No draft or activation step is introduced.

Demo: Provider tournaments → SportRadar → Soccer → England → FA Cup (`sr:tournament:demo-fa-cup`, synthetic demo identity). It is present only as a provider source until confirmed. ExeFeed can remain the new tournament's leading feed although creation uses SportRadar. UEFA Champions League still demonstrates the category prerequisite; Map category returns to its mapping screen, where creation can then be opened. Created tournament, leading feed and association persist in the shared tournament browser state. Existing associations and event fixtures are unchanged; no backend integration is claimed.
