# Sport mapping prototype — immediate save and soft delete

Sports, categories and tournaments use this simplified workflow. Create mapping and Edit mapping apply on Save mapping; Delete mapping soft-deletes the association after confirmation. There are no business phases, drafts, activation commands or business versions for sport mapping.

Each provider/source-sport pair has at most one undeleted mapping. Deletion leaves the observed provider sport and audit intact and immediately makes it Unmapped. Creating it again restores a valid association. Change history records previous/new master, operation, actor and time, independently of mapping state. Technical source revision rejects stale concurrent edits and is not shown to users.

One master sport can have many provider sport associations. Targets are not exclusive; mapping another provider sport to Soccer leaves its existing associations unchanged. Sport Overview lists all effective provider mappings, keeps Add mapping available even when mappings exist, and offers Manage mapping separately for each source. The provider picker lists unmapped sources; changing an already mapped source uses its own Manage mapping flow. This presentation correction was requested on 2026-10-20.

The observed-source projection deduplicates SportNotMappedEvent-style notifications by provider and sport ID. A late or repeated unmapped notification never deletes a valid association. Provider sports and the Unmapped filter derive status from current associations and update after administrative changes. This is a browser simulation, not a connected backend event subscription, tenant-isolated production projection or fixture reprocessing integration.

Existing browser state (schema 1) migrates to schema 2 under the existing sport storage key. The currently active mapping stays valid; latest deprecated mapping becomes soft-deleted. Old non-draft records are represented in audit history. Old draft data is never auto-activated and is retained in the original state backup at multifeed:sport-mapping-lifecycle:v1:before-soft-delete. Backup is created only once; original categories/tournament storage is untouched. This browser migration is not a backend storage migration.

Demo: ExeFeed Football is mapped, SportRadar Football (sr:sport:1) is also mapped to Soccer (1), and ExeFeed Tennis is unmapped. Save, edit, delete and recreate update provider lists and master sport details. No changes to event-demo correlations are implied.

Requested 2026-10-19 in Multifeed PM chat. Related Jira: HS-230. Backend source inspected before this change: dev 857f042c. Numeric sport IDs beyond Soccer/Basketball remain demo catalog entries.

Master-detail Add mapping (2026-10-20): Map opens a confirmation for the selected unmapped provider source and the current master. Confirming saves through the shared browser model and refreshes the overview in place; there is no navigation to provider mapping. Cancel does not save. Already mapped sources are excluded and source revision is checked again on confirmation. Manage mapping remains available on existing associations.

Default correction (2026-10-20): untouched persisted SportRadar Football demo mappings to Basketball are corrected to Soccer with an audit entry. Operator-edited or deleted associations remain unchanged.

Additional demo mappings (2026-10-20): ExeFeed and SportRadar Basketball → Basketball (2); ExeFeed Tennis → Tennis (3); ExeFeed and SportGenius Ice Hockey → Ice Hockey (4). Untouched saved seed sources are initialized once; operator-modified/deleted sources are preserved. Sport lists and overviews read the shared catalog, so Soccer uses SOC and Basketball uses BKB consistently (three-letter prototype abbreviations requested on 2026-10-20).
