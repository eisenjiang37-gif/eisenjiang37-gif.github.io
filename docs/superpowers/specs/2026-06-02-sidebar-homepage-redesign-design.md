# Sidebar Homepage Redesign Design

**Created**: 2026-06-02  
**Status**: Approved design direction, pending implementation plan

## Overview

Redesign the personal homepage around a fixed academic profile sidebar inspired by the provided reference image, but adapted for Eisen Jiang's research-oriented personal site. The selected direction is an academic profile panel rather than a pure blog sidebar: the rail should communicate identity, education trajectory, research interests, navigation, and contact channels at a glance.

## Goals

- Replace the current dark experimental sidebar with a calmer academic profile panel.
- Keep the homepage useful as a research/blog hub rather than a marketing landing page.
- Make the sidebar the primary identity surface: avatar, name, status, navigation, and links.
- Preserve readable long-form content pages for research, writing, about, and contact.
- Work cleanly on desktop and mobile without horizontal crowding.

## Non-Goals

- Do not rebuild the site with a frontend framework.
- Do not add backend functionality.
- Do not redesign blog article generation logic unless the new layout requires a small style compatibility change.
- Do not introduce a decorative one-page hero that hides navigation or content.

## Selected Visual Direction

Use the academic profile panel direction:

- Light neutral background, low-saturation borders, dark gray text.
- A left fixed sidebar with avatar and concise academic identity.
- Large but controlled navigation spacing, inspired by the reference sidebar.
- More information density than the reference image, suitable for a research homepage.
- Minimal accent color, used for active navigation and small status details.

The design should feel like a polished academic knowledge base: quiet, readable, and personal.

## Information Architecture

Sidebar top identity block:

- Circular portrait or existing personal avatar asset if available.
- Primary name: `Eisen Jiang`.
- Secondary identity: `Zihan Jiang / 蒋子涵` if space allows.
- Status line: `Zhejiang University -> Georgia Tech`.
- Focus line: `Research, systems, agents`.

Main navigation:

- Home
- Research
- Projects
- Writing
- About
- Contact

Sidebar bottom links:

- GitHub
- Scholar
- Email
- CV

If icon assets are not already available, use text links first. Icons can be added later with a small, consistent SVG or icon-font strategy.

## Layout

Desktop:

- Fixed left sidebar, approximately 300-340px wide.
- Sidebar fills full viewport height.
- Main content sits to the right with a comfortable max width.
- Pages should use the same sidebar component structure so navigation stays consistent.
- The current collapse behavior can be removed if it conflicts with the profile panel identity.

Mobile:

- Sidebar becomes a top profile header.
- Navigation collapses below the identity area or into a compact menu.
- Main content starts below the profile header.
- No fixed left rail on small screens.

## Components

`sidebar`

- Owns identity block, navigation, social/contact links, and theme control if retained.
- Should be reusable across all static HTML pages.

`content`

- Owns page-specific content.
- Keeps current pages as separate HTML documents.
- Should not depend on sidebar internals beyond layout classes.

`nav-links`

- Uses active state detection already present in `assets/main.js`.
- Supports a `Projects` entry; if no dedicated `projects.html` exists, link it to `research.html#projects`.

`theme-toggle`

- Optional. If retained, it should be visually quiet and not dominate the academic panel.
- The default theme for the redesign should be light.

## Data Flow

The site remains static:

```text
HTML page
  -> shared CSS layout
  -> main.js active nav and theme behavior
  -> static links and generated blog index
```

No new runtime data source is required.

## Error Handling

- If avatar image is missing, fall back to initials or a neutral circular placeholder.
- If external links are placeholders, keep them visibly but avoid broken `#` links where possible.
- If JavaScript is disabled, navigation and content must still work.

## Testing Strategy

Manual visual checks:

- Desktop wide viewport: sidebar fixed, content readable, no overlap.
- Laptop viewport: sidebar and content remain balanced.
- Mobile viewport: sidebar converts to top header/menu without text overflow.
- All top-level pages load with consistent navigation.
- Active nav states still work.

Technical checks:

- Run a local static server if needed.
- Verify `git status` is clean after implementation.
- Avoid committing generated or temporary `.superpowers/` files.

## Implementation Notes

The implementation should focus on the existing static site:

- Update repeated sidebar markup in `index.html`, `about.html`, `research.html`, `writing.html`, and `contact.html`.
- Update `assets/style.css` for the new light profile panel.
- Adjust `assets/main.js` only if current collapse or theme behavior conflicts with the new structure.
- Review `blogs/` styles only after the main pages are stable.

## Acceptance Criteria

- Homepage visually matches the approved academic profile sidebar direction.
- Main pages share a consistent sidebar and navigation structure.
- Site defaults to the light academic profile look.
- Mobile layout is readable and does not require horizontal scrolling.
- No temporary brainstorming files are committed.
