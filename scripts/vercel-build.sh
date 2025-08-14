#!/bin/bash

# Vercel build script with private submodule support
set -e

echo "🔧 Setting up private submodule access..."

if [ -n "$GITHUB_PAT" ]; then
  echo "📝 Configuring git credentials for private submodules..."
  
  # Configure submodule URLs to use the personal access token
  if [ -f .gitmodules ]; then
    # Process all submodules from .gitmodules
    while IFS= read -r line; do
      if [[ "$line" == \[submodule* ]]; then
        # Extract submodule name from [submodule "name"] line
        submodule_name=$(echo "$line" | sed 's/\[submodule "\(.*\)"\]/\1/')
        submodule_path=$(git config -f .gitmodules --get "submodule.$submodule_name.path")
        submodule_url=$(git config -f .gitmodules --get "submodule.$submodule_name.url")
        
        if [ -n "$submodule_path" ] && [ -n "$submodule_url" ]; then
          # Convert SSH URL to HTTPS with token if needed
          if [[ "$submodule_url" == git@github.com:* ]]; then
            # Convert git@github.com:user/repo.git to https://token@github.com/user/repo.git
            https_url=$(echo "$submodule_url" | sed "s|git@github.com:|https://${GITHUB_PAT}@github.com/|")
          elif [[ "$submodule_url" == https://github.com/* ]]; then
            # Add token to existing HTTPS URL
            https_url=$(echo "$submodule_url" | sed "s|https://github.com/|https://${GITHUB_PAT}@github.com/|")
          else
            https_url="$submodule_url"
          fi
          
          echo "🔗 Setting submodule URL: $submodule_path"
          git submodule set-url "$submodule_path" "$https_url"
        fi
      fi
    done < .gitmodules
    
    # Sync all submodules after URL updates
    git submodule sync
  fi
else
  echo "⚠️  No GITHUB_PAT found - submodule may not be accessible if private"
fi

echo "📦 Initializing submodules..."
git submodule update --init --recursive

echo "🖼️  Syncing Obsidian images..."
node scripts/sync-obsidian-images.js

echo "🚀 Building Astro site..."
astro build

echo "✅ Build complete!"