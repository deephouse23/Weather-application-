#!/bin/bash

# Script to create v0.3.3 branch and commit Phase 1 of News Ticker feature

echo "Creating new branch v0.3.3 for News Ticker feature..."

# Ensure we're in the right directory
cd "C:\Users\justi\OneDrive\Desktop\Weather-application--main"

# Check current branch
echo "Current branch:"
git branch --show-current

# Stash any uncommitted changes
echo "Stashing any uncommitted changes..."
git stash

# Create and checkout new branch
echo "Creating and switching to branch v0.3.3..."
git checkout -b v0.3.3

# Add the new News Ticker files
echo "Adding News Ticker component files..."
git add components/NewsTicker/index.tsx
git add components/NewsTicker/NewsTicker.tsx
git add components/NewsTicker/NewsTickerItem.tsx
git add components/NewsTicker/NewsTicker.module.css
git add components/NewsTicker/NewsTicker.test.tsx

# Add the updated navigation component
echo "Adding updated navigation component..."
git add components/navigation.tsx

# Commit the changes
echo "Committing Phase 1 of News Ticker feature..."
git commit -m "feat(news-ticker): Phase 1 - Foundation implementation

- Created NewsTicker component with mock data
- Added horizontal scrolling animation
- Implemented pause/play and speed controls
- Added close button with localStorage persistence
- Integrated ticker into navigation component
- Added category filtering (breaking, weather, local, general)
- Added priority system (high, medium, low)
- Created responsive design for mobile
- Added theme support (dark, miami, tron)
- Implemented basic click-through functionality
- Added unit tests for core functionality

Phase 1 complete: Foundation with mock data ready for Phase 2 API integration"

echo "Branch v0.3.3 created and Phase 1 committed successfully!"
echo ""
echo "Next steps for Phase 2:"
echo "1. Set up news API service layer"
echo "2. Implement real-time data fetching"
echo "3. Add error handling and fallbacks"
echo "4. Create caching strategy"
echo ""
echo "To push to remote: git push -u origin v0.3.3"