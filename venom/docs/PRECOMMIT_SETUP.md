# Pre-commit setup

Two ways to enable the F4 residue gate locally.

## A) Husky (recommended for team consistency)

```sh
cd venom
npm install --save-dev husky
npm pkg set scripts.prepare="husky"
npx husky
```

This installs the hook handler. The `venom/.husky/pre-commit` file is
already committed and runs `node venom/scripts/precommit-residue-check.mjs`
on staged changes.

To bypass for a single commit:

```sh
SKIP_RESIDUE_CHECK=1 git commit -m "..."
```

## B) Manual symlink (zero-deps)

For local-only workflows where you do not want to add husky to the
dependency tree:

```sh
# From the repo root (where .git lives)
ln -sf ../../venom/scripts/precommit-residue-check.mjs .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or wrap it in a tiny shell script:

```sh
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
node venom/scripts/precommit-residue-check.mjs || exit 1
EOF
chmod +x .git/hooks/pre-commit
```

## What the gate blocks

Any staged `venom/src/templates/<key>/content/cs.json` or `skin.css`
that references:

- WordPress paths (`/wp-content/`, `/wp-includes/`, `s.w.org`)
- Wix CDN (`static.wixstatic.com`)
- Shopify CDN (`cdn.shopify.com/s/files`)
- Webflow (`assets-global.website-files.com`)
- Framer (`framerusercontent.com`)
- Original `/clones/<brand>/` paths

If a commit is blocked, the script prints the offending file + pattern
and suggests a fix command (`cleanup-residues.mjs` or
`download-external-assets.mjs`).
