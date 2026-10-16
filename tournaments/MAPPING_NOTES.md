# Tournament mapping prototype

One master tournament can map to many provider tournaments, including several source IDs from the same provider. Each source (provider plus provider tournament ID) has an independent active mapping, draft, version sequence and retained history. Add mapping remains available on master tournament details.

The prototype follows the category demo lifecycle: create draft, edit draft, create replacement, activate, deactivate, delete draft. Drafts are versionless; first activation is version zero and later activations increment the source's highest activated version. Activation closes the prior active mapping at the same instant; explicit deactivation preserves a pending draft. Only drafts can be deleted. All six actions persist locally, separately from sports and categories.

Master tournament fields (sport, category, name and leading feed provider) are maintained separately from mapping versions. Leading feed is selected directly on the master tournament. No inheritance option. Soft deletion is blocked by active mappings; history and drafts remain, but deleted targets cannot activate.

Demo: Premier League has multiple provider sources, including two ExeFeed IDs. SportRadar LaLiga has an active mapping to LaLiga 2, a correction draft to LaLiga, and retained history. ExeFeed EFL Cup and Copa del Rey and SportGenius Serbian Cup are unmapped examples. No explanatory one-to-many banners are shown in the UI.

This browser-only implementation is based on the user's requested prototype behavior, not a claim of backend tournament administration support. State key: multifeed:tournament-mapping-lifecycle:v1. No backend calls. Event demo state is separate and is not changed by this prototype's administration actions.
