# US AI Atlas

**AI Governance at a Glance** is an interactive US map and searchable library of selected legislation and regulations relevant to AI. The collection has 131 entries across all 50 states, including 35 New York entries: 30 state-level entries and 5 New York City entries.

Public website: https://grainneinez.github.io/US-AI-Atlas/

## Current interface

- Select a state using the map or state selector. New York opens by default.
- Browse individual laws with summaries, references, status, timing and sources.
- Filter by keyword, topic, status and statewide/local jurisdiction.
- Expand scope, duties, enforcement and limitations where researched.
- Read linked code sections and separately labeled practical implementation notes inside expanded law entries. Search and CSV export include both fields.
- Copy a state link or export the filtered records as CSV.
- Use keyboard navigation and direct links such as `?state=NY#regulations`.

The October 30, 2026 revision removes supplementary navigation, audience and activity questionnaires, practical guides, checklists, updates feeds and court-case displays. Standalone agency guidance and institutional policy entries are excluded from this edition. Related guidance can remain a clearly labeled supporting source for a binding statute or regulation.

Retired materials are preserved in `research/archive/2026-10-30/`, outside the published `dist` directory. Court records need substantive research and verification before reuse. The simplification does not constitute a new legal review.

## Run locally

Serve `dist` through a static HTTP server. For example:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. There is no build step, backend or runtime package dependency. Direct `file://` viewing does not reliably support the JSON fetches.

## GitHub Pages

`.github/workflows/pages.yml` deploys only `dist` on pushes to `main` and supports manual runs. The repository's **Settings → Pages → Build and deployment** source is **GitHub Actions**. Assets use relative paths to support the project URL. The workflow uses GitHub's built-in token; no personal token belongs in the repository.

The separate portfolio at `dist/ai-enablement/index.html`, where present in the GitHub repository, is independent of the atlas and is not changed by the library simplification.

## Content and coverage

`dist/states.json` is the source of truth. This is a curated collection, not an exhaustive legal inventory or legal advice. Depth varies by state. Federal, professional, sector-specific and unlisted local requirements may also apply. Map colors describe the collection rather than regulatory strictness.

The November 3, 2026 expansion reviewed 67 entries across New York and 14 other East Coast states, including Pennsylvania. It adds linked code provisions and practical notes, while retaining the simplified legislation-first interface. Research patches and known limitations are preserved in `research/2026-11-03/`.

The November 4, 2026 Florida expansion adds nine records and deepens the existing privacy entry, bringing Florida to 13 entries. It covers professional and court rules, patient records, consumer claims, employment, housing, public records and synthetic media. Primary sources and limitations are preserved in `research/2026-11-04/`.

Source-check dates are preserved on individual entries; they were not refreshed during the October 30 layout revision. The original survey was reviewed on September 18, 2026, with later targeted expansions through November 4, 2026. Per-entry dates override state dates. The collection is manually maintained and does not update automatically.

Enacted describes adoption, not a guarantee that every provision is operative or enforceable. Upcoming identifies adopted measures with future duties. Enjoined entries retain their stated limitations. Proposals are not included. Some original entries use labeled legislative research summaries where primary text was unavailable.

## Update an entry

States have `code`, `name`, `kind` (`ai` or `related`), `summary`, `reviewed` and `laws`. Law records include `id`, `title`, `bill`, `topic`, `description`, `timing`, `status` and `url`. Expanded records can include:

```json
{
  "id": "law-NY-28",
  "type": "Binding state regulation",
  "reviewed": "2026-11-03",
  "appliesTo": "Entities or activities within the rule's scope",
  "obligations": ["Key duty, including qualifications"],
  "enforcement": "Authority and available remedies",
  "limits": "Exceptions and boundaries",
  "sources": [{"label": "Official regulation", "url": "https://..."}],
  "codeSections": [{"section": "§123", "detail": "What this provision covers", "url": "https://..."}],
  "practicalSteps": ["Editorial implementation suggestion, not an additional legal duty"]
}
```

Keep IDs unique and stable when adding, removing or reordering records. Existing law links continue to resolve even after an earlier entry is removed. Retired guide and case links open the selected state's law library. Set `local: true` for NYC entries; extend the jurisdiction labels before adding a different locality.

Check amendments, operative dates and enforceability against primary sources before changing legal claims. Keep source-check dates truthful. Never update every state's date when reviewing only one entry. `url2`, `source` and `source2` remain supported for older records.

## Files and geography

`dist/index.html`, `style.css` and `app.js` provide the interface. `dist/map.json` contains outlines derived from US Atlas's projected Albers TopoJSON, based on US Census geography. Alaska and Hawaii are insets. See `THIRD_PARTY_NOTICES.md`. Google Fonts are optional and have system-font fallbacks.
