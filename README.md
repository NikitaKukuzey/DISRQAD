# DISRQAD project website

A static, responsive research page for **DISRQAD: Diffusion Image Super-Resolution Quality Assessment Dataset and Benchmark**. English content follows the supplied manuscript. No framework, package installation or build step is required.

## Preview

Open `index.html`, or serve the repository with `python -m http.server 8000` and visit `http://localhost:8000`. A local server provides consistent PDF and clipboard behavior.

## Publish on GitHub Pages

The repository is configured for `https://nikitakukuzey.github.io/DISRQAD/`.

1. Push these files to `main`.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Run **Deploy research website to GitHub Pages**, or push a new commit. The workflow uploads only public site files.

Alternatively select **Deploy from a branch → main → / (root)**. All asset paths work under `/DISRQAD/`.

## Content and assets

- Main article: construction, human protocol, all 51 standard and 11 adapted configurations, 28 condition rows, fine-tuning and student comparison.
- Supplementary: source features, thresholds, LR settings, sampling, pilot and rating-count data, architecture, losses, optimizer settings, private-split adaptation and limitations.
- Visual archive: the 10 figures used in the final article, including supplementary material. Unused project variants are not displayed.
- `assets/paper/DISRQAD.pdf`: the exact supplied 21-page PDF, with a page-one preview and optional embedded viewer.
- Logos: [official MSU brandbook](https://brandbook.msu.ru/) and [MSU Institute for AI](https://www.iai.msu.ru/); owned by the respective institutions.
- Dataset: https://huggingface.co/datasets/visualprior/DISRQAD
- arXiv: clearly labeled placeholder, with no invented paper ID.
- Citation: provisional manuscript entry, with no guessed date or venue.

Unused project assets remain in the repository but are not displayed in the visual archive.

## Editing

- Text, authors, affiliations and links: `index.html`.
- Layout and typography: `styles.css`.
- Interactions and figure captions: `app.js`.
- Exact numeric data: `assets/data.js`.
- After arXiv release, replace `arxiv-placeholder` with an anchor to the actual abstract URL; update status and citation; remove the placeholder click handler in `app.js`.
- To regenerate previews and data, run `scripts/prepare_assets.py` with the source LaTeX folder, original PDF and `pdftoppm` executable. The optional preparation script requires Pillow and pypdf; GitHub Pages does not run it.

Inspired by [FGResQ](https://sxfly99.github.io/FGResQ-Home/) and [A-FINE](https://tianhewu.github.io/A-FINE-page.github.io/), with original styling. Locally hosted WebP previews and original figure PDFs, keyboard-accessible dialogs, labeled filters, reduced-motion support, table scrolling and PDF fallback links are included. Google Fonts are optional; system fonts keep the site usable offline.
