# Deploy — branch, commit, push, PR

Follow the workspace rule **Deploy workflow (`/deploy`)** in `.cursor/rules/deploy-workflow.mdc`.

**Do now:**

1. Determine if this work is a **new feature**: if yes and we are not already on an appropriate branch, create **`feat/<short-topic>`** from up-to-date **`origin/main`** (or base branch given by the user), then proceed.
2. Review `git status` / diff; exclude secrets (`\.env`).
3. Create **logical commits** with conventional messages.
4. Run a quick sanity check (`npm run build` or tests) when appropriate.
5. **Push**: `git push -u origin <current-branch>`.
6. **PR** into `main` (unless specified otherwise): use `gh`; description must summarize **`origin/main...HEAD`**, list commits, include verification notes. Use REST PATCH for title/body if `gh pr edit` hits GraphQL `projectCards` errors.

Explicitly confirm the branch name and PR URL when finished.
