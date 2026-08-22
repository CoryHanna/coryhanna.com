# coryhanna.com — GitHub Deployment Notes

**Date:** August 22, 2026  
**Project:** coryhanna.com personal website  
**Repository:** `CoryHanna/coryhanna.com`  
**Repository URL:** `https://github.com/CoryHanna/coryhanna.com.git`  
**Production branch:** `main`

## Final result

By the end of the day, `coryhanna.com` was live and connected to its GitHub repository. The `main` branch was established as the production branch, GitHub authentication succeeded, and the hosting/deployment service was connected to the repository.

The live version used the orange design. The mobile navigation was repaired, and the PDF and Word resume download links were fixed.

## What was set up

### 1. Local website project

The website project was being worked on locally from this Windows folder:

```text
C:\Users\Cory Hanna\OneDrive\Desktop\VS Code\coryhanna.com
```

This is the folder to open in VS Code or PowerShell before running Git commands.

Important lesson: Git commands must be run from inside the project folder. Running them elsewhere can produce:

```text
fatal: not a git repository (or any of the parent directories): .git
```

To move into the correct folder in PowerShell:

```powershell
cd "C:\Users\Cory Hanna\OneDrive\Desktop\VS Code\coryhanna.com"
```

### 2. GitHub repository connection

The local project was connected to this GitHub repository:

```text
https://github.com/CoryHanna/coryhanna.com.git
```

The branch was renamed or confirmed as `main` with:

```powershell
git branch -M main
```

An attempt was made to add the GitHub remote with:

```powershell
git remote add origin https://github.com/CoryHanna/coryhanna.com.git
```

Git returned:

```text
error: remote origin already exists.
```

That was not a deployment failure. It meant the local repository already had a remote named `origin`. There was no need to add a second one.

Useful commands for checking this later:

```powershell
git remote -v
git branch
git status
```

Expected result: `origin` should point to the CoryHanna/coryhanna.com repository, and the active branch should be `main`.

### 3. GitHub authentication

The GitHub authorization flow opened in the browser and displayed:

```text
Authentication Succeeded
You may now close this tab and return to the application.
```

The browser then redirected to a temporary local callback address similar to:

```text
http://127.0.0.1:53171/?code=...&iss=https%3A%2F%2Fgithub.com%2Flogin%2Foauth&state=...
```

That `127.0.0.1` page was part of the normal GitHub OAuth sign-in process. It passed the authorization result back to the desktop application. The successful-authentication message confirmed that GitHub access was granted.

Security note: the temporary `code` and `state` values from that URL should not be reused or shared. They were only for that sign-in attempt.

### 4. Production deployment connection

The GitHub repository was selected in the deployment/hosting interface and connected to the website project.

The important production setting was:

```text
Production branch: main
```

This means the live site is tied to the `main` branch. Changes merged or pushed to `main` are the changes intended for production.

The final connection screen showed the repository and production branch correctly. After choosing the repository and confirming `main`, the connection/deployment was completed and the site became live.

## Website changes completed today

### Orange design selected

Two visual versions were compared: blue and orange. The orange version was chosen and became the live design.

The orange version had the stronger final look and is the version to preserve as the current design baseline.

### Mobile navigation repaired

After the site went live, desktop navigation was present but the navigation was missing or unusable on mobile.

The mobile navigation was added/repaired in the updated site package. A blue navigation indicator/bar initially had a problem where it did not scroll or move correctly. The revised mobile-navigation version fixed that behavior.

Final state:

- Mobile visitors have navigation.
- The navigation works on the small-screen layout.
- The blue bar/indicator behavior was corrected.
- The corrected version was deployed to the live site.

### Resume downloads repaired

The resume links initially did not download correctly even though the files appeared to be in the expected project folder.

The site was updated to point to the actual resume files using valid paths and filenames. Both resume formats were included:

```text
Cory-Hanna-Resume.pdf
Cory-Hanna-Resume(1).docx
```

Final state: visitors can download the PDF or Word version of the resume from the site.

Important maintenance note: filenames containing parentheses work, but a simpler filename is less error-prone. If the Word file is renamed later, use something like:

```text
Cory-Hanna-Resume.docx
```

The link in the website code must be updated at the same time as the file is renamed.

## Current deployment workflow

The basic workflow from now on is:

1. Open the `coryhanna.com` folder in VS Code.
2. Make and save the website changes.
3. Preview or test the site locally when possible.
4. Check what changed:

   ```powershell
   git status
   ```

5. Stage the changes:

   ```powershell
   git add .
   ```

6. Create a commit with a short description:

   ```powershell
   git commit -m "Describe the website update"
   ```

7. Push the commit to the production branch:

   ```powershell
   git push origin main
   ```

8. Wait for the hosting service to build and deploy the new version.
9. Open `coryhanna.com` and verify the change on desktop and mobile.

Practical example:

```powershell
git add .
git commit -m "Fix mobile navigation and resume downloads"
git push origin main
```

## What the pieces mean

| Piece | Purpose |
|---|---|
| Local project folder | The copy of the website edited on the computer |
| Git | Tracks changes and creates a history of the project |
| GitHub repository | Stores the project online and provides a backup/change history |
| `origin` | The local nickname for the GitHub repository |
| `main` | The production branch containing the live version of the site |
| Commit | A saved checkpoint containing a group of changes |
| Push | Sends local commits to GitHub |
| Hosting/deployment service | Builds the GitHub project and serves it at `coryhanna.com` |
| Custom domain | The public web address visitors use |

## Troubleshooting reference

### `remote origin already exists`

Meaning: the repository is already connected to a remote called `origin`.

Check it with:

```powershell
git remote -v
```

Do not repeatedly run `git remote add origin`. If the displayed URL is already correct, leave it alone.

### `fatal: not a git repository`

Meaning: the terminal is not currently inside the website's Git folder.

Fix:

```powershell
cd "C:\Users\Cory Hanna\OneDrive\Desktop\VS Code\coryhanna.com"
git status
```

### GitHub authentication opens a localhost page

Meaning: the browser is returning the GitHub authorization result to the application on the same computer. Seeing `127.0.0.1` during that sign-in flow is normal.

The important confirmation is:

```text
Authentication Succeeded
```

### A pushed change is not visible immediately

Check these items in order:

1. Confirm the commit was pushed to `main`.
2. Check the deployment dashboard for a build in progress or a failed build.
3. Refresh the live page after the deployment completes.
4. Test in a private/incognito window if the browser appears to show an older cached version.
5. Confirm both desktop and mobile layouts because responsive issues may only appear at smaller screen widths.

### A download link breaks

Confirm all three match exactly:

- The file exists in the deployed project.
- The capitalization in the link matches the actual filename.
- The path and filename in the HTML/code match the deployed file.

GitHub and web hosting can treat capitalization as significant even when Windows appears not to.

## Safe Git habits for this project

- Run `git status` before committing or pushing.
- Use a clear commit message describing the change.
- Keep stable, simple asset filenames.
- Treat `main` as the live production branch.
- Avoid force-pushing to `main`.
- Test navigation, links, and downloads after every deployment.
- Check the site on both desktop and an actual phone after layout changes.
- Do not paste OAuth callback codes, passwords, tokens, or private keys into project files or public GitHub issues.

## Final project state on August 22, 2026

- GitHub repository created/available at `CoryHanna/coryhanna.com`.
- Local project connected to the GitHub repository through `origin`.
- GitHub authentication completed successfully.
- `main` established as the production branch.
- Hosting/deployment connection completed.
- `coryhanna.com` live.
- Orange site design live.
- Mobile navigation working.
- Mobile blue navigation indicator/bar issue fixed.
- PDF resume download working.
- Word resume download working.
- A repeatable edit → commit → push → deploy workflow is now in place.

## One-sentence recap

Today, `coryhanna.com` went from a local website project to a live, GitHub-backed production site with automatic deployment from `main`, a finished orange design, working mobile navigation, and functional PDF and Word resume downloads.
