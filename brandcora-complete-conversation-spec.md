# Brandcora — Complete Product, UI/UX, Dashboard, and Functionality Specification

## Purpose

This document consolidates the full Brandcora discussion into one implementation-ready Markdown specification. It covers the corrected product definition, landing-page direction, hero refinements, dashboard architecture, user journeys, interface rules, backend behavior, data model, API expectations, security, testing, and acceptance criteria.

Live landing page discussed during the project:

`https://brandcora.vercel.app/`

---

# 1. Product Definition

Brandcora is a **brand-intelligence, design-system extraction, and creative-compliance platform**.

A user pastes a public website URL. Brandcora analyzes the website and extracts its visual identity, including:

- Logos and logo variants
- Wordmarks, symbols, favicons, and icons
- Brand colors, neutral colors, semantic colors, and gradients
- Typography families, weights, sizes, line heights, and letter spacing
- Spacing values, margins, padding, gaps, and container widths
- Border radii, borders, shadows, and focus styles
- Buttons, inputs, cards, navigation, tags, and repeated components
- Layout rules and reusable design tokens

The extracted system is stored as a structured Brand Identity and may be exported as JSON.

After a Brand Identity is approved, the user can upload a social media image, campaign asset, advertisement, presentation, or other creative. Brandcora compares the uploaded asset against the approved Brand Identity and produces a detailed report covering:

- Logo usage and clear space
- Color accuracy
- Typography consistency
- Spacing and alignment
- Border-radius consistency
- Icon style
- Image treatment
- Contrast
- Gradient usage
- Component consistency
- Overall brand alignment

## Core Workflow

```text
PASTE WEBSITE URL
        ↓
SCAN WEBSITE
        ↓
EXTRACT VISUAL IDENTITY
        ↓
STRUCTURE BRAND SYSTEM
        ↓
REVIEW AND APPROVE
        ↓
STORE OR EXPORT AS JSON
        ↓
UPLOAD CREATIVE ASSET
        ↓
COMPARE AGAINST BRAND IDENTITY
        ↓
GENERATE DETAILED REPORT
        ↓
CORRECT ISSUES
        ↓
UPLOAD A REVISION
```

Simplified product narrative:

```text
DISCOVER → STRUCTURE → EXPORT → VALIDATE
```

## Product Positioning

Brandcora should be positioned as:

- A brand identity scanner
- A brand intelligence engine
- A visual design-system generator
- A structured brand database
- A design-token extraction tool
- A creative quality-control platform
- A brand consistency validator
- A brand-governance system

Brandcora should not be positioned as:

- A simple website scraper
- A color-palette generator
- A logo downloader
- An SVG asset library
- A template marketplace
- A website builder
- A generic AI assistant
- A generic analytics dashboard

## Primary Audiences

- Brand designers
- Creative directors
- Brand managers
- Product designers
- Design-system teams
- Marketing teams
- Social media teams
- Agencies
- Developers
- Creative operations teams
- Enterprises managing multiple brands

---

# 2. Main Product Message

Recommended headline:

> Turn your website into a usable brand system.

Recommended supporting copy:

> Paste a website URL to identify its colors, typography, logos, icons, spacing, radius, and reusable design tokens. Store the identity, export it as JSON, and check future creative assets for brand consistency.

Alternative positioning lines:

- Decode the visual DNA of any website.
- Your website already contains a brand system. Brandcora makes it usable.
- Discover, structure, and protect your brand identity.
- Your brand already lives inside your website. Brandcora makes it visible, structured, and enforceable.

---

# 3. Visual References and Design Direction

Two landing-page references were provided.

The first reference contributed:

- Premium atmospheric presentation
- Soft lavender and neutral backgrounds
- Cinematic gradient lighting
- Large immersive visual sections
- Rounded content areas
- Dark feature panels
- Controlled dimensional composition

The second reference contributed:

- Editorial typography
- Asymmetrical layouts
- Strong serif and sans-serif contrast
- Selective italic emphasis
- Dramatic cropping
- Intentional white space
- Bold but controlled gradient transitions
- Alternating narrow and wide content columns

A finance dashboard reference was also provided. The dashboard should borrow:

- Compact application shell
- Narrow left navigation
- Balanced card layout
- Soft gray page background
- White or warm-white workspace
- Restrained typography
- Compact controls
- Dense but usable information hierarchy

Do not copy finance content, charts, labels, or exact layouts.

## Global Design Principles

Brandcora should feel:

- Minimal
- Calm
- Precise
- Premium
- Professional
- Technically credible
- Designed for designers
- Editorial but usable
- Information-rich without being crowded

Avoid:

- Generic SaaS layouts
- Oversized marketing headlines
- Oversized buttons
- Oversized inputs
- Excessive gradients
- Random floating cards
- Heavy glassmorphism
- Generic blue-purple gradients
- Neon cyberpunk styling
- Meaningless 3D blobs
- Stock photography
- Fake AI imagery
- Repeated three-column feature cards
- Excessive shadows
- Excessive corner radius
- Decorative motion unrelated to the product
- Disconnected UI fragments

---

# 4. Landing Page Architecture

Recommended structure:

1. Navigation
2. Minimal hero with working URL input
3. Product proof strip
4. Brand drift problem
5. Website extraction workflow
6. Extracted Brand Identity
7. Design-token and JSON export
8. Creative validation workflow
9. Before-and-after corrections
10. Brand alignment report
11. Team use cases
12. Pricing
13. Final URL call to action
14. Footer

The landing page must explain the complete workflow quickly:

```text
Paste URL → Extract Brand Identity → Export Tokens → Validate Creative
```

## Navigation

Suggested items:

- Product
- Extraction
- Brand Check
- Developers
- Pricing
- Log in
- Analyze a website

Requirements:

- Minimal and sticky
- Integrated with the hero initially
- Compact floating state after scrolling
- Subtle border and blur
- No oversized navigation pills

---

# 5. Hero Section Specification

The hero was specifically corrected because earlier iterations were too large, awkward, and visually unbalanced.

## Hero Copy

Eyebrow:

> Brand intelligence for creative teams

Headline:

> Turn your website into a usable brand system.

Description:

> Paste a website URL to identify its colors, typography, logos, icons, spacing, radius, and reusable design tokens. Store the identity, export it as JSON, and check future creative assets for brand consistency.

URL placeholder:

`https://yourwebsite.com`

Primary action:

> Analyze website

Secondary action:

> View sample report →

Microcopy:

> No signup required for the initial scan.

## Hero Layout

Desktop:

- Two-column layout
- Left copy area: 5 columns
- Right product visual: 7 columns
- Maximum width: 1200–1280px
- Horizontal page padding: 48–64px
- Column gap: 64–80px
- Top padding: 96–112px
- Bottom padding: 80–96px
- Do not force full viewport height

Tablet:

- Stacked layout
- Copy first
- URL form second
- Product preview third

Mobile:

- Single column
- Left aligned
- Page padding: 20–24px
- Product preview below the form

## Hero Typography

Desktop headline:

- 56–64px
- Maximum three lines
- Line height: 1.02–1.08
- Font weight: 550–650
- Letter spacing: about -0.03em
- Maximum width: 620px

Tablet headline:

- 46–52px

Mobile headline:

- 36–42px
- Maximum four lines
- Line height: 1.06–1.12

Description:

- Desktop: 17–18px
- Mobile: 16px
- Line height: 1.55–1.65
- Maximum width: 560px

Do not use 80–112px hero headlines, full-gradient text, several competing typefaces, or vague copy.

## URL Input

Desktop form maximum width:

- 500–560px

Input and button height:

- 48px
- Never exceed 52px

Input width:

- Roughly 340–390px desktop

Button width:

- Roughly 140–160px
- Content based

Input styling:

- Radius: 10–12px
- Border: 1px neutral
- Padding: 14–16px
- Font: 15–16px
- Clear focus state
- No gradient border
- No heavy shadow
- No glassmorphism

Button styling:

- Radius: 10–12px
- Font: 14–15px
- Weight: 550–600
- Padding: 18–22px
- Optional icon: 14–16px
- No oversized pill
- No dramatic glow

Gap:

- 8px desktop
- 8–10px when stacked on mobile

## URL Functionality

The input must:

- Accept full URLs
- Accept domains without `https://`
- Normalize valid domains
- Submit on Enter
- Submit from the button
- Connect to the real scan workflow
- Preserve the submitted URL
- Show real loading and error states
- Avoid placeholder links or `#` destinations

Messages:

Empty:

> Enter a website URL to continue.

Invalid:

> Enter a valid website address.

Unreachable:

> We couldn’t access this website. Check the URL and try again.

Loading button:

> Analyzing…

## Hero Product Visual

Show one coherent product visualization:

1. Website preview
2. Restrained scan state
3. Small set of extracted properties
4. Compact Brand Identity panel

Suggested values:

- 6 colors
- 2 typefaces
- 4 logo variants
- 8 spacing values
- 3 radius values

Requirements:

- Website preview is primary
- Extraction panel is secondary
- Metadata is tertiary
- No decorative floating cards
- No disconnected product fragments
- Do not compress the entire product into the hero

Maximum desktop width:

- 560–620px

Maximum desktop height:

- Around 480px

## Hero Motion

Initial load:

- Eyebrow fades in
- Headline moves upward 8–12px
- Description fades in
- Form fades in
- Product visual scales from 0.98 to 1

Duration:

- 500–750ms

The scanner may pass once and detected values may appear once. Stop the main animation afterward.

Avoid cursor parallax, continuous floating, heavy springs, dramatic 3D rotation, or constant gradient movement.

---

# 6. Landing-Page Product Sections

## Brand Drift

Heading:

> Brand drift rarely happens all at once.

Show several versions of one creative with subtle inconsistencies:

- Wrong brand color
- Incorrect font
- Reduced logo size
- Incorrect border radius
- Inconsistent spacing
- Unapproved gradient

## Website Extraction

Heading:

> Everything Brandcora finds inside a single URL.

Categories:

1. Colors
2. Typography
3. Logos and assets
4. Spacing and layout
5. Radius, borders, and shadows
6. Components

## Brand Profile

Heading:

> Scattered visual decisions become one usable system.

Show:

- Brand overview
- Approved logos
- Color system
- Typography
- Icon library
- Spacing scale
- Radius scale
- Gradients
- Components
- Usage rules
- Version history

## JSON Export

Heading:

> Visual identity, converted into structured data.

Actions:

- Export JSON
- Copy tokens
- Download assets
- Connect API

The export must use real stored values.

## Creative Validation

Heading:

> Check every creative before it goes live.

Analyze:

- Logo variant
- Logo size and clear space
- Colors
- Typography
- Font size and weight
- Spacing and alignment
- Radius
- Icon style
- Image treatment
- Contrast
- Gradients
- Components

## Brand Match Score

Do not use a giant circular gauge.

Use:

```text
BRAND MATCH
86 / 100
```

Category breakdown:

- Logo
- Color
- Typography
- Spacing
- Components
- Contrast
- Gradient

Status language:

- On brand
- Minor inconsistencies
- Needs review
- Significant deviation

---

# 7. Dashboard Information Architecture

Brandcora has three primary dashboard tabs:

1. Brand Identity
2. Reports
3. Settings

## Dependency Rule

Reports depends on Brand Identity.

The user must:

1. Submit a website URL
2. Complete a scan
3. Review the extracted system
4. Approve a Brand Identity
5. Upload a creative asset
6. Generate a report

Reports should remain visible while locked. When no approved Brand Identity exists:

- Show a lock indicator
- Explain the dependency
- Include a button to create a Brand Identity
- Do not hide the tab
- Do not leave it silently disabled

## Suggested Routes

```text
/dashboard/brand-identity
/dashboard/brand-identity/overview
/dashboard/brand-identity/scans
/dashboard/brand-identity/colors
/dashboard/brand-identity/typography
/dashboard/brand-identity/assets
/dashboard/brand-identity/layout
/dashboard/brand-identity/components
/dashboard/brand-identity/tokens
/dashboard/brand-identity/versions

/dashboard/reports
/dashboard/reports/new
/dashboard/reports/:report-id
/dashboard/reports/:report-id/issues
/dashboard/reports/:report-id/comparison

/dashboard/settings
/dashboard/settings/workspace
/dashboard/settings/team
/dashboard/settings/integrations
/dashboard/settings/export
/dashboard/settings/security
/dashboard/settings/billing
```

---

# 8. Dashboard Application Shell

## Shell

- Soft-gray page background
- White or warm-white application surface
- Maximum width: 1440px
- Viewport padding: 24px
- Shell radius: 20–24px
- Subtle border
- Soft shadow
- Height near `calc(100vh - 48px)`

## Left Navigation

Primary items:

- Brand Identity
- Reports
- Settings

Bottom utilities:

- Help
- Documentation
- Sign out

Collapsed width:

- 64–72px

Expanded width:

- 220–240px

Active item:

- Dark neutral or subtle accent tint
- High-contrast icon
- Small active indicator
- No oversized pill

## Top Bar

Left:

- Brandcora wordmark
- Workspace name
- Brand selector

Middle:

- Page title or breadcrumb

Right:

- Search
- Notifications
- Help
- User profile

Height:

- 56–64px

---

# 9. Brand Identity Tab

Internal tabs:

- Overview
- Scans
- Colors
- Typography
- Logos or Assets
- Spacing and Radius
- Components
- Tokens
- Versions

## Scans Tab

The website URL must be submitted from this tab.

The tab includes:

- URL input
- Scan button
- Scan history
- Active scan state
- Progress
- Errors
- Retry
- Cancel where supported
- Completed scan details

Results populate:

- Overview
- Colors
- Typography
- Assets
- Spacing and Radius
- Components
- Tokens
- Versions

## First-Time State

Title:

> Create your brand identity

Description:

> Enter your website URL and Brandcora will identify its colors, typography, logos, icons, spacing, radius, and reusable design tokens.

Input:

`https://yourwebsite.com`

Button:

> Analyze website

Requirements:

- Maximum form width: 560px
- Input and button height: 44–48px
- Horizontal on desktop
- Vertical on mobile
- Enter submits
- Real validation
- No oversized onboarding illustration

## Scan Stages

1. Connecting to website
2. Discovering pages
3. Reading styles
4. Detecting visual assets
5. Building design tokens
6. Preparing Brand Profile

Display:

- Current stage
- Real progress
- Pages discovered
- Pages analyzed
- Warnings
- Activity log
- Run in background
- Cancel where supported

## Review and Approval

After completion:

- Show extracted categories
- Show warnings and confidence
- Allow edits where supported
- Approve Brand Identity
- Create an immutable Brand Version
- Unlock Reports

Confirmation:

> Your brand identity is ready.

Actions:

- Create first report
- Explore brand identity

## Returning User Overview

Header:

> Good morning, [Name]

Secondary text:

> Your brand identity is active and ready for creative checks.

Heading size:

- 28–34px desktop
- 24–28px mobile

Summary cards:

- Identity status
- Last scan
- Brand assets
- Design tokens
- Reports this month
- Open issues

## Overview Layout

Top row:

- Brand Profile
- Scan Status
- Identity Completeness

Second row:

- Colors and Gradients
- Typography

Third row:

- Logos and Assets
- Spacing and Radius
- Components

Fourth row:

- Recent changes
- Version history
- Reports requiring attention

## Identity Completeness

Show category status rows for:

- Logo
- Colors
- Typography
- Icons
- Spacing
- Radius
- Components

Do not use a meaningless circular percentage.

## Tokens View

Each row:

- Token name
- Visual preview
- Value
- Usage count
- Source count
- Approval state
- Copy action
- Edit action

Actions:

- Export JSON
- Copy all tokens

## Versions View

Each version:

- Version number
- Date
- Source URL
- Changes
- Approved by
- Status

Actions:

- Compare
- Restore
- Export

---

# 10. Reports Tab

## Reports Overview

Heading:

> Creative reports

Description:

> Upload a creative asset and compare it with your approved brand identity.

Primary action:

> New report

Summary metrics:

- Reports this month
- Average brand score
- Open issues
- Approved assets

## Reports Table

Columns:

- Asset preview
- Report name
- Brand Profile
- Channel
- Brand score
- Issues
- Status
- Created by
- Date
- Actions

Channels:

- Instagram
- LinkedIn
- Presentation
- Display ad
- Email
- Print

Statuses:

- Processing
- Needs review
- Approved
- Changes requested
- Failed

## New Report Flow

1. Select Brand Identity
2. Upload creative
3. Add optional report name, channel, campaign, and notes
4. Run Brand Check

Initially support:

- PNG
- JPG
- JPEG
- WebP

PDF only when actually supported.

Recommended upload area:

- Maximum width: 640px
- Height: 180–220px
- Compact, not full screen

## Report Processing Stages

1. Preparing asset
2. Detecting content
3. Comparing colors
4. Comparing typography
5. Checking logo usage
6. Measuring spacing and alignment
7. Calculating report

## Report Detail

Desktop layout:

- Creative preview: 7 columns
- Report panel: 5 columns

Header:

- Report name
- Brand Profile
- Date
- Channel
- Status
- Overall score

Actions:

- Download report
- Share
- Reanalyze
- More menu

## Issue List

Each issue includes:

- Severity
- Category
- Title
- Detected value
- Approved value
- Recommendation
- Confidence
- Location
- Status

Severity:

- Critical
- Important
- Minor
- Suggestion

Use restrained colors and always include labels.

## Image Annotations

Clicking a marker should select the issue and scroll it into view.

Clicking an issue should highlight the corresponding region in the image.

## Revisions

Preserve all revisions:

```text
Revision 1 — Score 72
Revision 2 — Score 89
Revision 3 — Score 96
```

---

# 11. Settings Tab

Secondary sections:

- Workspace
- Team
- Brand Defaults
- Integrations
- Export
- Notifications
- Security
- Billing

Roles:

- Owner
- Admin
- Brand Manager
- Designer
- Reviewer
- Viewer

Potential integrations:

- Figma
- Slack
- Webhooks
- API
- Cloud storage

Use statuses:

- Available
- Connected
- Coming soon

Do not claim unsupported integrations or certifications.

---

# 12. Dashboard Visual System

## Typography

- Page title: 28–34px
- Section title: 20–24px
- Card title: 15–18px
- Primary metric: 24–32px
- Body: 14–16px
- Secondary copy: 13–14px
- Labels: 11–13px
- Tables: 13–14px

Use monospace for:

- Token names
- Hex values
- Pixel values
- JSON
- Technical metadata

## Spacing

Use an 8px system:

```text
4, 8, 12, 16, 24, 32, 40, 48
```

- Application padding: 16–20px
- Card padding: 16–20px
- Card gap: 12–16px
- Section gap: 24–32px
- Table row: 48–56px

## Radius

- Small controls: 8px
- Inputs and buttons: 8–10px
- Cards: 12–16px
- Application shell: 20–24px

Avoid large radius on every card.

## Buttons

Primary:

- Height: 40–44px
- Font: 14px
- Padding: 16–20px
- Radius: 8–10px
- Content-based width

Secondary:

- Height: 38–42px
- Neutral border
- Minimal fill

Icon button:

- 36–40px square
- Tooltip required

## Inputs

- Height: 40–44px
- Font: 14px
- Radius: 8–10px
- Visible label
- Clear focus ring
- Helpful errors
- No excessive shadow

## Motion

- 150–220ms control transitions
- Restrained scan line
- Short progress animation
- Smooth issue highlighting
- Subtle panel transitions

Avoid floating cards, bouncing, strong springs, page parallax, or constant animation.

---

# 13. Backend Functional Requirements

The redesigned UI must connect to a real, persistent backend.

Do not redesign the interface while implementing functionality.

## Non-Negotiable Rules

- Preserve the redesigned UI
- Make every relevant button work
- Use real backend requests
- Persist results in the database
- No production mock data
- No random scores
- No fake scan progress
- No console-only actions
- No browser-only result storage
- Results survive refresh
- Reports require an approved Brand Version
- Old reports retain their original Brand Version
- Credentials remain server side

---

# 14. Website Scan Flow

The URL is submitted from:

```text
Brand Identity → Scans
```

After completion, results populate:

- Overview
- Colors
- Typography
- Assets
- Spacing and Radius
- Components
- Tokens
- Versions

## URL Validation

Accept:

- `https://example.com`
- `example.com`
- `www.example.com`
- Valid paths

Normalize:

```text
example.com → https://example.com
```

Reject:

- Empty values
- Invalid URLs
- Unsupported protocols
- localhost
- Private IPs
- Internal addresses
- File URLs
- JavaScript URLs
- Data URLs
- Redirects to private networks

## Scan Creation

When a valid URL is submitted:

1. Disable duplicate submission
2. Show loading state
3. Create a scan record
4. Return a scan ID
5. Start a background job
6. Show real progress
7. Persist progress
8. Restore progress after refresh

## Scan States

```text
queued
connecting
crawling
extracting_assets
extracting_colors
extracting_typography
extracting_layout
extracting_components
generating_tokens
saving_results
completed
completed_with_warnings
failed
cancelled
```

Persist:

- Status
- Progress
- Current stage
- Status message
- Start time
- End time
- Error
- Warnings
- Pages discovered
- Pages analyzed

## Crawl Rules

Analyze public content only.

Do not bypass authentication, paywalls, CAPTCHAs, private pages, or access controls.

Recommended initial limits:

- 10–20 internal pages
- Depth 2
- Same-origin links
- Canonical handling
- Duplicate prevention
- Timeout and response-size limits
- Avoid account, cart, checkout, logout, and destructive links

Use browser rendering for JavaScript-rendered websites when required.

---

# 15. Extraction Requirements

## Colors

Extract:

- CSS variables
- Text colors
- Backgrounds
- Borders
- Fills
- Strokes
- Buttons
- Links
- Semantic colors
- Gradients

Store:

- Original value
- Normalized value
- Alpha
- Suggested token name
- Usage count
- Source pages
- Source selectors
- Role
- Confidence

## Typography

Extract:

- Family
- Source
- Weight
- Style
- Size
- Line height
- Letter spacing
- Text transform
- Role
- Usage
- Sources
- Confidence

Suggested groups:

- display
- heading-1
- heading-2
- heading-3
- body-large
- body
- caption
- label
- button

## Assets

Extract:

- Logos
- Wordmarks
- Symbols
- Favicons
- SVG icons
- Illustrations
- Key visuals

Store:

- Original URL
- Stored URL
- MIME type
- Dimensions
- File size
- Source page
- Usage count
- Type
- Variant
- Confidence

## Spacing and Layout

Extract:

- Padding
- Margin
- Gap
- Section spacing
- Grid gaps
- Container widths
- Alignment
- Breakpoints

Store raw values and normalized token suggestions.

## Radius, Borders, and Shadows

Extract:

- Radius
- Border width
- Border style
- Border color
- Focus rings
- Box shadows
- Text shadows where relevant

## Components

Detect repeated visual patterns:

- Buttons
- Inputs
- Cards
- Navigation
- Tags
- Badges
- Tabs
- Modals
- Accordions

Store category, name, preview, style data, source pages, usage count, variants, and confidence.

---

# 16. Brand Versions and Approval

A completed scan creates a Brand Version with status:

```text
review_required
```

The user may:

- Review
- Edit
- Approve
- Reject
- Archive

Approval must:

1. Mark the version approved
2. Update `activeVersionId`
3. Preserve previous versions
4. Unlock Reports
5. Record approver and approval date

Old reports must continue using the Brand Version selected when they were created.

---

# 17. JSON Export

Export real stored data.

Content type:

`application/json`

Filename example:

`brand-name-brand-tokens-v1.json`

Example:

```json
{
  "brand": {
    "name": "Example",
    "sourceUrl": "https://example.com",
    "version": 1
  },
  "colors": {
    "primary": {
      "value": "#123456",
      "type": "color"
    }
  },
  "typography": {},
  "spacing": {},
  "radius": {},
  "borders": {},
  "shadows": {},
  "assets": {}
}
```

---

# 18. Report Image Analysis

## Dependency

Before creating a report, verify that an approved or explicitly selected Brand Version exists.

If not, show:

> Create and approve a brand identity before running a creative report.

Provide a working link to:

```text
Brand Identity → Scans
```

## Upload

Initially support:

- PNG
- JPG
- JPEG
- WebP

Validate MIME type, file size, dimensions, empty files, and corrupt files.

Persist uploads in object storage.

## Report States

```text
queued
uploading
preparing
analyzing_colors
analyzing_typography
analyzing_logo
analyzing_spacing
analyzing_composition
generating_report
completed
completed_with_warnings
failed
```

## Color Analysis

Use perceptual color distance.

Store:

- Detected color
- Closest approved color
- Distance
- Confidence
- Image region

Do not flag every photographic color.

## Typography Analysis

Use OCR and text-region analysis where supported.

Compare approximate font category, style, weight, size hierarchy, case, and alignment.

Do not claim exact font recognition with low confidence.

## Logo Analysis

Use:

- Feature matching
- Perceptual hashes
- Vector comparison where possible
- Shape similarity
- Placement measurement

Check:

- Approved variant
- Minimum size
- Distortion
- Cropping
- Clear space
- Contrast

## Spacing and Alignment

Measure:

- Edge margins
- Gaps
- Alignment
- Repeated spacing
- Clear space
- Text-to-element spacing

Use tolerance rather than exact equality.

## Radius

Only evaluate UI-like containers. Do not apply radius checks to photographs or organic forms.

## Score

The score must be deterministic.

Suggested weights:

- Logo: 25%
- Color: 20%
- Typography: 20%
- Spacing and alignment: 15%
- Contrast: 10%
- Components and radius: 5%
- Gradients: 5%

If a category cannot be evaluated:

- Mark it not evaluated
- Recalculate using available categories
- Explain the omission
- Do not award a perfect score

## Report Issue Shape

```json
{
  "category": "color",
  "severity": "important",
  "title": "Unapproved accent color",
  "description": "The call-to-action uses a green that differs from the approved primary token.",
  "detectedValue": "#4CAF50",
  "expectedValue": "#61CE70",
  "recommendation": "Replace the detected green with brand.primary.",
  "confidence": 0.92,
  "boundingBox": {
    "x": 0.12,
    "y": 0.64,
    "width": 0.31,
    "height": 0.11
  }
}
```

Use normalized coordinates from 0 to 1.

---

# 19. Suggested Database Model

## Workspace

- id
- name
- ownerId
- createdAt
- updatedAt

## BrandProfile

- id
- workspaceId
- name
- sourceUrl
- faviconUrl
- status
- activeVersionId
- createdAt
- updatedAt

## BrandScan

- id
- brandProfileId
- submittedUrl
- normalizedUrl
- status
- progress
- currentStage
- pagesDiscovered
- pagesAnalyzed
- warnings
- errorCode
- errorMessage
- startedAt
- completedAt
- createdBy
- createdAt

## BrandVersion

- id
- brandProfileId
- scanId
- versionNumber
- status
- approvedBy
- approvedAt
- createdAt

## BrandColor

- id
- brandVersionId
- tokenName
- originalValue
- normalizedValue
- role
- usageCount
- confidence
- sources

## BrandTypography

- id
- brandVersionId
- tokenName
- family
- weight
- style
- size
- lineHeight
- letterSpacing
- role
- usageCount
- confidence
- sources

## BrandAsset

- id
- brandVersionId
- type
- variant
- originalUrl
- storedUrl
- mimeType
- width
- height
- usageCount
- confidence
- sources

## BrandSpacing

- id
- brandVersionId
- tokenName
- rawValue
- normalizedValue
- usageCount
- sources

## BrandRadius

- id
- brandVersionId
- tokenName
- value
- usageCount
- sources

## BrandBorder

- id
- brandVersionId
- tokenName
- width
- style
- color
- usageCount
- sources

## BrandShadow

- id
- brandVersionId
- tokenName
- value
- usageCount
- sources

## BrandGradient

- id
- brandVersionId
- tokenName
- value
- angle
- stops
- usageCount
- sources

## BrandComponent

- id
- brandVersionId
- category
- name
- previewUrl
- styleData
- usageCount
- confidence
- sources

## CreativeReport

- id
- workspaceId
- brandProfileId
- brandVersionId
- name
- channel
- originalAssetUrl
- previewUrl
- mimeType
- width
- height
- status
- overallScore
- summary
- createdBy
- createdAt
- completedAt
- errorMessage

## ReportIssue

- id
- reportId
- category
- severity
- title
- description
- detectedValue
- expectedValue
- recommendation
- confidence
- boundingBox
- status
- createdAt
- updatedAt

## ReportRevision

- id
- reportId
- parentRevisionId
- assetUrl
- score
- createdAt

---

# 20. Suggested API Contract

## Brand Profiles

```text
GET    /api/brand-profiles
GET    /api/brand-profiles/:brandProfileId
POST   /api/brand-profiles
```

## Scans

```text
POST   /api/brand-profiles/:brandProfileId/scans
GET    /api/scans/:scanId
POST   /api/scans/:scanId/cancel
POST   /api/scans/:scanId/retry
GET    /api/brand-profiles/:brandProfileId/scans
```

Create-scan body:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "scanId": "scan_id",
  "status": "queued"
}
```

## Brand Identity

```text
GET    /api/brand-profiles/:brandProfileId/overview
GET    /api/brand-profiles/:brandProfileId/colors
GET    /api/brand-profiles/:brandProfileId/typography
GET    /api/brand-profiles/:brandProfileId/assets
GET    /api/brand-profiles/:brandProfileId/layout
GET    /api/brand-profiles/:brandProfileId/components
GET    /api/brand-profiles/:brandProfileId/tokens
GET    /api/brand-profiles/:brandProfileId/versions
POST   /api/brand-versions/:versionId/approve
PATCH  /api/brand-versions/:versionId/tokens/:tokenId
GET    /api/brand-versions/:versionId/export/json
```

## Reports

```text
POST   /api/reports/upload
GET    /api/reports
GET    /api/reports/:reportId
GET    /api/reports/:reportId/issues
POST   /api/reports/:reportId/retry
POST   /api/reports/:reportId/revisions
PATCH  /api/report-issues/:issueId
```

---

# 21. Frontend Data Wiring

## Scans Tab

- Controlled URL input
- Enter submits
- Button submits
- Duplicate submissions disabled
- Real scan record created
- Real progress displayed
- Refresh restores progress
- Completed scan appears in history
- Failure shows backend error
- Retry works

## Overview Tab

Load:

- Brand status
- Website URL
- Last scan
- Pages analyzed
- Color count
- Typography count
- Asset count
- Spacing count
- Radius count
- Component count
- Current version
- Report count
- Open issues

After scan completion:

- Invalidate or refresh overview
- Update without logout
- Show success notification
- Provide review action

## Version Context

Maintain one explicit context:

- workspaceId
- brandProfileId
- selectedVersionId

Default:

1. Active approved version
2. Otherwise latest completed review version

Never mix data across versions.

## Reports

Each report permanently stores:

- brandProfileId
- brandVersionId

A later Brand Identity scan must not silently alter older reports.

---

# 22. File Storage

Store:

- Scanned logos
- Public website assets where appropriate
- Uploaded creative images
- Generated previews
- Component screenshots
- Optional exported reports

Example paths:

```text
workspaces/{workspaceId}/brands/{brandProfileId}/assets/{uuid}.svg
workspaces/{workspaceId}/reports/{reportId}/original/{uuid}.png
```

Requirements:

- Validate file content, not only extension
- Generate unique keys
- Keep credentials server-side
- Use signed URLs for private assets
- Do not store uploads in the source repository

---

# 23. Security

## Authorization

Verify:

- Authenticated user
- Workspace membership
- Brand Profile access
- Scan permission
- Report permission
- Approval permission
- Settings permission

## SSRF Protection

Block:

- `127.0.0.0/8`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- Link-local addresses
- Cloud metadata addresses
- IPv6 private and loopback ranges
- Redirects to blocked addresses

Revalidate each redirect destination.

Additional requirements:

- Request timeouts
- Response-size limits
- Crawl limits
- MIME checks
- Rate limits
- Job concurrency limits
- Upload limits
- Sanitized logging
- Isolated browser execution
- Never render untrusted site HTML directly in the dashboard

---

# 24. Query Invalidation

After scan completion, refresh:

- Scan history
- Overview
- Colors
- Typography
- Assets
- Layout
- Components
- Tokens
- Versions

After approval, refresh:

- Brand Profile
- Active version
- Reports lock state
- Navigation status
- Overview metrics

After report completion, refresh:

- Reports list
- Report detail
- Overview report metrics
- Open issue count

---

# 25. Functional States

## Brand Identity Scans

- Initial
- Invalid URL
- Submitting
- Queued
- Scanning
- Completed
- Completed with warnings
- Failed
- Cancelled

## Brand Identity Overview

- No profile
- Scan required
- Review required
- Approved and active
- Update available
- Loading
- Error

## Brand Identity Tabs

- Loading
- Data
- No data detected
- Review required
- Error

## Reports

- Locked
- Empty
- Uploading
- Processing
- Completed
- Completed with warnings
- Failed

Use localized skeletons, not full-page spinners.

---

# 26. Accessibility

Ensure:

- Strong contrast
- Visible focus states
- Proper form labels
- Keyboard navigation
- Accessible upload control
- Statuses not communicated only through color
- Screen-reader-friendly scan progress
- Announced errors
- Logical headings
- Touch targets of at least 44px on mobile
- Reduced-motion support
- Tooltips on icon-only controls
- Alternative text for meaningful visuals

---

# 27. Testing Requirements

## URL Tests

- Valid HTTPS URL
- Domain normalization
- Unsupported protocol rejection
- Localhost rejection
- Private IP rejection
- Redirect-to-private rejection
- Unreachable website handling
- Duplicate submission prevention

## Scan Tests

- Scan record creation
- Stage updates
- Result persistence
- Brand Version creation
- Category population
- Previous-version preservation
- Partial extraction handling
- Failure handling

## Approval Tests

- Version approval
- Active version update
- Reports unlock
- Old version preservation

## Report Tests

- Reject report without active identity
- Accept supported image
- Reject unsupported file
- Store upload
- Create report job
- Save category scores
- Save issue bounding boxes
- Use selected Brand Version
- Preserve old reports after a new version
- Support revisions

## Authorization Tests

- No cross-workspace access
- Viewer cannot approve
- Unauthorized uploads fail

## Frontend Integration Tests

- Scan button works
- Enter submits
- Progress updates
- Overview refreshes
- Tabs display real data
- Upload starts report
- Report detail displays persisted issues
- Refresh preserves results

---

# 28. Acceptance Criteria

The implementation is complete only when:

1. User opens Brand Identity → Scans
2. User enters a real public URL
3. URL reaches the backend
4. A scan record is created
5. Real progress is shown
6. The website is analyzed
7. Results are stored
8. Refresh preserves results
9. Overview shows the scan summary
10. Colors shows extracted colors
11. Typography shows extracted styles
12. Assets shows discovered logos and icons
13. Layout shows spacing and radius
14. Components shows detected patterns
15. Tokens exports real JSON
16. User approves a Brand Version
17. Reports unlocks
18. User uploads a real image
19. The image is stored persistently
20. Real comparison runs
21. A deterministic score is generated
22. Category results display
23. Issues and recommendations display
24. Annotations remain aligned
25. Refresh preserves the report
26. New scans create new versions
27. Old reports remain unchanged
28. Errors are useful
29. No relevant button is non-functional
30. Production screens contain no mock data

---

# 29. Final Functional Relationship

```text
Brand Identity → Scans
    Submit website URL
          ↓
    Persist scan and extracted results
          ↓
Brand Identity → Overview
    Show summary and active identity
          ↓
Colors / Typography / Assets / Layout / Components / Tokens
    Show data from the same Brand Version
          ↓
Approve Brand Version
          ↓
Reports
    Upload creative and compare against that exact approved version
```

The main design rule is:

> Brandcora must feel minimal, precise, and professionally designed. Intelligence should be communicated through clear hierarchy, working interactions, structured data, and restrained visual systems—not oversized typography, oversized controls, decorative cards, or excessive animation.

---

# 30. Final Implementation Instruction

Before implementing:

1. Inspect the repository
2. Identify the framework and routing system
3. Identify broken event handlers
4. Identify missing API routes
5. Identify missing environment variables
6. Identify database gaps
7. Identify storage gaps
8. Identify background-job limitations
9. Identify why website scanning currently fails
10. Identify why image comparison currently fails
11. Present a concise implementation plan

After implementing, provide:

- Files changed
- Database migrations
- Environment variables
- API endpoints
- Background-job setup
- Storage configuration
- Tests
- Known limitations
- Local setup steps
- Production deployment steps

Do not claim the feature works without end-to-end testing.

---

# 31. Final Summary

Brandcora is a professional brand-intelligence platform that:

1. Accepts a website URL
2. Scans the website
3. Extracts the complete visual identity
4. Organizes the identity into structured Brand Identity tabs
5. Stores immutable versions
6. Exports real JSON design tokens
7. Requires an approved identity before report creation
8. Accepts creative uploads
9. Compares creative assets against a selected Brand Version
10. Produces deterministic reports
11. Identifies exact inconsistencies
12. Supports revisions and reanalysis

The UI should remain minimal and controlled.

The backend should be real, persistent, secure, testable, and fully connected to the redesigned interface.
