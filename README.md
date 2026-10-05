# US AI Atlas

An interactive US map and searchable regulation library covering all 50 states, with 78 selected measures. New York has 23 detailed entries explaining scope, duties, enforcement, limitations, timing, and primary sources.

## Run locally

Serve `dist` through any static HTTP server. For example, from this repository:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. There is no build step, server backend, API key, or runtime package dependency. Opening the HTML directly as a `file://` URL does not support the JSON fetches reliably.

## Deploy to GitHub Pages

The repository includes `.github/workflows/pages.yml`, using GitHub's official Pages actions to deploy only `dist`.

1. Create a repository in your GitHub account (suggested name: `us-ai-atlas`). GitHub Free supports Pages for public repositories; private repositories require an eligible paid plan.
2. Push these files, including `.github/workflows/pages.yml`, to its `main` branch. Keep the `dist` folder intact.
3. In the repository, open **Settings → Pages → Build and deployment**, and select **GitHub Actions** as the source.
4. Open **Actions → Deploy US AI Atlas to GitHub Pages → Run workflow**. Future pushes to `main` publish automatically.
5. Use the successful deployment's URL shown in Actions or Settings → Pages. For a project repository it normally has the form `https://grainneinez.github.io/US-AI-Atlas/`.

All website assets use relative paths, so both project repositories and an account-root Pages site work. The workflow uses the built-in `GITHUB_TOKEN`; no personal token or custom secret is needed in the repository. The downloadable GitHub package excludes the existing host's project configuration and Git history.

Reference: [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Interactions

- New York startup launch guide: 12 practical topics, product-feature filters, current versus upcoming duties, official sources, and regulation cross-links.

- Court decisions with affected-jurisdiction, court-location, stage, and text filters; optional federal relevance; dated histories and shareable case links.
- Cross-links between related cases and the affected statute cards.
- Accurate SVG state outlines, keyboard selection, and a native state selector.
- New York State vs NYC comparison, a hiring-scope explainer, and jurisdiction filters that make overlapping obligations clear.
- State deep links, such as `?state=NY#regulations`. New York opens by default.
- Search and combined topic, status, and statewide/local filters within a state.
- Expandable scope, duties, enforcement, and limitation sections where researched.
- Copyable state links and CSV export of the currently filtered records.
- Optional browser `select_state` structured tool; ordinary navigation works without it.

## Content and research dates

The source of truth for the law library is `dist/states.json`. The original 50-state survey was checked on **18 September 2026**. The New York expansion and added California bot-disclosure and Utah mental-health chatbot entries were checked on **22 September 2026**. The State/NYC comparison, hiring-scope clarification, customer biometrics, tenant data privacy, and state/city human-rights entries were checked on **26 September 2026**. The startup guide and six added state measures were researched on **30 September 2026**, with targeted refreshes to RAISE scope, companion notices, and SHIELD. Per-entry dates override the state's original date.

This is a curated starting point, not a complete legal inventory or legal advice. Depth varies by state. The court collection was added on **30 September 2026**. Collections do not automatically refresh; court coverage is selected, not a comprehensive litigation tracker. Enacted describes adoption, not a guarantee that every provision is operative or enforceable. Upcoming identifies adopted measures with future duties; guidance is separate from enacted legislation. Local measures are labeled explicitly. Proposals are not included.

New York's RAISE entry uses the March 2026 chapter amendment (S8828 / Chapter 96) and current codified sections, with duties effective **1 January 2027**. It supersedes the earlier summary of the original 2025 enactment.

A few original entries use clearly labeled NCSL legislative summaries where primary text was unavailable. Federal, civil-rights, general consumer-protection, sector, and unlisted local laws may also apply.

## Update an entry

Every state has `code`, `name`, `kind` (`ai` or `related`), `summary`, `reviewed`, and `laws`. Map colors describe coverage in the collection, not legal strictness.

Every law includes `title`, `bill`, `topic`, `description`, `timing`, `status`, and a primary `url`. Expanded entries support:

```json
{
  "type": "State statute",
  "reviewed": "2026-09-22",
  "appliesTo": "Who falls within the law's scope",
  "obligations": ["Key duty, with qualifications"],
  "enforcement": "Authority and available remedies",
  "limits": "Exceptions and important boundaries",
  "sources": [{"label": "Official statute", "url": "https://..."}]
}
```

Set `local: true` for NYC entries. If adding another locality, extend the jurisdiction labels in `dist/app.js` first. Existing `url2`, `source`, and `source2` fields remain supported. Keep source-check dates truthful; do not update every state's date when reviewing only one entry. Validate amendments and operative dates against the current primary text before changing a legal status.

## Files and geography

`dist/index.html`, `style.css`, and `app.js` provide the interface. `map.json` contains outlines derived from US Atlas's projected Albers TopoJSON, based on US Census geography. Alaska and Hawaii are insets. See `THIRD_PARTY_NOTICES.md`. Google Fonts are optional; system fonts are fallbacks.

## Verification

All 50 map selections and source rendering, keyboard and selector navigation, deep links, combined filters, empty/reset states, CSV export, and structured-tool input handling are exercised in a DOM harness. Startup-guide checks also cover feature combinations, preserved starting topics, regulation cross-links, both data-load orders, and independent loading failure/retry. GitHub Pages workflow configuration follows GitHub's documented static-site actions. A compatible full-browser preview is unavailable in the current plain-static execution environment; responsive layout is implemented but has not received a fresh browser rendering check. The GitHub workflow must run in the destination account to verify its hosting configuration.

## Add or update a court decision

Edit `dist/cases.json`, the separate source of truth for court developments. The interface groups state-specific decisions before federal matters, sorting each group by `decisionDate`, links related decisions, annotates linked law cards, and shows federal relevance separately from state-specific law. New entries appear after the usual GitHub push/Pages deployment. This is a manually reviewed collection, not an automated news or docket feed.

Choose decisions that materially affect AI-related duties, enforcement, interpretation, or procurement. Read the operative order; distinguish allegations, preliminary relief, merits holdings, and appeals. Check later orders and stays before describing present enforceability. Leave an explicit gap in `reviewStatus` if follow-up cannot be confirmed. Do not change a statute’s status simply because someone sued.

Each record uses:

- `id`: unique, stable lowercase letters/numbers/hyphens; preserves links such as `?state=CA&case=xai-ab2013#case-xai-ab2013`.
- `name`, `headline`, `court`, `courtLocation` (two-letter state code or `DC`), and `docket`.
- `decisionDate`, `stage`, `outcome`, `topic`, and `law`.
- `scope`: `state` for a state/local law issue or `federal` for a federal government/law issue. `affectedJurisdictions` lists the laws affected, not the courthouse location. Federal matters use an empty array and can be included across state filters. Use `reach` and `limits` to state the actual geographic, party, and precedential boundaries; a filter tag alone is not a legal conclusion.
- `holding`, `effect`, `limits`, `reviewStatus`, and `reviewed` (truthful ISO source-check date).
- `timeline`: dated developments as `{ "date": "YYYY-MM-DD", "text": "What happened" }`.
- `sources`: primary opinions/orders and labeled docket mirrors as `{ "label": "Source description", "url": "https://..." }`.
- `relatedCases`: other case IDs. `relatedLaws`: `{ "state": "CA", "reference": "AB 2013", "label": "Training-data law" }`; reference must uniquely match a bill in that state’s regulation collection.

Update the record and timeline when a later decision changes the result; keep the stable ID. Update `decisionDate` only for a new substantive ruling, not merely a source recheck. Append linked records for distinct proceedings, as with the two Anthropic procurement cases. A federal district court’s location does not make its holding state law or nationally binding precedent.

The initial entries are the D.C. Circuit’s September 25 Anthropic merits decision, the Northern District of California’s August 27 Anthropic merits ruling, and the Central District of California’s March 4 denial of preliminary relief in X.AI v. Bonta. Their later-review limitations are stated on the cards. No inference of absence of relevant litigation is made for states with no catalogued state-specific decision.

## New York startup guide

`dist/ny-startups.json` stores 12 launch topics and three upcoming implementation dates. `ny-startups.js` filters by product features while retaining the two starting topics (claims and security). No selections means all topics; multiple selections combine with OR. Selections are temporary page state and do not determine applicability. The guide distinguishes duties, recommended implementation steps, and evidence a founder may choose to keep.

Use `?state=NY#ny-startup-guide` for a direct link. Each `related.reference` and deadline reference must uniquely match a New York law's `bill`; append new law records to preserve existing law-card links. Update guide and law records together when a source changes. Do not infer that every chatbot is a companion, every vendor is DFS-regulated, every startup trains a frontier model, or every recommendation is an addictive feed.

New records cover business practices, consumer subscriptions, child data, Safe by Design, SAFE for Kids, and living-person likeness consent. SAFE for Kids and Safe by Design have different scope and effective dates. Current-law summaries and guidance are manually checked, not automatically updated. No startup inputs leave the browser.

## State updates and reading order

`dist/updates.json` holds the three sourced developments added on **5 October 2026**. Each has an event date, status, timing, business impact, context, official sources, and a unique `reference` matching its state's law entry. `updates.js` shows all updates initially, switches to the selected state when the map/selector changes, and offers an all-state view. Empty and loading-error states leave the law library available.

The reading order is map, state updates, regulation library (including the New York startup guide), then court updates. Within the court collection, state-specific decisions precede federal matters; each group is newest first. The Anthropic federal explanation follows the court cards. Existing case links, filters, and cross-links remain supported.

The California update records SB 53’s 2025 signing and 2026 general effective date. Colorado uses the verified 2026 replacement and current rulemaking rather than the unsupported description of a Q3 2025 first-year sunset review. Utah uses the official September/October 2026 pilot agreements and their limits rather than claiming a blanket 2025 sandbox expansion. The original ACM page could not be retrieved; its supplied assertions were checked against primary government sources. Event dates must not be replaced with review dates to make old milestones appear new.
