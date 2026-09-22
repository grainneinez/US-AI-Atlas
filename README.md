# US AI Atlas

An interactive US map and searchable regulation library covering all 50 states, with 67 selected measures. New York has 13 detailed entries explaining scope, duties, enforcement, limitations, timing, and primary sources.

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

- Accurate SVG state outlines, keyboard selection, and a native state selector.
- State deep links, such as `?state=NY#regulations`. New York opens by default.
- Search and combined topic, status, and statewide/local filters within a state.
- Expandable scope, duties, enforcement, and limitation sections where researched.
- Copyable state links and CSV export of the currently filtered records.
- Optional browser `select_state` structured tool; ordinary navigation works without it.

## Content and research dates

The source of truth is `dist/states.json`. The original 50-state survey was checked on **18 September 2026**. The New York expansion and added California bot-disclosure and Utah mental-health chatbot entries were checked on **22 September 2026**. Per-entry dates override the state's original date.

This is a curated starting point, not a complete legal inventory or legal advice. Depth varies by state. The collection does not automatically refresh or comprehensively track litigation. Enacted describes adoption, not a guarantee that every provision is operative or enforceable. Upcoming identifies adopted measures with future duties; guidance is separate from enacted legislation. Local measures are labeled explicitly. Proposals are not included.

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

Set `local: true` for the current NYC entry. If adding another locality, extend the jurisdiction labels in `dist/app.js` first. Existing `url2`, `source`, and `source2` fields remain supported. Keep source-check dates truthful; do not update every state's date when reviewing only one entry. Validate amendments and operative dates against the current primary text before changing a legal status.

## Files and geography

`dist/index.html`, `style.css`, and `app.js` provide the interface. `map.json` contains outlines derived from US Atlas's projected Albers TopoJSON, based on US Census geography. Alaska and Hawaii are insets. See `THIRD_PARTY_NOTICES.md`. Google Fonts are optional; system fonts are fallbacks.

## Verification

All 50 map selections and source rendering, keyboard and selector navigation, deep links, combined filters, empty/reset states, CSV export, and structured-tool input handling are exercised in a DOM harness. GitHub Pages workflow configuration follows GitHub's documented static-site actions. A compatible full-browser preview is unavailable in the current plain-static execution environment; responsive layout is implemented but has not received a fresh browser rendering check. The GitHub workflow must run in the destination account to verify its hosting configuration.
