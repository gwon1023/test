# Root Deployment For AdSense

AdSense checks `ads.txt` at the root of your serving domain.
If the site is published at a project path such as `https://gwon1023.github.io/test/`, AdSense may continue to report that `ads.txt` is missing because it expects the file at `https://gwon1023.github.io/ads.txt`.

## Recommended setup

1. Create a GitHub repository named `gwon1023.github.io` under the same GitHub account.
2. Enable GitHub Pages for that repository.
3. Add a repository secret named `PAGES_REPO_TOKEN` to this repository.
   - The token should have permission to push to `gwon1023/gwon1023.github.io`.
4. Keep working in this repository.
5. Push to `main`.
6. The workflow in `.github/workflows/deploy-root-site.yml` will mirror the site into the root Pages repository.

## Why this fixes the issue

When the site is served from the root domain, the ads.txt file is available at:

`https://gwon1023.github.io/ads.txt`

That matches Google's documented requirement that the ads.txt file must be published in the root directory of the site.

## Verification checklist

After the root site repository is live, verify these URLs manually:

- `https://gwon1023.github.io/`
- `https://gwon1023.github.io/ads.txt`
- `https://gwon1023.github.io/about.html`
- `https://gwon1023.github.io/privacy.html`

Then return to AdSense and use the site-level ads.txt recheck option.
