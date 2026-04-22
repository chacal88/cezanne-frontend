# Visual Parity Gaps: Legacy vs Greenfield

## Critical Differences Identified

### 1. SIDEBAR STYLING & LAYOUT
**Legacy:** 
- Compact sidebar with icons only (collapsed state)
- Navigation items show only icons on left side
- Very narrow sidebar width (~60-70px estimated)

**Greenfield:**
- Expanded sidebar showing full text labels
- Grid layout: 130px (authenticated-shell.css line 4)
- All navigation items fully visible with text
- Sidebar is 130px wide, double the legacy width

**Action Required:**
- Implement collapsed/expanded toggle for sidebar
- Reduce sidebar width or make text labels hidden in default state
- Add visual parity with legacy's compact appearance

---

### 2. TABLE NAME CELL FORMATTING
**Legacy:**
- Candidate name in bold
- Subtitle line with email address (appears inline within same cell)
- Two-line layout within single cell

**Greenfield:**
- Candidate name in bold
- Subtitle shows "Product recruiter shortlist" (hardcoded text)
- Different secondary text than legacy

**Action Required:**
- Change subtitle text from "Product recruiter shortlist" to actual email address
- Match the two-line layout appearance

---

### 3. ADD NEW BUTTON STYLING
**Legacy:**
- Green button with checkmark icon
- Text: "✓ Add new"
- Specific styling

**Greenfield:**
- Green button with dropdown arrow
- Text: "+ Add new"
- Different icon representation

**Action Required:**
- Update button icon from "+" to "✓"
- Verify visual styling matches legacy

---

### 4. ICON IN LAST TABLE COLUMN
**Legacy:**
- Small external link/open icon (↗)
- Appears to be consistent across all rows
- Icon color: teal/green

**Greenfield:**
- Shows "↗" character
- Styling appears similar but may need verification

**Status:** Appears correct, needs visual confirmation

---

### 5. TABLE HEADER STYLING
**Legacy:**
- Font weight and size appear slightly different
- Header background color: appears to be light gray
- Padding and spacing specific

**Greenfield:**
- Using CSS classes from candidate-composition.css (lines 210-224)
- Background: #f7f8fa
- Font size: 15px
- Font weight: 600
- Padding: 18px 20px

**Action Required:**
- Verify header font size and weight match legacy exactly
- Verify background color matches

---

### 6. CANDIDATE DATABASE LAYOUT
**Legacy:**
- Main content area appears narrower
- Left sidebar with filters/lists
- Different grid proportions

**Greenfield:**
- Grid: 270px sidebar + minmax(0, 1fr) main (line 154)
- Sidebar width: 270px

**Action Required:**
- Compare grid proportions with legacy
- Adjust sidebar/main content width ratio if needed

---

### 7. PADDING & SPACING
**Legacy:**
- Appears more compact overall
- Less vertical padding in cells
- Tighter line heights

**Greenfield:**
- More generous padding: 18px 20px for table cells (line 212)
- More spacing overall

**Action Required:**
- Reduce padding values
- Decrease gaps between elements
- Make layout more compact

---

### 8. BULK ACTIONS TOOLBAR
**Legacy:**
- "Bulk Actions" button styling
- Button appears grayed out/disabled by default
- Toolbar layout

**Greenfield:**
- Uses candidate-db-bulk-button class
- Border: #cfd4da
- Background: #fff
- Color: #4b5563
- Styling appears similar

**Status:** Likely needs visual verification

---

## Summary

**High Priority:**
1. Sidebar collapse/expand (width and text visibility)
2. Table name cell content (change "Product recruiter shortlist" to email)
3. Overall spacing/padding reduction

**Medium Priority:**
1. Button icons and styling
2. Table header appearance
3. Layout width ratios

**Low Priority:**
1. Fine-tuning colors and borders
2. Icon styling details

## Files to Modify

1. `/src/shell/layout/authenticated-shell.tsx` - Sidebar toggle logic
2. `/src/shell/layout/authenticated-shell.css` - Sidebar width/display
3. `/src/domains/candidates/database/candidate-database-page.tsx` - Table cell content
4. `/src/domains/candidates/candidate-composition.css` - Spacing/padding values
