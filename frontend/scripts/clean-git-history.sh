#!/bin/bash
# Git history cleanup script for sensitive data files
# This will rewrite git history to remove sensitive files

echo "⚠️  WARNING: This will rewrite git history!"
echo "This operation cannot be undone easily."
echo ""
echo "Files to remove from history:"
echo "  - data/users.json"
echo "  - data/bans.json"
echo "  - data/reports.json"
echo "  - data/appeals.json"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Creating backup branch..."
git branch backup-before-cleanup

echo ""
echo "Removing sensitive files from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch data/users.json data/bans.json data/reports.json data/appeals.json" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "Cleaning up refs..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

echo ""
echo "Running garbage collection..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "⚠️  IMPORTANT: You must force push to update the remote:"
echo "   git push --force --all"
echo "   git push --force --tags"
echo ""
echo "⚠️  WARNING: Force pushing will overwrite remote history!"
echo "   Make sure all collaborators are aware and have pulled the cleaned history."
