# Changesets

This directory holds [changesets](https://github.com/changesets/changesets).

## Usage

### Creating a changeset

When you have made a change that requires a version bump, run:

```sh
pnpm changeset
```

Follow the prompts to select which packages changed and whether the bump is `major`, `minor`, or `patch`.

### Releasing

Releasing is automated via GitHub Actions. When you push to `main`, the `release.yml` workflow will:

1. If there are pending changesets → open/update a **"Version Packages"** PR
2. When you merge that PR → automatically version, tag, and publish all changed packages to npm
