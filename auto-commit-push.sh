#!/usr/bin/env bash

# -----------------------------------------------------------------------------
# Script: auto-commit-push.sh
#
# Description:
#   1. Pull latest changes from the remote repository.
#   2. Stage all local changes (e.g., new or modified files).
#   3. Commit with a message that includes the current date/time.
#   4. Push the commit to the remote repository.
#
# Note:
#   This script assumes you are on a branch you wish to pull and push to.
#   It also does NOT handle merge conflicts automatically. If a conflict arises,
#   you'll need to resolve it manually, then run the script again.
# -----------------------------------------------------------------------------

# 1. Pull the latest changes
echo "Pulling latest changes from remote..."
git pull
if [ $? -ne 0 ]; then
  echo "Error: git pull failed. Please fix merge conflicts or check your connection."
  exit 1
fi

# 2. Stage all changes
echo "Staging all changed files..."
git add .

# 3. Commit with a timestamped message
CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MESSAGE="Auto-commit on ${CURRENT_TIME}"
echo "Committing changes with message: ${COMMIT_MESSAGE}"
git commit -m "${COMMIT_MESSAGE}"

# 4. Push to remote
echo "Pushing commits to remote..."
git push
if [ $? -ne 0 ]; then
  echo "Error: git push failed. Check your remote settings or network connection."
  exit 1
fi

echo "Done! All local changes have been pushed to the remote repository."