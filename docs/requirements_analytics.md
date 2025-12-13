# Analytics Dashboard - MVP Requirements

## Overview
Minimal analytics dashboard combining Meta Ads and Shopify data to provide essential performance insights for the MVP.

---

## Design Reference
![Analytics Dashboard Design](C:/Users/DELL/.gemini/antigravity/brain/7d767c57-4b41-4903-a9e7-10019c0cbb2c/uploaded_image_1765372667125.png)

---

## Page Layout

### Header
**Components**:
- **Page Title**: "Business Dashboard"
- **Date Range Selector**: Dropdown (Last 7 days, Last 30 days, etc.)
- **Share Button**: Export/share dashboard

---

## Blended Summary Section

### Purpose
Single unified view combining Meta Ads and Shopify data with platform source indicators.

### Layout
**Grid**: 4 columns × 2 rows (8 metric cards)

### Platform Indicators
Each metric card shows data sources with icons:
- 🔵 Facebook/Meta icon
- 📊 Google Ads icon (future)
- 🛍️ Shopify icon
- 🎵 TikTok icon (future)
- 📈 Analytics icon (future)

---

## Metric Cards (MVP - 8 Essential Metrics)

### Row 1: Core Performance Metrics

#### 1. Total Ad Spend
**Sources**: Meta Ads only (MVP)
**Display**:
- Large number: `$17,592`
- Trend indicator: `↗ 33%` (green)
- Platform icons: 🔵 (Meta)

**Calculation**: Sum of all Meta ad spend in date range

---

#### 2. Revenue
**Sources**: Shopify + Meta (attributed)
**Display**:
- Large number: `$69,012`
- Trend indicator: `↗ 15.2%` (green)
- Platform icons: 🔵 📊 🛍️

**Calculation**: Total Shopify revenue in date range

---

#### 3. ROAS (Ads only)
**Sources**: Meta Ads + Shopify
**Display**:
- Large number: `$51,420` or ratio `5.14x`
- Trend indicator: `↗ 45%` (green)
- Platform icons: 🔵 📊 🛍️

**Calculation**: `Revenue / Ad Spend`

---

#### 4. MER (Marketing Efficiency Ratio)
**Sources**: All channels + Shopify
**Display**:
- Percentage: `392%` or ratio `3.92x`
- Trend indicator: `↗ 66%` (green)
- Platform icons: 🔵 📊 🛍️ 📈

**Calculation**: `Total Revenue / Total Marketing Spend`

---

### Row 2: Conversion & Profitability Metrics

#### 5. Conversion Rate (ecommerce)
**Sources**: Shopify
**Display**:
- Percentage: `9.7%`
- Trend indicator: `↗ 11%` (green)
- Platform icon: 🛍️

**Calculation**: `(Orders / Sessions) × 100`

---

#### 6. Net Ad Profit
**Sources**: Meta + Shopify
**Display**:
- Dollar amount: `$51,420`
- Trend indicator: `↗ 189%` (green)
- Platform icons: 🔵 📊 🛍️

**Calculation**: `Revenue - Ad Spend - COGS`

---

#### 7. AOV (Average Order Value)
**Sources**: Shopify
**Display**:
- Dollar amount: `$115`
- Trend indicator: `↗ 8%` (green)
- Platform icon: 🛍️

**Calculation**: `Total Revenue / Number of Orders`

---

#### 8. CAC (Customer Acquisition Cost)
**Sources**: Meta Ads
**Display**:
- Dollar amount: `$52`
- Trend indicator: `↗ 27%` (green/red based on direction)
- Platform icons: 🔵 📊 🛍️ 📈

**Calculation**: `Total Ad Spend / New Customers`

---

## Trend Charts (MVP - 2 Charts)

### 1. Revenue Chart
**Location**: Bottom left, full width

**Type**: Line chart

**Data**:
- X-axis: Time period (days/weeks)
- Y-axis: Revenue amount
- Data points labeled with values (7K, 4K, 6.2K, 8K, 8.4K, 9.4K, 12K)

**Styling**:
- Line color: Light blue/purple gradient
- Background: Dark with subtle grid
- Smooth curve interpolation

**Source**: Shopify revenue data

---

### 2. Purchases Chart
**Location**: Bottom right, full width

**Type**: Bar chart

**Data**:
- X-axis: Time period (days/weeks)
- Y-axis: Number of purchases (0-280)
- Bars showing purchase volume

**Styling**:
- Bar color: Light purple
- Background: Dark
- Rounded bar tops

**Source**: Shopify order count

---

## Color Scheme

### Background
- Dark slate: `#0f172a` to `#1e293b`

### Metric Cards
- Card background: `rgba(255, 255, 255, 0.05)`
- Border: `rgba(255, 255, 255, 0.1)`

### Text
- Primary: `#ffffff`
- Secondary: `rgba(255, 255, 255, 0.7)`

### Trend Indicators
- Positive (green): `#10b981`
- Negative (red): `#ef4444`
- Neutral (gray): `#6b7280`

### Charts
- Line/Bar: `#a78bfa` (purple)
- Grid lines: `rgba(255, 255, 255, 0.1)`

---

## Data Sources & API Endpoints

### Meta Ads API
**Endpoint**: `GET /api/meta/insights`

**Data Needed**:
- Total spend
- Impressions
- Clicks
- Conversions
- Date range

**Response**:
```javascript
{
  spend: 17592,
  impressions: 125000,
  clicks: 3500,
  conversions: 340,
  date_range: {
    start: "2024-12-03",
    end: "2024-12-10"
  }
}
```

---

### Shopify API
**Endpoint**: `GET /api/shopify/analytics`

**Data Needed**:
- Total revenue
- Order count
- Sessions
- New customers
- Daily revenue breakdown
- Daily order breakdown

**Response**:
```javascript
{
  total_revenue: 69012,
  order_count: 600,
  sessions: 6186,
  new_customers: 338,
  daily_revenue: [7000, 4000, 6200, 8000, 8400, 9400, 12000],
  daily_orders: [150, 120, 140, 180, 160, 200, 250]
}
```

---

## Metric Calculations

### ROAS (Return on Ad Spend)
```javascript
ROAS = Total Revenue / Total Ad Spend
Example: $69,012 / $17,592 = 3.92x or 392%
```

### MER (Marketing Efficiency Ratio)
```javascript
MER = Total Revenue / Total Marketing Spend
Example: $69,012 / $17,592 = 3.92x or 392%
```

### Conversion Rate
```javascript
Conversion Rate = (Orders / Sessions) × 100
Example: (600 / 6186) × 100 = 9.7%
```

### Net Ad Profit
```javascript
Net Ad Profit = Revenue - Ad Spend - (COGS × Orders)
Example: $69,012 - $17,592 - $0 = $51,420
Note: COGS calculation deferred to post-MVP
```

### AOV (Average Order Value)
```javascript
AOV = Total Revenue / Order Count
Example: $69,012 / 600 = $115.02
```

### CAC (Customer Acquisition Cost)
```javascript
CAC = Total Ad Spend / New Customers
Example: $17,592 / 338 = $52.04
```

### Trend Percentage
```javascript
Trend % = ((Current Period - Previous Period) / Previous Period) × 100
Example: ((17592 - 13200) / 13200) × 100 = 33%
```

---

## React Components Structure

```
AnalyticsDashboard/
├── Header
│   ├── PageTitle
│   └── DateRangeSelector
├── BlendedSummary
│   └── MetricCard (×8)
│       ├── MetricValue
│       ├── TrendIndicator
│       └── PlatformIcons
└── TrendCharts
    ├── RevenueChart (Line)
    └── PurchasesChart (Bar)
```

---

## Metric Card Component

**Props**:
- `title`: Metric name
- `value`: Main value to display
- `trend`: Percentage change
- `trendDirection`: 'up' | 'down' | 'neutral'
- `platforms`: Array of platform icons
- `format`: 'currency' | 'percentage' | 'number'

**Example**:
```jsx
<MetricCard
  title="Total Ad Spend"
  value={17592}
  trend={33}
  trendDirection="up"
  platforms={['meta']}
  format="currency"
/>
```

---

## Date Range Selector

**Options**:
- Today
- Yesterday
- Last 7 days (default)
- Last 30 days
- Last 90 days
- This month
- Last month
- Custom range

**Functionality**:
- Updates all metrics on change
- Stores selection in URL params
- Persists user preference

---

## API Integration

### Data Fetching
**Endpoint**: `GET /api/analytics/dashboard`

**Query Parameters**:
- `start_date`: ISO date string
- `end_date`: ISO date string
- `compare`: Boolean (include comparison period)

**Response**:
```javascript
{
  current_period: {
    ad_spend: 17592,
    revenue: 69012,
    orders: 600,
    sessions: 6186,
    new_customers: 338
  },
  previous_period: {
    ad_spend: 13200,
    revenue: 59900,
    // ...
  },
  daily_data: {
    revenue: [7000, 4000, 6200, 8000, 8400, 9400, 12000],
    orders: [150, 120, 140, 180, 160, 200, 250]
  }
}
```

---

## State Management

**React Query**:
- Cache dashboard data
- Automatic refetch on date change
- Loading and error states

**Zustand Store**:
```javascript
{
  dateRange: {
    start: '2024-12-03',
    end: '2024-12-10'
  },
  comparisonEnabled: true
}
```

---

## Loading States

### Skeleton Screens
- Metric cards: Shimmer effect on value area
- Charts: Placeholder with loading animation

### Empty States
- No data available message
- CTA to connect Meta/Shopify accounts

---

## Responsive Design

### Desktop (1200px+)
- 4-column grid for metrics
- Full-width charts side by side

### Tablet (768px - 1199px)
- 2-column grid for metrics
- Stacked charts

### Mobile (< 768px)
- Single column for metrics
- Stacked charts
- Horizontal scroll for charts

---

## Performance Optimization

### Caching
- Cache API responses for 5 minutes
- Store calculated metrics
- Lazy load chart libraries

### Optimization
- Memoize metric calculations
- Debounce date range changes
- Virtual scrolling for large datasets (future)

---

## Accessibility

- ARIA labels for all metrics
- Keyboard navigation for date selector
- Screen reader announcements for value changes
- High contrast mode support

---

## Success Metrics

### Performance
- Dashboard load time < 2 seconds
- API response time < 500ms
- Chart render time < 300ms

### User Engagement
- Time spent on analytics page
- Date range change frequency
- Metric card interaction rate
