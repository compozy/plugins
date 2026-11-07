---
name: search
description: User-viewable, user-invocable guidance for searching and reading Unstructured Foundation documents. Use when the user asks to find, filter, summarize, or retrieve processed files from connected sources.
user-invocable: true
---

# Search And Retrieval Guidance

This skill is user-viewable and user-invocable. Use it as the retrieval workflow for natural-language requests about searchable documents in Unstructured Foundation.

Keep this file safe for users to read. Prefer product-facing language, avoid exposing private implementation notes, and mention raw IDs only when they are needed for a developer/debugging request.

## Readiness First

If the user asks whether files are ready, what is searchable, or why search has no results, call `pipeline_processing_status` before making a claim.

Map status to the next step:

- `no_sources`: no sources are connected yet; suggest `/foundation:connect`.
- `never_run`: sources are connected, but files have not been processed yet.
- `running`: files are still being processed; include progress counts when available.
- `failed`: processing hit a problem; summarize the status without retrying automatically.
- `ready`: documents are searchable; continue with search or retrieval.

When a search returns no useful matches, check readiness unless this was already done in the same flow. Do not tell the user that documents do not exist until the relevant processed data is ready.

## Choosing The Right Tool

`asset_query` is the front door for finding, filtering, listing, or enumerating documents — including broad "find all …" requests. `describe_corpus` answers *how many* / *what distribution* only (counts and breakdowns by source, type, or date); it never returns document identities or content, so don't use it to discover or enumerate documents. When unsure, start with `asset_query`.

## Search With `asset_query`

Use `asset_query` to find documents. Required parameters are:

- `text`: the user's query.
- `search_in`: a list containing exactly one current search surface.

Current `search_in` values:

- `document_summary`: generated document summaries.
- `document_title`: document names or titles.
- `document_text`: full processed document text.
- `topics`: generated topic labels.
- `ner`: generated entity labels.

Examples:

```text
asset_query(text="quarterly revenue", search_in=["document_text"])
asset_query(text="vendor contracts", search_in=["document_summary"])
asset_query(text="Acme Corp", search_in=["ner"])
```

Choose the surface by intent:

- Broad question answering: start with `document_text`.
- Finding a specific file by name: use `document_title`.
- Finding documents by high-level meaning: use `document_summary`.
- Finding themes: use `topics`.
- Finding people, organizations, locations, or other entities: use `ner`.

`search_in` accepts exactly one surface per call. When a request spans surfaces, call each separately, deduplicate on `asset_doc_id`, and assess the merged candidates from their titles and content.

Surfaces are complementary: an empty `document_title` result does not prove the subject is absent. Try `document_text`, `document_summary`, `topics`, or `ner` as appropriate before reporting no matches.

Query syntax:

- Use ordinary words for simple keyword search, such as `vendor contracts`.
- Use uppercase Boolean operators when the user combines terms explicitly, such as `revenue AND forecast`. Use `OR` for synonyms of one concept, such as `contract OR agreement`. When distinct entities need separate accounting, issue one call per entity, concurrently when possible, so each gets its own result limit and zero matches remain attributable.
- Use a trailing prefix wildcard for prefix matches, such as `acqui*`.
- Use quoted phrases for exact phrases, such as `"master services agreement"`.
- Use `text="*"` when the user wants filtered browsing rather than a keyword search, such as all PDFs from a data source or all documents modified since a date.
- Scores order results only within one call; they are not calibrated or comparable across calls or surfaces. Never use a score cutoff. If many results tie, judge relevance from titles and content.

Useful optional filters include `lineage_data_source`, `mime_types`, `created_at`, `modified_at`, `first_seen_at`, `last_materialized_at`, `metadata_filters`, `limit`, `offset`, and `strict`.

Use public language when explaining filters. Say "data source" to the user, but distinguish source type from source instance when choosing filters:

- `lineage_data_source` scopes to a source lineage or connector type, such as Google Drive, Dropbox, Slack, S3, or another source type, when that exact lineage value is known.
- `metadata_filters={"platform_workflow_id": "<source-id>"}` scopes to one configured source instance. The `<source-id>` is the source ID returned by `pipeline_list_sources` and corresponds to that connector instance, not to the connector type.

Filter guidance:

- Use `lineage_data_source` for named source lineages or connector types, such as all Google Drive documents or all Slack documents, when the exact lineage value is known.
- Use `mime_types` for requested file types, such as PDFs, slides, spreadsheets, or plain text.
- Use `modified_at` when the user asks what changed, was updated, or was modified in a time range.
- Use `created_at` when the user asks what was added or created in a time range. It is source-provided: for a document created in the connected source, it is that document's creation time; for a copied or uploaded file, it may reflect when the file entered that source rather than when its contents were published.
- Use `first_seen_at` when the user asks what Foundation first ingested during a time range.
- Use `last_materialized_at` when the user asks what Foundation refreshed, reprocessed, or made newly searchable during a time range.
- Use exact `metadata_filters` only when the user asks for a specific metadata field/value or when a previous tool response exposed the exact field/value to reuse.
- Use `metadata_filters={"platform_workflow_id": "<source-id>"}` to scope a search to a single specific connected source instance. The `<source-id>` is the source ID returned by `pipeline_list_sources` — the same value works directly as the `platform_workflow_id` metadata filter. This is an instance-level filter, not a type-level filter. Prefer it when the user has multiple sources of the same connector type, for example two different Google Drives, and wants just one of them. Use `lineage_data_source` when the user names a connector type broadly.
- Prefer `text="*"` plus filters for requests like "show all PDFs from Dropbox" or "what was modified since Monday" when no keyword is provided.

Date filters describe source or Foundation lifecycle timestamps; they do not determine the period discussed by document contents.

When a time reference applies to content, search `document_title` or `document_text` and use date filters only as optional broad bounds. Reserve tight date filters for file activity such as added, changed, or refreshed. If a date-filtered search returns nothing or results outside the intended period, widen or drop the filter and retry before reporting absence. `describe_corpus` can show corpus-wide timestamp ranges to help choose a bound; it never returns documents.

## Finding All Matching Documents

`asset_query` enumerates without reading every file. Raise `limit` or page when needed; do not ask the user to narrow merely because the corpus is large.

- Filter-expressible criteria (type, source, date, metadata): use `asset_query(text="*", search_in=[...], ...)` with the relevant filters. `text="*"` returns an unranked `filter_only` set; `search_in` is still required.
- To page a reproducible filtered query on `document_text` or `document_title`, repeat the identical call with `offset` increased by `limit`; `offset + limit` cannot exceed 10000. Keep `strict=true`; a short page proves exhaustion only when no diagnostics are present. At the 10000 window, split the requested scope with existing date, type, or source filters rather than inventing a new filter.
- Do not page filterless relevance queries or a filterless `text="*"` as though their ordering were stable. Even with filters, do not use offset paging on `document_summary`, `topics`, or `ner` for exhaustive enumeration because artifact rows can collapse or repeat by document; enumerate on `document_text` / `document_title` instead.
- Content criteria: search whichever surface fits — `document_text` for full text, `document_summary` / `topics` / `ner` for enriched discovery — to bucket matches, then use `asset_get_artifacts` on a bounded ambiguous remainder when several derived views are needed.
- Handle autonomously and do not fall back to `describe_corpus` (counts, not documents).

## Retrieve Known Documents

Search results include `asset_doc_id` values such as `adid:<uuid>`. Use only those document IDs for follow-up retrieval.

| Need | Tool |
| --- | --- |
| Conceptual or corpus-wide discovery | `asset_query` |
| One known summary, topics view, or entity view | `asset_get_artifact` |
| The same derived view for 2–50 known documents | `asset_get_artifacts` |
| Full text or exact passages in one known document | `asset_get_doc_text`, with grep unless the whole text is needed |

Derived `artifact_kind` values are `document_summary`, `topics`, and `ner`. Never loop singular artifact calls for a bounded candidate set: narrow to the most relevant 50, or batch an intentionally larger set into calls of at most 50 (for example, 200 IDs require four calls). Full document text is never bulk-fetched.

```text
asset_get_artifacts(asset_doc_ids=["adid:...", "adid:..."], artifact_kind="document_summary")
asset_get_artifacts(asset_doc_ids=["adid:...", "adid:..."], artifact_kind="ner", text_selection={"mode": "grep", "pattern": "Acme Corp"})
asset_get_doc_text(asset_doc_id="adid:...", text_selection={"mode": "grep", "pattern": "Acme Corp"})
```

One shared bulk `text_selection` applies independently to every artifact. Retain successful items when another item fails. An item error or truncation means that item is unresolved; only a successful, untruncated item with empty `text_content` is a no-match. Request diagnostics disclose aggregate response-budget clipping or omission, which makes the set incomplete; retry affected items in a smaller batch or singly.

Grep is case-insensitive literal search by default. Inside `text_selection`, set `case_sensitive=true` when needed or `syntax="regex"` for RE2 regex, which does not support backreferences or lookaround. Bound results with `before_lines` and `after_lines` (default 2 each) and `max_matches` (default 50).

Before claiming all or no matches, inspect the metadata. If `has_more_matches=true` without response-size truncation, narrow the pattern or increase `max_matches`. For `truncated_reason="response_size"`, narrow the pattern or reduce context lines; a `text_selection={"mode": "lines", "start_line": N, "line_count": M}` read can expand a returned hunk but cannot reveal omitted hunks. For document `truncated_reason="service_limit"`, the scan is partial and `total_matches` is unknown, so report that limitation and narrow to a known section or range. Singular `asset_get_artifact` grep raises if its scan cannot complete; bulk retrieval instead marks that item unresolved while retaining other successes. Never treat an error as a no-match.

## Common Flows

For "search my documents for X":

1. If readiness is uncertain, call `pipeline_processing_status`.
2. Call `asset_query(text=X, search_in=["document_text"])`.
3. Summarize the best matches with document names and why they match.
4. Use `asset_get_doc_text` for top matches when the user needs the answer, using grep `text_selection` for specific passages rather than fetching the whole document.

For "summarize this/the latest/the matching document":

1. Use `asset_query` to identify the document if no `asset_doc_id` is already known.
2. Use `asset_get_artifact(asset_doc_id=..., artifact_kind="document_summary")`.
3. If the generated summary is missing or too thin, use `asset_get_doc_text` and summarize from the text.

For "what is searchable right now" or broad corpus counts:

Counts/distribution only — for finding or enumerating documents (even "find all"), use `asset_query`.

1. Use `pipeline_processing_status` first.
2. If documents are ready and `describe_corpus` is available, use it for corpus-wide counts.
3. Use `describe_corpus(group_by="lineage_data_source")` when the user asks for a connector/source-type breakdown or asks which source types have searchable documents.
4. Use `describe_corpus(group_by="platform_workflow_id")` when the user asks for a breakdown by specific connected source instance. Map source IDs to source names with `pipeline_list_sources` when possible; share raw source IDs only when the user asks for IDs or debugging details.
5. Keep the explanation public-facing; do not expose internal index IDs.

For "what changed since [date/time]":

1. Call `pipeline_processing_status(since=...)` first, using the user's date or time.
2. Summarize processing changes from that status before searching.
3. If the user wants document matches, call `asset_query` with `text="*"` and the matching `modified_at`, `created_at`, `first_seen_at`, or `last_materialized_at` filter.
4. Retrieve generated summaries or full text for the relevant matches as needed.

For "summarize what changed since [date/time]":

1. Call `pipeline_processing_status(since=...)` first.
2. Enumerate document IDs with `asset_query(text="*", search_in=["document_text"], modified_at=...)`, `created_at=...`, `first_seen_at=...`, or `last_materialized_at=...` according to the user's wording; page this filtered document-level query as described above when needed.
3. For one result, fetch its summary with `asset_get_artifact`. For multiple results, call `asset_get_artifacts(asset_doc_ids=[...], artifact_kind="document_summary")` in batches of at most 50 and check every item.
4. Use `asset_get_doc_text(asset_doc_id=...)` only for items whose summary is missing or too thin, or when whole-document context is needed; use grep `text_selection` for a specific term or passage.

For "what is searchable by data source":

1. Use `pipeline_processing_status` first.
2. If the user means connector/source types, call `describe_corpus(group_by="lineage_data_source")`.
3. If the user means specific configured source instances, call `pipeline_list_sources` and `describe_corpus(group_by="platform_workflow_id")`; map source IDs to source names when explaining results.
4. If the distinction is ambiguous and affects the answer, ask whether they mean source type or a specific connected source instance.
5. Keep the explanation public-facing; do not expose internal index IDs.

For "search only [source type]" where the user names a connector/source type such as Google Drive, Slack, Dropbox, or S3:

1. Interpret the named source as a source-lineage or connector-type filter.
2. Call `asset_query` with `lineage_data_source` set to the requested source value.
3. If no matches appear, check readiness and explain that the filter may be too narrow, the exact lineage value may differ, or the source type may not be processed yet.

For "search only this specific source" where the user means one configured source instance, not a connector/source type:

1. Call `pipeline_list_sources` to identify the source the user means and obtain its source ID.
2. Call `asset_query` with `metadata_filters={"platform_workflow_id": "<source-id>"}`, combined with a real `text` query or `text="*"` for filtered browsing.
3. This pins results to exactly the documents ingested by that connector instance, which is useful when several sources share the same connector type. Refer to the source by name when explaining results to the user. Share the source ID only when the user specifically asks for IDs or debugging details.

## User-Facing Language

Prefer public terms: Unstructured Foundation, sources, connected sources, data source, processed files, searchable documents, document text, summary, topics, entities, generated view.

Avoid exposing private implementation notes. It is okay to mention exact MCP tool names, parameters, or returned fields when answering a developer/integrator question or when the user asks how the retrieval workflow works.
