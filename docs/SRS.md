# Specs

## 1. Core Features Overview

### 1.1 Meta Integration

- OAuth 2.0 authentication with Meta Business
- Fetch campaigns, ad sets, ads, and insights
- Execute approved modifications via Meta API
- Real-time sync + scheduled background jobs (every 6 hours)

### 1.2 Metrics & Analytics

- **Core Metrics**: ROAS, CPA, CTR, CPM, Conversion Rate, CAC
- **Trends**: DoD, WoW, MoM percentage changes
- **Benchmarks**: Compare against industry averages by category

### 1.3 AI Recommendations

- Analyze performance data
- Generate actionable suggestions (create campaigns ,budget changes, pause campaigns, audience adjustments)
- User approval workflow before execution
- Track recommendation outcomes

### 1.4 Shopify Integration

- OAuth connection to Shopify stores
- Sync orders, products, and revenue data
- Attribution: Match Meta clicks to Shopify orders
- Unified ROAS calculation with actual revenue

### 1.5 Ads Library

- Search competitor ads via Meta Ads Library API
- Filter by advertiser, keyword, country, date range
- Gallery view with save/organize functionality

### 1.6 Image Generation

- Integration with image generation API (Nano Banana or similar)
- Template-based ad creative generation
- Brand asset management (logos, colors, fonts)
- Multiple format exports (1:1, 4:5, 9:16, 16:9)

---

## Data Models

### 3.1 User

```
- id
- email
- name
- created_at
- meta_access_token (encrypted)
- shopify_access_token (encrypted)

```

### 3.2 AdAccount

```
- id
- user_id
- meta_account_id
- account_name
- currency
- timezone

```

### 3.3 Campaign

```
- id
- ad_account_id
- meta_campaign_id
- name
- status
- objective
- daily_budget
- lifetime_budget
- last_synced_at

```

### 3.4 Metrics

```
- id
- campaign_id (or adset_id, ad_id)
- date
- spend
- impressions
- clicks
- conversions
- revenue (from Shopify)
- calculated fields: roas, cpa, ctr, cpm

```

### 3.5 Recommendation

```
- id
- campaign_id
- type (budget_increase, pause_campaign, audience_expand, etc.)
- current_value
- suggested_value
- reasoning (AI explanation)
- status (pending, approved, rejected, executed)
- created_at
- executed_at

```

### 3.6 ShopifyOrder

```
- id
- user_id
- order_id
- revenue
- utm_source
- utm_campaign
- ad_id (if attributed)
- created_at

```

---

## 4. API Endpoints

### 4.1 Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/meta/connect
POST   /api/auth/shopify/connect

```

### 4.2 Campaigns

```
GET    /api/campaigns
GET    /api/campaigns/:id
GET    /api/campaigns/:id/metrics
POST   /api/campaigns/sync

```

### 4.3 Recommendations

```
GET    /api/recommendations
POST   /api/recommendations/generate
PUT    /api/recommendations/:id/approve
PUT    /api/recommendations/:id/reject

```

### 4.4 Shopify

```
GET    /api/shopify/orders
GET    /api/shopify/products
GET    /api/shopify/revenue-attribution

```

### 4.5 Ads Library

```
GET    /api/ads-library/search?query=&country=
GET    /api/ads-library/:id
POST   /api/ads-library/save

```

### 4.6 Creative Studio

```
POST   /api/creatives/generate
GET    /api/creatives/templates
POST   /api/creatives/upload

```

---

## 5. Meta API Integration Details

### 5.1 Required Permissions

- `ads_management`
- `ads_read`
- `business_management`
- `read_insights`

### 5.2 Key Endpoints Used

**Fetching Data**:

- `GET /{ad-account-id}/campaigns`
- `GET /{ad-account-id}/adsets`
- `GET /{ad-account-id}/ads`
- `GET /{ad-account-id}/insights`

**Executing Changes**:

- `POST /{campaign-id}` - Update campaign
- `POST /{adset-id}` - Update ad set
- `POST /{ad-id}` - Update ad

**Ads Library**:

- `GET /ads_archive` - Search public ads

### 5.3 Sync Strategy

- **Real-time**: Dashboard loads, user-triggered sync
- **Scheduled**: Background job every 6 hours
- **Webhooks**: Listen for campaign changes (optional)

---

### 6.3 Recommendation Types

1. **Budget Increase**: Scale high-ROAS campaigns
2. **Budget Decrease**: Reduce spend on underperformers
3. **Pause Campaign**: Stop campaigns below threshold
4. **Audience Expansion**: Widen targeting for saturation
5. **Creative Refresh**: Replace fatigued ads
6. **Bid Adjustment**: Optimize bid strategy

### 6.4 Execution Flow

1. User clicks "Generate Recommendations"
2. Fetch latest metrics from database
3. Send structured JSON to Claude API
4. Parse response and save to `recommendations` table
5. Display in UI with approve/reject buttons
6. On approval → execute via Meta API
7. Log action and monitor results

---

## 7. Shopify Integration Details

### 7.1 OAuth Flow

- Install Shopify app on user's store
- Request scopes: `read_orders`, `read_products`, `read_customers`
- Store access token (encrypted)

### 7.2 Data Sync

**Orders**:

- Sync new orders every hour
- Extract UTM parameters from order attributes
- Match to Meta campaigns via `utm_campaign` or `ad_id`

**Products**:

- Sync product catalog for ad creation
- Track best-selling products from ads

### 7.3 Attribution Logic

```jsx
// Match Shopify order to Meta ad
if (order.utm_source === 'facebook' && order.utm_campaign) {
  // Find campaign by name or ID
  const campaign = findCampaignByName(order.utm_campaign);
  // Add revenue to campaign metrics
  addRevenueToCampaign(campaign.id, order.total_price);
}

```

### 7.4 Dashboard Metrics

- **Total Revenue**: Sum of all attributed orders
- **True ROAS**: `total_revenue / total_spend`
- **Revenue by Campaign**: Breakdown table
- **Product Performance**: Best ROAS by product

---

## 8. Ads Library Feature

### 8.1 Meta Ads Library API

**Endpoint**: `GET https://graph.facebook.com/v21.0/ads_archive`

**Query Parameters**:

- `search_terms`: Keyword or advertiser name
- `ad_reached_countries`: Country code (US, GB, etc.)
- `ad_active_status`: ALL, ACTIVE, INACTIVE
- `fields`: id, ad_creative_body, ad_creative_link_title, ad_snapshot_url

**Rate Limit**: ~200 requests/hour

### 8.2 Portal Features

**Search & Filter**:

- Search bar for keywords/advertisers
- Country dropdown (US, UK, CA, etc.)
- Status filter (Active/All)
- Date range picker

**Display**:

- Grid view of ad thumbnails
- Click for detail view (full ad, copy, CTA)
- Save to collections
- Export/download creative

**Use Cases**:

- Competitor research
- Creative inspiration
- Trend tracking

---

## 9. Image Generation Studio

### 9.1 Integration (Nano Banana or Alternative)

**API Call**:

```jsx
POST /generate-image
{
  "prompt": "Product on marble surface, studio lighting",
  "style": "photorealistic",
  "aspect_ratio": "1:1",
  "negative_prompt": "blurry, low quality"
}

```

**Response**:

```json
{
  "image_url": "https://cdn.example.com/generated/abc123.jpg",
  "generation_id": "gen_xyz"
}

```

### 9.2 Workflow

1. User enters product description or uploads product pic
2. Choose ad format (square, story, feed)
3. Apply brand assets (logo, colors)
4. Generate 3-5 variations
5. Add text overlays and CTAs
6. Export to Meta Ads Manager or save to library

### 9.3 Brand Assets

**Storage**:

- Upload logos (PNG with transparency)
- Define color palette (hex codes)
- Set preferred fonts
- Create reusable templates

**Auto-Apply**:

- Overlay logo on generated images
- Ensure brand colors are used
- Maintain consistent style

---

## 12. Development Timeline

### Foundation

- [ ]  User auth + Meta OAuth
- [ ]  Campaign data fetching
- [ ]  Database setup + models
- [ ]  Basic dashboard UI

### Core Features

- [ ]  Metrics calculation engine
- [ ]  Trend analysis + benchmarking
- [ ]  AI engine integration
- [ ]  Approval/execution workflow

### Integrations

- [ ]  Shopify OAuth + sync
- [ ]  Revenue attribution
- [ ]  Ads Library portal
- [ ]  Image generation studio

### Polish

- [ ]  Results monitoring
- [ ]  Alerts + notifications
- [ ]  Advanced filtering
- [ ]  Testing + bug fixes
- [ ]  Launch preparation

---

## MVP Success Metrics

### User Engagement

- Daily Active Users (DAU)
- Average session duration
- Campaigns synced per user

### AI Performance

- Recommendation acceptance rate (target: >50%)
- Average ROAS improvement (target: +15%)
- Time saved vs manual management

### Revenue Impact

- Average ROAS uplift
- Total ad spend managed
- Revenue attributed through platform