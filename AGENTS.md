# AI Agent Instructions

This file contains instructions for AI agents working on this codebase.

## Commit Style

This project uses **Semantic Commit Messages**. Follow this format:

```txt
type: description
```

### Types

- `feat` - new features
- `fix` - bug fixes
- `docs` - documentation changes
- `style` - formatting, missing semicolons, etc (no code change)
- `refactor` - code refactoring
- `test` - adding tests
- `chore` - maintenance tasks

### Examples

```txt
feat: add command to show output panel
fix: status bar not updating after interval change
docs: add bugs & homepage field
```

## Changelog Maintenance

**IMPORTANT:** When implementing any new features, bug fixes, or changes to this extension, you MUST update the [CHANGELOG.md](CHANGELOG.md) file.

### Guidelines

1. Add entries under the `[Unreleased]` section
2. Use the appropriate category:
   - **Added** - new features
   - **Changed** - changes in existing functionality
   - **Deprecated** - soon-to-be removed features
   - **Removed** - removed features
   - **Fixed** - bug fixes
   - **Security** - vulnerability fixes
3. Write clear, user-facing descriptions (not technical implementation details)
4. Keep entries concise but descriptive

### Example

```markdown
## [Unreleased]

### Added

- New command to pause/resume burn cycles

### Fixed

- Status bar not updating after changing interval
```

## Releasing

When creating a release:

1. Update `package.json` version
2. In CHANGELOG.md, rename `[Unreleased]` to the version number with date (e.g., `[0.0.2] - 2026-01-04`)
3. **Remove** the `[Unreleased]` heading entirely - do NOT leave an empty Unreleased section
4. Commit with message: `chore: release vX.X.X`
5. Create and push the version tag (e.g., `v0.0.2`)
