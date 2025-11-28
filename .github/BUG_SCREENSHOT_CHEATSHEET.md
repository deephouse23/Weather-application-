# Bug Screenshot Cheatsheet

**Quick reference for taking and organizing bug screenshots**

---

## 🚀 Quick Workflow

1. **Find bug** → 2. **Screenshot** → 3. **Save** → 4. **Document** → 5. **Ask Claude**

---

## 1. Take Screenshot

### Windows
```
Win + Shift + S   → Snipping tool (recommended)
Win + PrtScn      → Full screen
```

### Mac
```
Cmd + Shift + 4   → Area selection
Cmd + Shift + 5   → Screenshot menu
```

### Browser DevTools
```
F12 → Cmd/Ctrl + Shift + P → Type "screenshot" → Select option
```

---

## 2. Save with Good Name

### Format
```
[category]-[description]-[date].png
```

### Examples
```
✅ auth-login-fails-2025-01-15.png
✅ radar-not-loading.png
✅ location-shows-wrong-city.png

❌ Screenshot 1.png
❌ bug.png
```

### Where to Save
```
.github/images/bugs/[descriptive-name].png
```

---

## 3. Create Bug Doc

### Quick Template
```bash
# Copy template
cp .github/bugs/bug-template-simple.md \
   .github/bugs/[bug-name].md
```

### Minimum Info
```markdown
# Bug: [Title]

![Screenshot](./../images/bugs/[name].png)

## Issue
[One sentence]

## Reproduce
1. Step 1
2. Step 2
3. Bug happens

## Expected
[What should happen]

## Actual
[What happens]
```

---

## 4. Ask Claude for Help

### Good Prompt Template
````markdown
I have a UI bug. Here's the screenshot:
[Upload or path: .github/images/bugs/[name].png]

**Bug:** [One-line description]

**Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected:** [What should happen]
**Actual:** [What happens]

**Files involved:**
- lib/[file].ts
- components/[component].tsx

**Request:** Please analyze and suggest:
1. Likely cause
2. Files to check
3. How to fix
````

### What to Include
- ✅ Clear screenshot
- ✅ Steps to reproduce
- ✅ Expected vs actual
- ✅ Related files
- ✅ What you've tried

### What NOT to do
- ❌ Just upload with no context
- ❌ Say "fix this" without details
- ❌ Include sensitive data

---

## 5. After Bug is Fixed

### Option A: Archive
```bash
mv .github/images/bugs/[bug].png \
   archive/screenshots/2025/[bug]-fixed.png
```

### Option B: Delete
```bash
rm .github/images/bugs/[bug].png
rm .github/bugs/[bug].md
```

---

## 📁 Folder Reference

```
.github/
├── images/
│   ├── bugs/         ← Bug screenshots (temp, don't commit)
│   ├── features/     ← Feature screenshots (commit)
│   └── comparisons/  ← Before/after (commit)
│
└── bugs/
    ├── bug-template-simple.md
    └── [your-bug-reports].md

archive/
└── screenshots/      ← Resolved bugs (optional)
    └── 2025/
```

---

## 🎯 Quick Tips

### DO:
- ✅ Use descriptive filenames
- ✅ Include date if helpful
- ✅ Capture full context (not just the bug)
- ✅ Document immediately while fresh
- ✅ Provide steps to reproduce
- ✅ Clean up after fixing

### DON'T:
- ❌ Generic names like "screenshot1.png"
- ❌ Save to root directory
- ❌ Include API keys or sensitive data
- ❌ Forget to document the bug
- ❌ Leave fixed bugs in bugs/ folder

---

## 🔧 Common Scenarios

### Scenario 1: Simple UI Bug
```
1. Screenshot → Win+Shift+S
2. Save → .github/images/bugs/button-not-clickable.png
3. Quick doc → .github/bugs/button-bug.md
4. Ask Claude with screenshot + context
```

### Scenario 2: Responsive Bug
```
1. Desktop screenshot → desktop-ok.png
2. Mobile screenshot → mobile-broken.png
3. Document both in bug report
4. Ask Claude to compare
```

### Scenario 3: Console Error
```
1. Bug screenshot
2. Console screenshot
3. Network tab screenshot (if API)
4. Include all in bug doc
5. Ask Claude with all context
```

---

## 🤖 Claude Prompt Examples

### Example 1: Simple Bug
```
Bug screenshot: .github/images/bugs/theme-not-saving.png

Issue: Theme selection not persisting after refresh

Reproduce:
1. Go to dashboard
2. Change theme to Miami
3. Refresh page
4. Theme reverts to Dark

Expected: Theme should persist
Actual: Reverts to default

Related: lib/theme-service.ts

What's the issue and how do I fix it?
```

### Example 2: Layout Bug
```
I have a responsive layout bug:

Desktop (working): .github/images/bugs/layout-desktop-ok.png
Mobile (broken): .github/images/bugs/layout-mobile-broken.png

The news card grid breaks on mobile. Cards overflow container.

Component: components/news/NewsGrid.tsx
Styles: Tailwind CSS grid

Please analyze and suggest responsive fixes.
```

### Example 3: Console Error
```
Bug with console errors:

Screenshot: .github/images/bugs/radar-error.png
Console: .github/images/bugs/radar-console.png

Error: "Cannot read property 'map' of undefined"
Location: components/weather-map-openlayers.tsx:145

Happens when: Loading radar data
Expected: Radar should load
Actual: White screen + console error

Please help debug this error.
```

---

## ⚡ Keyboard Shortcuts

### Screenshot
- Windows: `Win + Shift + S`
- Mac: `Cmd + Shift + 4`
- Browser: `Ctrl/Cmd + Shift + P` → "screenshot"

### File Navigation
```bash
# Open bugs folder
cd .github/bugs

# List bug screenshots
ls .github/images/bugs/

# Archive screenshot
mv .github/images/bugs/[name].png archive/screenshots/2025/
```

---

## 📚 Full Documentation

**Complete guide:** `.github/VISUAL_BUG_TRACKING.md`
**Templates:** `.github/bugs/bug-template-*.md`
**Examples:** `.github/images/README.md`

---

**Last Updated:** January 2025
