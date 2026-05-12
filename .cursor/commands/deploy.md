# Deploy — branch, commit, push, PR

Follow the workspace rule **Deploy workflow (`/deploy`)** in `.cursor/rules/deploy-workflow.mdc`.

**Do now:**

1. Determine if this work is a **new feature**: if yes and we are not already on an appropriate branch, create **`feat/<short-topic>`** from up-to-date **`origin/main`** (or base branch given by the user), then proceed.
   - If a PR already exists for the current branch, assess scope fit:
     - If new commits are aligned with that PR's feature/fix, continue on current branch.
     - If new commits are even slightly different in scope/intent, create a **new branch** from `origin/main`, move only relevant changes, and create a **new PR**.
2. Review `git status` / diff; exclude secrets (`\.env`) but otherwise include all non-ignored changed files.
3. If there are unrelated changes, split them into smaller logical commits (and separate branch/PR when scope differs) instead of leaving files local.
4. Create **logical commits** with conventional messages.
5. Run a quick sanity check (`npm run build` or tests) when appropriate.
6. **Push**: `git push -u origin <current-branch>`.
7. **PR** into `main` (unless specified otherwise): use `gh`; description must summarize **`origin/main...HEAD`**, list commits, include verification notes. Use REST PATCH for title/body if `gh pr edit` hits GraphQL `projectCards` errors.
8. Finish with clean `git status` unless the user explicitly asked to keep local changes.

Explicitly confirm the branch name and PR URL when finished.
