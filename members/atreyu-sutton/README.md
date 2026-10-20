# Atreyu Sutton — workspace

Atreyu's personal space in the project. Drafts, experiments, and notes go here so they don't collide with anyone else's files.

## Working rules

- Work on my own branch (`atreyu/prototype`, or `atreyu/<feature>`), never directly on `main`.
- Day-to-day work stays inside `members/atreyu-sutton/`.
- Changes to shared code or files outside this folder go through a pull request.
- Pull the latest `main` before starting work:

```bash
git checkout atreyu/prototype
git fetch origin
git merge origin/main
```

## Folder layout

- `notes/`: research, ideas, meeting notes
- `prototypes/`: experimental code (first up: the web app + YouTube embed under Screen Time spike)
