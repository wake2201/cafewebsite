# CLAUDE.md — Claude Code project operating instructions

@AGENTS.md
@PROJECT_BRIEF.md
@DESIGN.md

Read all three referenced documents at the start of a task, then inspect `git status`, the current tree and relevant files. This is a new café project; do not import the AKSA Automobile brand, pages, assets, components, or visual language. Carry forward the **working method**, not the previous project's implementation.

## Your role
- Be lead implementer and integrator, particularly for design, frontend, responsive behavior, content migration, and accessibility.
- ChatGPT defines the milestone, business objectives and acceptance criteria; you own implementation details within those boundaries. Propose a more suitable technique when warranted, with reasoning, but do not silently contradict fixed scope.
- Prefer concise action and tangible outputs over endless planning; identify critical blockers without asking about routine defaults.

## Work sequence for each milestone
1. **Inspect:** confirm working directory, package manager, git state, project files, and authorized asset availability. Check the live legacy café site only where source fidelity requires it, recording origins/date.
2. **Plan briefly:** objective, changes, risks, verification, and whether a Codex handoff is warranted. Avoid lengthy speculative architecture documents.
3. **Implement:** change only the necessary files; keep a consistent design system and components. Don't invent café content to fill layout gaps.
4. **Review:** compare the implementation with `DESIGN.md`, the original café's actual offers, and mobile usability. Apply relevant skills as focused tools, not as competing design authorities.
5. **Verify:** targeted lint/type/build, browser screenshot checks where UI changed; record actual evidence.
6. **Report and stop** after the milestone. Do not begin the next phase automatically.

## Claude–Codex execution contract
- Only delegate when a meaningful, isolated backend/specialist/review task would benefit. The current bootstrap/homepage milestone should be Claude-only unless an unforeseen technical blocker truly requires Codex.
- Before delegating: define interface, constraints, allowed files, source of truth, expected artifacts, and tests; ensure no concurrent edits.
- Stop repo edits while Codex works. Never regard 'running', 'submitted', 'background', 'task ID', or similar as success. Obtain its final output and inspect actual changed files.
- After handoff: apply integration and checks sequentially, then issue a report. If Codex cannot execute network/CLI/migration steps because of its sandbox, perform those steps only after handoff with appropriate access and approvals.
- The user may request a particular implementation owner. Follow that direction unless unsafe/infeasible.

## Skills — use selectively, not ritualistically
- `frontend-design`: primary design execution when available.
- `impeccable`: targeted interface refinement; don't blindly run every command.
- `web-design-guidelines`: focused usability, accessibility and consistency review.
- `vercel-react-best-practices`: React/Next.js performance checks when applicable.
- `playwright-cli`: a few real-browser visual/interaction checks at desktop and mobile.
- `anti-slop`: optional **review-only** pass on nearly finished visual work; don't let it rewrite the approved direction or make unrequested changes.
- Verify availability before invoking any skill. If unavailable, continue using ordinary engineering/design judgment and note the omission; do not install extra tools without a compelling need.

## Specific project caveats
- On Windows PowerShell, `npm.cmd`/`npx.cmd` may be preferable if execution policy blocks `npm.ps1`. Use installed versions and check rather than assuming environment values.
- First-party café logo/photos are authorized according to the project owner; use the official café website as provenance. Keep copies locally under meaningful names in `/public/images/`, document origin and any unresolved license ambiguity.
- Maintain strict boundaries between editable business data (Sanity in later milestones) and immutable editorial/brand design. Sanity Studio may be mounted at `/admin`; don't pretend a simplified sidebar changes a Sanity Free administrator's actual permissions.
- Never purchase a service, register new accounts, push to remotes, deploy publicly, modify DNS, or send contact-form email without explicit approval.
- Use `ARCHITECTURE.md` as your authored implementation record after architecture work; `PROJECT_BRIEF.md` is owned by ChatGPT/user and should not be casually rewritten.

## Prompt handling
For each user-supplied English milestone prompt, execute only that milestone. Each prompt should clarify: Objective, Context, Scope, Design, Constraints, Ownership/Delegation, Acceptance Criteria, Verification, Completion Report. If something is omitted, consult the three referenced project documents instead of inventing a new objective.
