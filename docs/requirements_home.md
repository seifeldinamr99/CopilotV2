# Home Page Requirements - Meta Ads Management Platform

## Overview
The home page serves as the main dashboard and command center for users, providing a personalized overview of their ad account performance, AI-generated recommendations, goals tracking, and quick access to key features.

---

## Design Reference
![Home Page Design Reference](C:/Users/DELL/.gemini/antigravity/brain/7d767c57-4b41-4903-a9e7-10019c0cbb2c/uploaded_image_1765371541006.png)

---

## Layout Structure

### Main Container
- **Background**: Dark theme with gradient (deep navy to dark purple)
- **Layout**: Single column, centered content with max-width constraint
- **Spacing**: Generous padding and spacing between sections
- **Scroll**: Vertical scroll for content overflow

---

## Components Breakdown

### 1. Header Section

#### 1.1 Personalized Greeting
**Location**: Top of page

**Content**:
- Greeting text: "Good morning, [User Name]"
- Dynamic recommendation count: "X recommendations for you"
- Time-based greeting (Good morning/afternoon/evening)

**Styling**:
- Large, bold typography
- White text on dark background
- Icon: Small avatar or AI icon next to greeting

**Functionality**:
- Display user's first name
- Show count of pending recommendations
- Update greeting based on time of day

---

#### 1.2 Quick Actions Bar
**Location**: Below greeting, top-right area

**Actions**:
- "Ask AI Marketer to Do More" button
  - Icon: Sparkle/AI icon
  - Style: Outlined button with subtle glow effect
  - Opens AI chat/command interface

**Styling**:
- Subtle, non-intrusive
- Icon + text button
- Hover effect with slight elevation

---

### 2. Top 5 Performing Campaigns

**Location**: Below header, left side

**Title**: "Top Performers" with "View All Campaigns" link

**Content**:
- List of top 5 campaigns ranked by ROAS
- Each campaign card shows:
  - Campaign name (truncated if too long)
  - ROAS value (large, prominent)
  - Spend amount
  - Revenue amount
  - Trend indicator (up/down arrow with percentage)
  - Mini sparkline chart (optional)

**Campaign Card Structure**:
```
┌─────────────────────────────────────┐
│ Campaign Name                    ↗️ │
│ ROAS: 4.2x                          │
│ Spend: $2,500 | Revenue: $10,500   │
│ ▁▂▃▅▆▇█ +15% vs last week          │
└─────────────────────────────────────┘
```

**Styling**:
- Card-based layout
- Semi-transparent dark background
- Gradient border (light blue accent)
- Hover effect: slight elevation and glow
- ROAS value in large, bold text
- Color-coded trend indicators:
  - Green: Positive trend
  - Red: Negative trend
  - Gray: Neutral/no change

**Ranking Visual**:
- #1: Gold/yellow accent
- #2-3: Silver/light blue accent
- #4-5: Standard styling

**Functionality**:
- Click card to view campaign details
- Hover to see more metrics (CTR, CPA, etc.)
- Refresh data on demand
- "View All Campaigns" link to campaigns page
- Sort toggle (ROAS, Revenue, Spend)

---

### 3. Monthly Goals Widget

**Location**: Top-right section

**Title**: "Monthly goals" with "View All" link

**Content**:
- Multiple goal items, each showing:
  - Goal name/category (e.g., "Revenue", "Revenue spend", "Increase ROAS")
  - Progress bar (horizontal)
  - Current value vs target (e.g., "$70,000 / $100,000")
  - Visual indicator (icon or color-coded)

**Goal Items**:
1. **Revenue**
   - Progress bar (purple/blue gradient)
   - Current: $70,000 / Target: $100,000
   - Icon: Dollar sign or revenue icon

2. **Revenue spend**
   - Progress bar (different color, e.g., teal)
   - Current: $32,000 / Target: $50,000
   - Icon: Spend/budget icon

3. **Increase ROAS**
   - Progress bar (green/success color)
   - Current: 2.1 / Target: 3
   - Icon: Growth/chart icon

**Styling**:
- Card container with dark background
- Progress bars with gradient fills
- Percentage completion visible
- Color-coded by goal type or status
- "Edit" button for customization

**Functionality**:
- Display current progress vs targets
- Calculate percentage completion
- Update in real-time
- Click to edit goals
- "View All" to see detailed goals page

---

### 4. AI Recommendations Feed

**Location**: Main content area, center/full-width

**Title**: "AI Recommendations" (implicit)

**Content**: List of recommendation cards, each containing:

#### Recommendation Card Structure

**Card 1: Scale/Budget Recommendation**
- **Icon**: Chart/growth icon (left side)
- **Title**: "Scale acquisition budgets for high-performing assets"
- **Metadata**:
  - Date: "Dec 10"
  - Source: "Facebook" (with icon)
- **Action Button**: "Explore" (right side, light blue gradient)
- **Priority**: High (indicated by position)

**Card 2: Negative Comments Alert**
- **Icon**: Warning/alert icon (left side)
- **Title**: "20 negative comments need your action"
- **Metadata**:
  - Date: "Dec 10"
  - Source: "Facebook"
- **Action Button**: "Explore"
- **Priority**: Medium-High (urgent action needed)

**Card 3: Creative Testing**
- **Icon**: Lightbulb/creative icon (left side)
- **Title**: "Winner found in your creative testing campaign"
- **Metadata**:
  - Date: "Dec 10"
  - Source: "Facebook"
- **Action Button**: "Explore"
- **Priority**: Medium

**Card 4: Audience Insight** (Faded/Lower Priority)
- **Icon**: People/audience icon
- **Title**: "Emails all bidding on Mothers + U.S vs Top Customers"
- **Metadata**:
  - Date: "Dec 10"
  - Source: "Facebook"
- **Action Button**: "Explore"
- **Priority**: Lower (visually de-emphasized with opacity)

**Card Styling**:
- Semi-transparent dark background
- Subtle border or shadow
- Rounded corners
- Hover effect (slight elevation, brightness increase)
- Gradient on action button
- Icon with colored background circle

**Card Layout**:
- Horizontal layout: Icon | Content | Action Button
- Icon: 40-48px circle with colored background
- Content: Flex-grow, left-aligned
- Button: Fixed width, right-aligned

**Priority Indication**:
- Higher priority cards: Full opacity, prominent
- Lower priority cards: Reduced opacity (60-70%)
- Order: Top to bottom by priority

**Functionality**:
- Click card or "Explore" button to view details
- Dismiss/snooze option (on hover)
- Mark as read/completed
- Filter by type, priority, date
- Infinite scroll or pagination

---

## Color Scheme

### Primary Colors
- **Background Gradient**: 
  - Start: `#0f172a` (deep slate)
  - End: `#1e293b` (dark slate-blue)
- **Card Background**: `rgba(255, 255, 255, 0.05)` (semi-transparent white)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `rgba(255, 255, 255, 0.7)` (70% white)

### Accent Colors
- **Primary Accent**: `#38bdf8` (light blue/sky)
- **Secondary Accent**: `#0ea5e9` (blue)
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)
- **Info**: `#3b82f6` (blue)

### Progress Bars
- **Revenue**: Light blue gradient (`#38bdf8` to `#0ea5e9`)
- **Spend**: Cyan gradient (`#06b6d4` to `#0891b2`)
- **ROAS**: Green gradient (`#10b981` to `#059669`)

### Campaign Performance
- **Top Performer (#1)**: Gold accent (`#fbbf24`)
- **High Performer (#2-3)**: Light blue accent (`#38bdf8`)
- **Standard (#4-5)**: Default card styling

---

## Typography

### Font Family
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace** (for numbers): "Roboto Mono", monospace

### Font Sizes
- **Greeting**: 32px, bold (font-weight: 700)
- **Section Titles**: 20px, semi-bold (font-weight: 600)
- **Card Titles**: 16px, medium (font-weight: 500)
- **Metadata**: 14px, regular (font-weight: 400)
- **Small Text**: 12px, regular

### Line Heights
- **Headings**: 1.2
- **Body**: 1.5
- **Compact**: 1.3

---

## Spacing & Layout

### Container
- **Max Width**: 1400px
- **Padding**: 32px (desktop), 16px (mobile)
- **Gap between sections**: 32px

### Cards
- **Padding**: 20px
- **Border Radius**: 12px
- **Gap between cards**: 16px
- **Border**: 1px solid rgba(255, 255, 255, 0.1)

### Grid Layout
- **Main Grid**: 2 columns (desktop)
  - Left column: 60% (recommendations feed)
  - Right column: 40% (goals, saved work)
- **Mobile**: Single column, stacked

---

## Interactions & Animations

### Hover Effects
- **Cards**: 
  - Transform: `translateY(-2px)`
  - Shadow: Increase elevation
  - Transition: 200ms ease
- **Buttons**:
  - Background: Brighten by 10%
  - Transform: `scale(1.02)`
  - Transition: 150ms ease

### Loading States
- **Skeleton screens** for cards while loading
- **Shimmer effect** on placeholders
- **Smooth fade-in** when content loads

### Transitions
- **Page load**: Fade in from bottom (stagger cards)
- **Card interactions**: Smooth scale and opacity
- **Progress bars**: Animated fill on load

---

## Responsive Design

### Desktop (1200px+)
- 2-column layout
- Full sidebar navigation
- All features visible

### Tablet (768px - 1199px)
- 2-column layout (narrower)
- Collapsible sidebar
- Slightly reduced spacing

### Mobile (< 768px)
- Single column layout
- Stacked sections
- Bottom navigation bar
- Reduced font sizes
- Swipeable cards

---

## Accessibility

### ARIA Labels
- Proper labels for all interactive elements
- Screen reader announcements for dynamic content
- Semantic HTML structure

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus indicators visible
- Keyboard shortcuts for quick actions

### Color Contrast
- Minimum 4.5:1 ratio for text
- 3:1 for UI components
- Focus indicators with high contrast

---

## Data Requirements

### API Endpoints Needed
1. **GET /api/dashboard/summary**
   - User name
   - Recommendation count
   - Time of day

2. **GET /api/recommendations**
   - List of AI recommendations
   - Priority, type, date, source
   - Pagination support

3. **GET /api/campaigns/top-performers**
   - Top 5 campaigns by ROAS
   - Campaign name, ROAS, spend, revenue
   - Trend data (percentage change)
   - Sparkline data (optional)

4. **GET /api/goals**
   - Monthly goals with progress
   - Current vs target values
   - Goal types and icons

### Real-time Updates
- WebSocket connection for live updates
- Polling interval: 30 seconds (fallback)
- Optimistic UI updates

---

## Empty States

### No Recommendations
- Icon: Checkmark or celebration icon
- Message: "You're all caught up! No recommendations at the moment."
- CTA: "Explore Campaigns" button

### No Goals Set
- Icon: Target icon
- Message: "Set your first monthly goal to track progress"
- CTA: "Create Goal" button

### No Top Performers
- Icon: Trophy icon
- Message: "No campaign data yet. Connect your Meta account to see top performers."
- CTA: "Connect Meta Account" button

---

## Performance Considerations

### Optimization
- Lazy load images and avatars
- Virtual scrolling for long recommendation lists
- Debounce API calls
- Cache frequently accessed data

### Loading Priority
1. Header and greeting (immediate)
2. Top performing campaigns (high priority)
3. Recommendations feed (high priority)
4. Goals widget (medium priority)

---

## Future Enhancements

### Phase 2 Features
- Drag-and-drop to reorder recommendations
- Customizable dashboard widgets
- Dark/light theme toggle
- Advanced filtering and search
- Recommendation categories/tags
- Bulk actions on recommendations

### Analytics Integration
- Track user interactions
- Measure engagement with recommendations
- A/B test different layouts
- Heatmap analysis

---

## Technical Implementation Notes

### React Components Structure
```
HomePage/
├── Header/
│   ├── Greeting
│   └── QuickActions
├── TopPerformers/
│   ├── CampaignPerformanceCard
│   └── TrendIndicator
├── MonthlyGoals/
│   ├── GoalItem
│   └── ProgressBar
└── RecommendationsFeed/
    ├── RecommendationCard
    └── EmptyState
```

### State Management
- Use React Query for API data
- Zustand for UI state (filters, sorting)
- Context for theme and user preferences

### Styling Approach
- Tailwind CSS for utility classes
- CSS modules for component-specific styles
- CSS variables for theme colors
- Framer Motion for animations

---

## Success Metrics

### User Engagement
- Time spent on home page
- Recommendation click-through rate
- Goal completion rate
- Return visit frequency

### Performance
- Page load time < 2 seconds
- Time to interactive < 3 seconds
- Smooth 60fps animations
- API response time < 500ms
