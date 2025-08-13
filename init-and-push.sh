#!/bin/bash
# init-and-push.sh — Initialize, commit, and push the Flashbot Rescue repo to GitHub

# === CONFIG ===
GITHUB_USER="YourGitHubUsername"
REPO_NAME="flashbot-rescue"
DESCRIPTION="Flashbots ERC20 rescue bot with Geth integration"
PRIVATE=true   # set to false if you want it public

# === CHECK GITHUB CLI ===
if ! command -v gh &> /dev/null
then
    echo "[ERROR] GitHub CLI (gh) is not installed. Install from: https://cli.github.com/"
    exit 1
fi

# === INIT LOCAL GIT ===
cd "$(dirname "$0")" || exit 1

echo "[INFO] Initializing local git repo..."
git init
git add .
git commit -m "Initial commit - Flashbot Rescue Bot"

# === CREATE GITHUB REPO ===
if [ "$PRIVATE" = true ]; then
    gh repo create "$GITHUB_USER/$REPO_NAME" --private --description "$DESCRIPTION" --source=. --remote=origin --push
else
    gh repo create "$GITHUB_USER/$REPO_NAME" --public --description "$DESCRIPTION" --source=. --remote=origin --push
fi

echo "[OK] Repository created and pushed to GitHub: https://github.com/$GITHUB_USER/$REPO_NAME"
