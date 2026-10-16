# Category mapping prototype

One master category maps to many provider categories, including different category IDs from the same provider. Each provider category has at most one active mapping and one draft. Targets are not exclusive. Category details therefore keep Add mapping available even when mappings already exist.

Draft → Active → Deprecated. Six actions match the sport demo: create draft, edit draft, create replacement, activate, deactivate, delete draft. Replacement creation preserves the active mapping; activation closes the previous version. Versions start at zero on activation; history remains available. Only drafts can be deleted. Deactivation preserves any draft.

Deleting a master category is soft deletion and is blocked by active mappings only. Drafts targeting a deleted category can be edited or deleted but cannot activate. Numeric category IDs shown here are demo business codes; this browser-only prototype does not implement backend UUID allocation or tenant isolation.

Reference: HS-216 requirements and design on feature/HS-216-category-mapping-administration, revision 9a23a337 (specification, not backend implementation).

Demo: England has several provider categories including ExeFeed England and England Youth; SportRadar Spain has an active mapping to Germany plus a correction draft to Spain and retained history; SportRadar International and Europe are unmapped.

State is saved in localStorage under multifeed:category-mapping-lifecycle:v1, separately from sport mappings. No backend calls.
