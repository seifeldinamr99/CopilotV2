# Meta Ads Management Platform - Technical Architecture

## Project Structure

### Monorepo Layout (Recommended)

```
meta-ads-platform/
├── apps/
│   ├── frontend/          # React + Vite frontend
│   └── backend/           # Node.js + Express backend
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── ui-components/     # Shared UI components (optional)
│   └── utils/             # Shared utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── package.json
├── turbo.json            # Turborepo config (optional)
└── README.md
```

### Backend Structure

```
apps/backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── campaigns.routes.ts
│   │   ├── recommendations.routes.ts
│   │   ├── shopify.routes.ts
│   │   ├── adsLibrary.routes.ts
│   │   └── creatives.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── meta.service.ts
│   │   ├── shopify.service.ts
│   │   ├── ai.service.ts (for Phase 8)
│   │   ├── creative.service.ts
│   │   └── sync.service.ts
│   ├── jobs/
│   │   ├── metaSync.job.ts
│   │   ├── shopifySync.job.ts
│   │   └── recommendationGeneration.job.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignList.tsx
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignDetail.tsx
│   │   │   └── MetricsChart.tsx
│   │   ├── recommendations/
│   │   │   ├── RecommendationList.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   └── ApprovalModal.tsx
│   │   ├── adsLibrary/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── AdGrid.tsx
│   │   │   ├── AdCard.tsx
│   │   │   └── AdDetailModal.tsx
│   │   └── creative/
│   │       ├── GenerationForm.tsx
│   │       ├── FormatSelector.tsx
│   │       ├── BrandAssets.tsx
│   │       └── TextOverlay.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Recommendations.tsx
│   │   ├── AdsLibrary.tsx
│   │   ├── CreativeStudio.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCampaigns.ts
│   │   ├── useRecommendations.ts
│   │   └── useMetrics.ts
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── campaignStore.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── calculations.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Data Flow Diagrams

### Campaign Sync Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Queue
    participant MetaAPI
    participant DB

    User->>Frontend: Click "Sync Campaigns"
    Frontend->>Backend: POST /api/campaigns/sync
    Backend->>Queue: Add sync job
    Backend->>Frontend: Job queued (202)
    Frontend->>User: Show syncing status

    Queue->>MetaAPI: Fetch ad accounts
    MetaAPI->>Queue: Return accounts
    Queue->>MetaAPI: Fetch campaigns
    MetaAPI->>Queue: Return campaigns
    Queue->>MetaAPI: Fetch insights
    MetaAPI->>Queue: Return insights
    Queue->>DB: Store campaigns & metrics
    DB->>Queue: Confirm storage
    Queue->>Backend: Job complete
    Backend->>Frontend: WebSocket: Sync complete
    Frontend->>User: Update UI
```

### Recommendation Flow (Mock → AI in Phase 8)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    participant MockGen
    participant MetaAPI

    User->>Frontend: Click "Generate Recommendations"
    Frontend->>Backend: POST /api/recommendations/generate
    Backend->>DB: Fetch campaign metrics
    DB->>Backend: Return metrics
    Backend->>MockGen: Analyze with rules
    Note over MockGen: Phase 8: Replace with AI Model
    MockGen->>Backend: Return recommendations
    Backend->>DB: Store recommendations
    Backend->>Frontend: Return recommendations
    Frontend->>User: Display recommendations

    User->>Frontend: Click "Approve"
    Frontend->>Backend: PUT /api/recommendations/:id/approve
    Backend->>MetaAPI: Execute change
    MetaAPI->>Backend: Confirm execution
    Backend->>DB: Update recommendation status
    Backend->>Frontend: Success
    Frontend->>User: Show success message
```

### Shopify Attribution Flow

```mermaid
sequenceDiagram
    participant ShopifyAPI
    participant Queue
    participant Backend
    participant DB

    Queue->>ShopifyAPI: Fetch new orders
    ShopifyAPI->>Queue: Return orders with UTM
    Queue->>Backend: Process orders
    Backend->>DB: Fetch campaigns
    DB->>Backend: Return campaigns
    Backend->>Backend: Match UTM to campaigns
    Backend->>DB: Update metrics with revenue
    DB->>Backend: Confirm update
    Backend->>Backend: Recalculate ROAS
    Backend->>DB: Store updated metrics
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String         @id @default(uuid())
  email                 String         @unique
  passwordHash          String
  name                  String
  metaAccessToken       String?        @db.Text
  shopifyAccessToken    String?        @db.Text
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  
  adAccounts            AdAccount[]
  shopifyStores         ShopifyStore[]
  savedAds              SavedAd[]
  brandAssets           BrandAsset[]
}

model AdAccount {
  id                String      @id @default(uuid())
  userId            String
  metaAccountId     String      @unique
  accountName       String
  currency          String
  timezone          String
  lastSyncedAt      DateTime?
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaigns         Campaign[]
  
  @@index([userId])
}

model Campaign {
  id                String          @id @default(uuid())
  adAccountId       String
  metaCampaignId    String          @unique
  name              String
  status            String
  objective         String
  dailyBudget       Decimal?        @db.Decimal(10, 2)
  lifetimeBudget    Decimal?        @db.Decimal(10, 2)
  lastSyncedAt      DateTime?
  
  adAccount         AdAccount       @relation(fields: [adAccountId], references: [id], onDelete: Cascade)
  adSets            AdSet[]
  metrics           Metric[]
  recommendations   Recommendation[]
  
  @@index([adAccountId])
  @@index([metaCampaignId])
}

model AdSet {
  id                String      @id @default(uuid())
  campaignId        String
  metaAdSetId       String      @unique
  name              String
  status            String
  
  campaign          Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  ads               Ad[]
  
  @@index([campaignId])
}

model Ad {
  id                String      @id @default(uuid())
  adSetId           String
  metaAdId          String      @unique
  name              String
  status            String
  
  adSet             AdSet       @relation(fields: [adSetId], references: [id], onDelete: Cascade)
  
  @@index([adSetId])
}

model Metric {
  id                String      @id @default(uuid())
  campaignId        String
  date              DateTime    @db.Date
  spend             Decimal     @db.Decimal(10, 2)
  impressions       Int
  clicks            Int
  conversions       Int
  revenue           Decimal?    @db.Decimal(10, 2)
  roas              Decimal?    @db.Decimal(10, 4)
  cpa               Decimal?    @db.Decimal(10, 2)
  ctr               Decimal?    @db.Decimal(10, 4)
  cpm               Decimal?    @db.Decimal(10, 2)
  
  campaign          Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  @@unique([campaignId, date])
  @@index([campaignId])
  @@index([date])
}

model Recommendation {
  id                String      @id @default(uuid())
  campaignId        String
  type              String
  currentValue      Json
  suggestedValue    Json
  reasoning         String      @db.Text
  confidenceScore   Decimal?    @db.Decimal(3, 2)
  expectedOutcome   Json?
  actualOutcome     Json?
  status            String      @default("pending")
  createdAt         DateTime    @default(now())
  executedAt        DateTime?
  
  campaign          Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  @@index([campaignId])
  @@index([status])
}

model ShopifyStore {
  id                String          @id @default(uuid())
  userId            String
  shopDomain        String          @unique
  accessToken       String          @db.Text
  lastSyncedAt      DateTime?
  
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders            ShopifyOrder[]
  
  @@index([userId])
}

model ShopifyOrder {
  id                String          @id @default(uuid())
  shopifyStoreId    String
  orderId           String          @unique
  revenue           Decimal         @db.Decimal(10, 2)
  utmSource         String?
  utmCampaign       String?
  campaignId        String?
  createdAt         DateTime
  
  shopifyStore      ShopifyStore    @relation(fields: [shopifyStoreId], references: [id], onDelete: Cascade)
  
  @@index([shopifyStoreId])
  @@index([utmCampaign])
  @@index([createdAt])
}

model SavedAd {
  id                String      @id @default(uuid())
  userId            String
  metaAdArchiveId   String
  adCreativeBody    String?     @db.Text
  adSnapshotUrl     String?     @db.Text
  metadata          Json?
  savedAt           DateTime    @default(now())
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model BrandAsset {
  id                String      @id @default(uuid())
  userId            String
  type              String
  fileUrl           String
  metadata          Json?
  createdAt         DateTime    @default(now())
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

---

## API Service Examples

### Meta API Service

```typescript
// services/meta.service.ts
import axios from 'axios';

export class MetaService {
  private apiVersion = 'v21.0';
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  async fetchAdAccounts(accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/me/adaccounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,currency,timezone'
      }
    });
    return response.data.data;
  }

  async fetchCampaigns(accountId: string, accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/${accountId}/campaigns`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,status,objective,daily_budget,lifetime_budget'
      }
    });
    return response.data.data;
  }

  async fetchInsights(campaignId: string, accessToken: string, dateRange: { since: string; until: string }) {
    const response = await axios.get(`${this.baseUrl}/${campaignId}/insights`, {
      params: {
        access_token: accessToken,
        time_range: JSON.stringify(dateRange),
        fields: 'spend,impressions,clicks,conversions,cpm,ctr,cpa',
        action_attribution_windows: '1d_click,7d_click,28d_click'
      }
    });
    return response.data.data[0];
  }

  async updateCampaignBudget(campaignId: string, accessToken: string, dailyBudget: number) {
    const response = await axios.post(`${this.baseUrl}/${campaignId}`, {
      access_token: accessToken,
      daily_budget: dailyBudget * 100 // Meta uses cents
    });
    return response.data;
  }

  async updateCampaignStatus(campaignId: string, accessToken: string, status: 'ACTIVE' | 'PAUSED') {
    const response = await axios.post(`${this.baseUrl}/${campaignId}`, {
      access_token: accessToken,
      status
    });
    return response.data;
  }
}
```

### Mock Recommendation Service (Phase 3)

```typescript
// services/recommendation.service.ts
import { prisma } from '../config/database';

export class RecommendationService {
  async generateRecommendations(userId: string) {
    // Fetch campaigns with metrics
    const campaigns = await prisma.campaign.findMany({
      where: {
        adAccount: {
          userId
        }
      },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    const recommendations = [];

    for (const campaign of campaigns) {
      const avgRoas = this.calculateAvgRoas(campaign.metrics);
      const avgCpa = this.calculateAvgCpa(campaign.metrics);

      // Budget increase for high performers
      if (avgRoas > 3.0 && campaign.dailyBudget) {
        recommendations.push({
          campaignId: campaign.id,
          type: 'budget_increase',
          currentValue: { dailyBudget: campaign.dailyBudget },
          suggestedValue: { dailyBudget: campaign.dailyBudget * 1.2 },
          reasoning: `Campaign has strong ROAS of ${avgRoas.toFixed(2)}. Increasing budget by 20% could scale results.`,
          confidenceScore: 0.85,
          expectedOutcome: {
            roasChange: '+5%',
            revenueIncrease: '$500'
          }
        });
      }

      // Pause underperformers
      if (avgRoas < 1.0 && campaign.status === 'ACTIVE') {
        recommendations.push({
          campaignId: campaign.id,
          type: 'pause_campaign',
          currentValue: { status: 'ACTIVE' },
          suggestedValue: { status: 'PAUSED' },
          reasoning: `Campaign ROAS of ${avgRoas.toFixed(2)} is below profitable threshold. Consider pausing.`,
          confidenceScore: 0.90,
          expectedOutcome: {
            costSavings: '$200/day'
          }
        });
      }
    }

    // Store recommendations
    await prisma.recommendation.createMany({
      data: recommendations
    });

    return recommendations;
  }

  private calculateAvgRoas(metrics: any[]) {
    const validMetrics = metrics.filter(m => m.roas);
    if (validMetrics.length === 0) return 0;
    return validMetrics.reduce((sum, m) => sum + Number(m.roas), 0) / validMetrics.length;
  }

  private calculateAvgCpa(metrics: any[]) {
    const validMetrics = metrics.filter(m => m.cpa);
    if (validMetrics.length === 0) return 0;
    return validMetrics.reduce((sum, m) => sum + Number(m.cpa), 0) / validMetrics.length;
  }
}
```

---

## Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meta_ads_platform"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Meta
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_REDIRECT_URI="http://localhost:3000/api/auth/meta/callback"

# Shopify
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
SHOPIFY_REDIRECT_URI="http://localhost:3000/api/auth/shopify/callback"

# Image Generation (Nano Banana)
IMAGE_API_KEY="your-image-api-key"
IMAGE_API_URL="https://api.nanobanana.com"

# Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="meta-ads-platform"
AWS_REGION="us-east-1"

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"

# Server
PORT=3000
NODE_ENV="development"
```

### Frontend `.env`

```env
VITE_API_URL="http://localhost:3000/api"
VITE_WS_URL="ws://localhost:3000"
```

---

## Security - Token Encryption

```typescript
// utils/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "CDN/Edge"
        Vercel[Vercel Frontend]
    end

    subgraph "Application Layer"
        Backend[Railway/Render Backend]
        Queue[Bull Queue Workers]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Redis[(Redis)]
        S3[AWS S3]
    end

    subgraph "External APIs"
        Meta[Meta API]
        Shopify[Shopify API]
        ImageGen[Nano Banana API]
    end

    Browser --> Vercel
    Vercel --> Backend
    Backend --> DB
    Backend --> Redis
    Backend --> S3
    Queue --> Redis
    Queue --> Meta
    Queue --> Shopify
    Backend --> ImageGen
```

---

## Next Steps

1. Review architecture document
2. Set up development environment
3. Initialize monorepo structure
4. Begin Phase 1 implementation
