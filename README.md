# Wine Tier List website

A browser-based wine ranking app built for GitHub Pages.

## Features

- Upload a picture for each wine
- Add a wine name and optional tasting notes
- Drag wines into S, A, B, C, D, or F tiers
- Automatically save the board in the browser using localStorage
- Export the complete board as a PNG image
- Responsive layout for phones, tablets, and desktop

## Run locally

Open `index.html` in a browser, or run a small local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new GitHub repository, such as `wine-tier-list`.
2. Upload all files in this folder to the repository's main branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then click **Save**.
6. GitHub will provide a public address similar to:
   `https://YOUR-USERNAME.github.io/wine-tier-list/`

## Important storage note

Wine photos and rankings are stored only in the visitor's browser. They are not uploaded to a server or shared between devices. Clearing browser storage removes the saved board.
