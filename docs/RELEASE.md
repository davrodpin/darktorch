## Releasing and deploying (GitHub Pages)

This repo includes a manually-triggered GitHub Actions workflow (`Release`) that
can:

- **Create a release commit** that bumps versions in `package.json`,
  `package-lock.json`, and `public/manifest.json`
- **Create and push a tag** in the format `vX.Y.Z`
- **Optionally deploy** the built site to GitHub Pages (project pages)

### One-time GitHub setting

In GitHub repo settings, set **Pages → Source = GitHub Actions**.

### Running the workflow

Go to **Actions → Release → Run workflow** and provide:

- **version**: `1.2.3` or `v1.2.3`
- **deploy**: check to deploy to GitHub Pages
