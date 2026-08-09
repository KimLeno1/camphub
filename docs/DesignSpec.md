# Center7 - Design Specifications

This document outlines the structural layouts and visual hierarchy for every major view in the Center7 platform. All designs adhere strictly to the rules established in the UI Kit, emphasizing typography, spacing, and a clean, flattened hierarchy without administrative clutter.

---

## 1. Public Views

### Landing Page
- **Navigation (Top):** Minimalist header. Logo left, `Login` and `Join Center7` (Primary Button) on the right.
- **Hero Section:** High-contrast, generously spaced.
  - H1 Display typography: "Decentralized Student Governance."
  - Subtitle: "No admins. Pure democracy. The ultimate student community platform."
  - Primary CTA: "Enter the Community"
- **Value Proposition (Bento Grid):** 3-4 clean cards outlining: Reputation, Voting, Resources, and Real-time Chat. Minimal icons (Lucide), focus on typographic hierarchy.
- **Footer:** Simple links, copyright, terms.

### Login & Register
- **Layout:** Centered card on a subtle off-white/near-black canvas.
- **Container:** Max-width `400px`, padding `32px`, border radius `16px`.
- **Content:**
  - H2: "Welcome back" / "Join Center7"
  - Form: Stacked inputs (Email, Password) with 1px borders.
  - Actions: Full-width Primary Button. Secondary text link for toggle ("Don't have an account?").
  - OAuth: Minimal bordered buttons for Google/GitHub (if applicable).

---

## 2. Core Application Shell

Once authenticated, the app utilizes a persistent, responsive shell.
- **Left Sidebar (Navigation):** 
  - Width: `240px` (Desktop). Collapses to bottom-bar on mobile.
  - Sections: 
    - *Top:* User mini-profile (Avatar, Reputation Score, Trust Level).
    - *Global Nav:* Dashboard, Governance, Search, Marketplace, Notifications, Settings.
    - *My Communities:* Scrollable list of joined communities with subtle active-state pills.
- **Top Bar (Contextual):**
  - Displays the current context (e.g., "Community Name / Channel Name").
  - Global Search input (Command+K shortcut hint).
  - Contextual actions (e.g., "New Post", "Upload Resource").

---

## 3. Main Views

### Dashboard (Home)
- **Layout:** Two-column (Main Content `~65%`, Right Sidebar `~35%`).
- **Main Feed:** Aggregated, chronological feed of pinned announcements, top resources, and active governance proposals from the user's communities.
- **Right Sidebar (Activity):** 
  - "Upcoming Events" card.
  - "Pending Jury Duty" alert (if selected, rendered in Accent color to grab attention).
  - "Trending Study Groups".

### Community Overview
- **Header:** Community Name, Description, Member Count, Trust Level requirement.
- **Layout:** Sub-navigation tabs (`Channels`, `Clubs`, `Resources`, `Events`, `Proposals`).
- **Content (Default - Channels):** Clean list of text and voice channels. Simple hover states for entry.

### Club / Study Group
- **Structure:** Similar to Community but scoped smaller.
- **Header:** Club Name, "Leave Group" secondary button.
- **Feed:** Combined chat and resource timeline.

### Channel / Chat
- **Layout:** Full height, edge-to-edge within the main content area.
- **Message List:** 
  - Avatar left, Sender Name + Timestamp (muted) top, Message body below.
  - Hovering a message reveals a minimal action bar (Reply, React, Report).
- **Composer (Bottom):** 
  - Multi-line auto-expanding input.
  - Left attachments icon (Lucide Paperclip).
  - Right action (Send icon).

### Marketplace / Resources
- **Layout:** Grid layout for resource cards.
- **Filters (Top):** Dropdowns for Major, File Type, Sort (Highest Rated, Newest).
- **Resource Card:** 
  - Icon based on file type.
  - Title (H3, max 2 lines).
  - Uploader Avatar + Reputation.
  - File size & Download button.

### Governance (The Heart)
- **Layout:** Tabbed interface (`Active Cases`, `My Jury Duty`, `Proposals`, `History`).
- **Active Case Card (Juror View):**
  - "Case #4092 - Spam/Harassment".
  - Anonymized evidence block (quoted text or resource link).
  - Timer: "48 hours remaining".
  - Action Buttons: `Action Required` (Destructive), `No Action` (Secondary Outline), `Abstain` (Ghost).
- **Proposal View:** Read-only document rendering (markdown) with a large progress bar showing `Approve` vs `Reject` weighted votes.

### Events
- **Layout:** Calendar grid or upcoming agenda list.
- **Event Card:** Date block (Left), Title and Time (Center), `RSVP` or `Join Voice` button (Right).

### Notifications
- **Layout:** Single-column list.
- **Items:** Distinct visual indicators for different types (e.g., blue dot for unread). Grouped by "Today", "Yesterday".
- **Types:** Jury summons, replies, event reminders, reputation changes.

### Profile
- **Header:** Large Avatar, Display Name, Major.
- **Stats Row:** Reputation Points, Trust Level, Cases Participated.
- **Tabs:** `Contributions` (Uploaded resources/posts), `Badges/Achievements`, `Governance History` (Public voting record).

### Settings
- **Layout:** Left sub-menu (Account, Appearance, Notifications, Privacy), Right content area.
- **Appearance:** Radio cards for Light/Dark/System theme.
- **Account:** Inputs for Email, Password change, Major selection.

### Global Search (Command+K)
- **Overlay:** Centered modal over a blurred background.
- **Input:** Large, auto-focused text input.
- **Results:** Instant, categorized results (Communities, Messages, Resources, Users) navigable via arrow keys.
