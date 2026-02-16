---
name: mol-refinery-patrol
description: Refinery patrol molecule for processing the merge queue, including inbox checks, branch processing, testing, and merging to main. Use to define and execute the merge queue processing workflow.
---

# Mol Refinery Patrol

## Overview

This skill defines the `mol-refinery-patrol` molecule, outlining the sequential steps for processing the merge queue within the Gas Town Refinery role. It ensures consistent and reliable merging of polecat work to the main branch.

## Workflow: Refinery Patrol Steps

This workflow consists of the following steps, which should be executed sequentially:

1.  **📥 inbox-check** - Handle messages, escalations, and MERGE_READY signals.
    *   Check mail using `gt mail inbox`.
    *   Process each message, especially `MERGE_READY <polecat>` signals.
2.  **🔍 queue-scan** - Identify polecat branches waiting in the merge queue.
    *   Fetch latest changes: `git fetch --prune origin`.
    *   List merge queue: `gt mq list first_project`.
    *   If the queue is empty, skip to the `context-check` step.
3.  **🔧 process-branch** - Pick the next branch from the queue and rebase it on the current main.
    *   Checkout local branch: `git checkout -b temp polecat/<worker>`.
    *   Rebase on main: `git rebase origin/main`.
    *   If conflicts are unresolvable, notify the polecat and skip to `loop-check`.
4.  **🧪 run-tests** - Run quality checks and the test suite.
    *   Execute configured setup, typecheck, lint, build, and test commands as defined in the step description (`bd show <step-id>`).
5.  **🚦 handle-failures** - **VERIFICATION GATE**: Address test failures.
    *   If tests PASSED, proceed to `merge-push`.
    *   If tests FAILED:
        *   If the branch caused the failure: Abort, reopen the source issue, notify the witness (`MERGE_FAILED`), close the MR, delete the branch, and skip to `loop-check`.
        *   If failures are pre-existing: File a bug bead (`bd create --type=bug --priority=1 --title="..."`) OR proceed with merge if the failure is not caused by the branch. **FORBIDDEN**: Note failure and merge without tracking.
6.  **🚀 merge-push** - Merge to main and push immediately.
    *   Checkout main: `git checkout main`.
    *   Merge the temporary branch: `git merge --ff-only temp`.
    *   Push to origin: `git push origin main`.
    *   Delete local branches: `git branch -d temp` and `git branch -d polecat/<worker>`.
7.  **🔄 loop-check** - Determine if there are more branches to process.
    *   If more branches exist in the queue, return to `process-branch`.
8.  **📝 generate-summary** - Summarize the current patrol cycle.
9.  **🏗️ check-integration-branches** - Check if integration branches are ready to land.
    *   If `auto_land` is false, state "Auto-land disabled" and move on.
    *   **FORBIDDEN**: Landing integration branches via raw git commands; only `gt mq integration land` is authorized.
10. **🧠 context-check** - Assess session health (RSS, session age, context usage, work done).
11. **🧹 patrol-cleanup** - Perform end-of-cycle inbox hygiene (archive stale messages, check for orphaned MR beads).
12. **🔥 burn-or-loop** - Decision point: continue the patrol or handoff.
    *   Squash the wisp: `bd mol squash <wisp-id> --summary="Patrol: merged N branches, no issues"`.
    *   If the session is healthy, continue: `gt patrol new`.
    *   If the session is heavy, handoff: `gt handoff -s "Patrol complete" -m "RSS: ${RSS_MB}MB. Queue: ..."`.

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### scripts/
Executable code that can be run directly to perform specific operations.

**Examples from other skills:**
- PDF skill: fill_fillable_fields.cjs, extract_form_field_info.cjs - utilities for PDF manipulation
- CSV skill: normalize_schema.cjs, merge_datasets.cjs - utilities for tabular data manipulation

**Appropriate for:** Node.cjs scripts (cjs), shell scripts, or any executable code that performs automation, data processing, or specific operations.

**Note:** Scripts may be executed without loading into context, but can still be read by Gemini CLI for patching or environment adjustments.

### references/
Documentation and reference material intended to be loaded into context to inform Gemini CLI's process and thinking.

**Examples from other skills:**
- Product management: communication.md, context_building.md - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Gemini CLI should reference while working.

### assets/
Files not intended to be loaded into context, but rather used within the output Gemini CLI produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Any unneeded directories can be deleted.** Not every skill requires all three types of resources.
