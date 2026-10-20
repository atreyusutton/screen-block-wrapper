# Owen McMahon — workspace

This folder is Owen's personal space in the Wrapper project. Drafts, experiments and notes go here so they never collide with anyone else's files.

## Rules I follow so my edits don't affect the team

- I work on my own branch (`owen/workspace`, or `owen/<feature>` for a specific task), never directly on `main`.
- Day-to-day work stays inside `members/owen-mcmahon/`.
- Anything that touches shared code or files outside this folder goes through a pull request so the team can review it before it reaches `main`.
- Before starting work, I pull the latest `main` into my branch:

```bash
git checkout owen/workspace
git fetch origin
git merge origin/main
```

## Folder layout

- `notes/` — research, ideas, meeting notes
- `prototypes/` — experimental code for the app-blocking features
