# Stack It!

A student-friendly Tower of Hanoi variant for your class.

## What’s included
- `index.html` — simple host page with a header and the game.
- `hanoi.custom.js` — self-hosted game logic:
  - Title locked to **Stack It!**
  - No **Solve!**, no **Log**, no **Minimum Moves**
  - Win condition: **middle OR right** pole
  - Success banner shows **“Good Job!”**

## Quick start (GitHub)
1. Create a new GitHub repo, e.g. `stack-it`.
2. Download the files from this folder and add them to the repo (`index.html`, `hanoi.custom.js`, `README.md`).
3. Commit and push.

### Enable GitHub Pages
1. In your repo, go to **Settings → Pages**.
2. For **Source**, choose **Deploy from a branch**.
3. Select the **main** branch and `/ (root)` folder, then **Save**.
4. After it builds, your site will be available at a URL like:
   `https://<your-username>.github.io/stack-it/`

Use that URL in Google Classroom.

## Update tips
- When you change `hanoi.custom.js`, bump the version query in `index.html` so students get the new file immediately:
  ```html
  <script src="./hanoi.custom.js?v=1.0.1"></script>
  ```

## Optional: Netlify
If you prefer Netlify, drag the folder into Netlify’s dashboard or connect the GitHub repo. The default build settings work because this is a static site.
