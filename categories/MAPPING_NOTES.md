# Category mapping prototype — immediate mapping (2026-10-19)

One master category maps to many provider categories, including different category IDs from the same provider. Each provider category has its own association, revision guard and history. Add mapping remains available on master category details, including when mappings already exist. There is no target exclusivity.

Create mapping and Edit mapping use a searchable master list and review/confirmation. Confirming applies the change immediately. Delete mapping soft-deletes only the selected provider association; it retains the master category, the source identity and all other provider associations. No draft, activation, deprecation or business version remains for categories. Tournaments now also use instant mapping after confirmation.

The compact mapping page shows one provider-to-master summary and only prior mapping periods, without creation audit rows. Full audit is retained internally. Category create/rename/delete functionality is preserved: names remain unique among nondeleted master categories; a master cannot be deleted while any valid mapping references it. Codes are retained after soft deletion and never reused.

Existing schema-1 browser data migrates to schema 2 under the same storage key. Previously active mappings remain valid, deprecated mappings stay deleted, and old draft data is archived in multifeed:category-mapping-lifecycle:v1:before-soft-delete without being automatically applied. Original category names, codes, deletion status, sequence and source identities are preserved. The backup is not a backend migration.

Event views read effective sport/category associations from shared browser state. This is a browser-only demonstration without backend integration or automatic event unlinking. This category change is user-authorized prototype work; HS-230 originally scoped the equivalent refactor to sports only.

Master-detail Add mapping (2026-10-20): Map opens a confirmation for the selected unmapped provider source and the current master. Confirming saves through the shared browser model and refreshes the overview in place; there is no navigation to provider mapping. Cancel does not save. Already mapped sources are excluded and source revision is checked again on confirmation. Manage mapping remains available on existing associations.
