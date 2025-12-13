# AI Ads Creative Generation - Requirements Document

## Overview
The AI Ads Creative Generation page is a comprehensive creative studio that combines Meta Ads Library browsing, brand asset management, and AI-powered image generation using Nano Banana API to help users create stunning ad creatives.

---

## Design Reference
![AI Ads Creative Page Design](C:/Users/DELL/.gemini/antigravity/brain/7d767c57-4b41-4903-a9e7-10019c0cbb2c/uploaded_image_1765372287435.png)

---

## Page Layout Structure

### Navigation Tabs
**Location**: Top of page, below header

**Tabs**:
1. **Ad Library** - Browse Meta Ads Library
2. **Brand Library** - Manage brand assets
3. **My AI Generations** - AI-generated creatives workspace
4. **My Creatives** - Saved/finalized creatives

**Styling**:
- Horizontal tab bar
- Active tab: Light blue underline (`#38bdf8`)
- Inactive tabs: Gray text
- Smooth transition on switch

---

## Tab 1: Ad Library

### Purpose
Browse and search Meta Ads Library for competitor research and creative inspiration.

### Header Section
**Location**: Top-right

**Components**:
- **"Your Boards" Dropdown**: Organize saved ads into boards/collections
- **"Import Ads" Button**: Import selected ads to workspace
- **"Generate with AI" Button**: Primary CTA (light blue gradient)

### Main Content Area

#### Ad Grid Display
**Layout**: 4-column grid (responsive)

**Ad Card Structure**:
```
┌─────────────────────┐
│                     │
│   [Ad Image]        │
│                     │
│                     │
├─────────────────────┤
│ 🎨 Finish with      │
│    Designer         │
│ ⚡ All Actions ⋯   │
└─────────────────────┘
```

**Card Components**:
- **Ad Image**: Full-width thumbnail
- **Bookmark Icon**: Top-right corner (save to boards)
- **Bottom Actions**:
  - "Finish with Designer" button (purple/blue)
  - "All Actions" dropdown menu

**Ad Examples Shown**:
1. Nature product ad (supplement bottle in landscape)
2. BMW Performance car ad
3. Fashion/apparel ad (The Omens)
4. Nike shoes product ad
5. Car in urban setting
6. Jewelry ad (Forever Linked)
7. Adventure/travel ad (Adventure Awaits)
8. Fishing/outdoor ad (The Thrill of the Catch)

### Search & Filter Panel
**Location**: Left sidebar or top bar

**Filters**:
- **Search Bar**: Keyword/advertiser search
- **Country**: Dropdown (US, UK, CA, etc.)
- **Platform**: Facebook, Instagram, Both
- **Media Type**: Image, Video, Carousel
- **Status**: Active, Inactive, All
- **Date Range**: Custom date picker
- **Industry**: E-commerce, SaaS, Fashion, etc.

### Functionality
- **Search**: Real-time search with debounce
- **Save to Boards**: Click bookmark icon
- **Import**: Select multiple ads, click "Import Ads"
- **Quick Actions**:
  - View full ad details
  - Download creative
  - Use as inspiration
  - Generate similar with AI
- **Pagination**: Infinite scroll or load more

### API Integration
**Meta Ads Library API**:
- Endpoint: `GET /ads_archive`
- Rate limit: ~200 requests/hour
- Cache results: 24 hours

---

## Tab 2: Brand Library

### Purpose
Centralized brand asset management for consistent creative generation.

### Asset Categories

#### 1. Logo Assets
**Upload Section**:
- Drag & drop area
- File types: PNG (with transparency), SVG
- Max size: 5MB
- Multiple logo variations (primary, secondary, icon)

**Display**:
- Grid of uploaded logos
- Preview on dark/light backgrounds
- Edit/delete options

#### 2. Brand Colors
**Color Palette Manager**:
- **Primary Colors**: 3-5 main brand colors
- **Secondary Colors**: Supporting palette
- **Color Picker**: HEX, RGB, HSL input
- **Saved Palettes**: Multiple palette sets

**Display**:
```
Primary Colors:
[#FF5733] [#3498DB] [#2ECC71]

Secondary Colors:
[#95A5A6] [#E74C3C] [#F39C12]
```

**Functionality**:
- Click to copy HEX code
- Auto-generate complementary colors
- Import from image
- Export palette

#### 3. Product Images
**Upload Section**:
- Bulk upload support
- File types: JPG, PNG, WebP
- Max size: 10MB per image
- Auto-categorization by product type

**Display**:
- Grid view with thumbnails
- Product name/category tags
- Quick preview
- Background removal option

**Metadata**:
- Product name
- Category
- Tags
- Upload date

#### 4. Fonts
**Font Manager**:
- Upload custom fonts (TTF, OTF, WOFF)
- Google Fonts integration
- Font pairing suggestions

**Display**:
- Font preview with sample text
- Font family, weight, style
- Usage examples

### Brand Guidelines Section
**Optional Fields**:
- Brand voice/tone
- Do's and Don'ts
- Messaging guidelines
- Target audience

---

## Tab 3: My AI Generations

### Purpose
AI-powered creative generation workspace using Nano Banana API.

### Layout
**Two-Panel Design**:
- **Left Panel**: Generation controls (30%)
- **Right Panel**: Preview and results (70%)

### Left Panel: Generation Controls

#### 1. Input Section
**Prompt Input**:
- Large textarea for text prompt
- Character limit: 500
- Placeholder: "Describe your ad creative..."
- AI suggestions/autocomplete

**Template Library**:
- Pre-built prompt templates:
  - Product showcase
  - Lifestyle scene
  - Seasonal/holiday
  - Announcement/launch
  - Testimonial/social proof
  - Before/after
  - Limited time offer

#### 2. Brand Assets Selection
**Auto-Apply Toggle**:
- ☑️ Apply brand colors
- ☑️ Include logo
- ☑️ Use product images

**Asset Picker**:
- Select specific logo variation
- Choose product image(s)
- Select color palette

#### 3. Format Selection
**Aspect Ratios**:
- ☐ 1:1 (Square - Feed)
- ☐ 4:5 (Portrait - Feed)
- ☐ 9:16 (Story/Reels)
- ☐ 16:9 (Landscape)

**Multiple Selection**: Generate all formats at once

#### 4. Style Settings
**Style Presets**:
- Photorealistic
- Illustrated
- Minimalist
- Bold/Vibrant
- Elegant/Luxury
- Playful/Fun

**Advanced Settings** (Collapsible):
- Negative prompt
- Image strength
- Guidance scale
- Number of variations (1-5)

#### 5. Generate Button
**Primary CTA**:
- Large, prominent button
- Light blue gradient
- Loading state with progress
- Estimated time display

### Right Panel: Preview & Results

#### Generation Preview
**Before Generation**:
- Empty state with placeholder
- Example generations
- Quick start guide

**During Generation**:
- Loading animation
- Progress bar
- Status messages
- Estimated time remaining

**After Generation**:
- Grid of generated variations (2x2 or 3x2)
- Hover to enlarge
- Select favorite(s)

#### Generated Image Card
```
┌─────────────────────┐
│                     │
│   [Generated Image] │
│                     │
├─────────────────────┤
│ ⭐ Favorite         │
│ 💾 Save             │
│ 🔄 Regenerate       │
│ ✏️ Edit             │
└─────────────────────┘
```

**Actions**:
- **Favorite**: Mark for quick access
- **Save**: Add to My Creatives
- **Regenerate**: Generate similar variation
- **Edit**: Open in editor

### Text Overlay Editor
**Location**: Opens as modal/side panel

**Features**:
- Add text layers
- Font selection (from Brand Library)
- Size, color, alignment
- Text effects (shadow, outline, gradient)
- Position with drag & drop
- Layer management

**Pre-built Text Templates**:
- Headlines
- CTAs
- Discount badges
- Urgency messages

### Export Options
**Formats**:
- PNG (high quality)
- JPG (optimized)
- WebP (modern)

**Actions**:
- Download to device
- Save to My Creatives
- Upload directly to Meta Ads Manager
- Share link

---

## Tab 4: My Creatives

### Purpose
Library of saved and finalized creatives ready for use.

### Layout
**Grid View with Filters**:

**Creative Card**:
```
┌─────────────────────┐
│                     │
│   [Creative Image]  │
│                     │
├─────────────────────┤
│ Campaign Name       │
│ 1:1 • Created Dec 10│
│ 📥 Download         │
│ 🚀 Use in Campaign  │
└─────────────────────┘
```

### Organization
**Folders/Collections**:
- Create custom folders
- Drag & drop to organize
- Bulk move/delete

**Metadata**:
- Creative name
- Format/dimensions
- Creation date
- Associated campaign
- Tags

### Actions
- **Download**: Single or bulk
- **Use in Campaign**: Direct integration
- **Edit**: Reopen in editor
- **Duplicate**: Create copy
- **Delete**: Move to trash
- **Share**: Generate shareable link

### Search & Filter
- Search by name, tags
- Filter by format, date, campaign
- Sort by recent, name, size

---

## Color Scheme (Consistent with Home Page)

### Primary Colors
- **Background**: Dark slate gradient (`#0f172a` to `#1e293b`)
- **Card Background**: `rgba(255, 255, 255, 0.05)`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `rgba(255, 255, 255, 0.7)`

### Accent Colors
- **Primary Accent**: `#38bdf8` (light blue)
- **Secondary Accent**: `#0ea5e9` (blue)
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)

---

## API Integrations

### 1. Meta Ads Library API
**Endpoint**: `GET https://graph.facebook.com/v21.0/ads_archive`

**Request Parameters**:
```javascript
{
  search_terms: "keyword or advertiser",
  ad_reached_countries: "US",
  ad_active_status: "ALL",
  fields: "id,ad_creative_body,ad_creative_link_title,ad_snapshot_url,ad_delivery_start_time"
}
```

**Response Handling**:
- Parse ad data
- Extract image URLs
- Store metadata
- Cache for 24 hours

### 2. Nano Banana API
**Endpoint**: `POST https://api.nanobanana.com/generate`

**Request Payload**:
```javascript
{
  prompt: "Product on marble surface, studio lighting",
  style: "photorealistic",
  aspect_ratio: "1:1",
  brand_colors: ["#FF5733", "#3498DB"],
  negative_prompt: "blurry, low quality",
  num_variations: 3
}
```

**Response**:
```javascript
{
  images: [
    {
      url: "https://cdn.nanobanana.com/gen_123.jpg",
      generation_id: "gen_123"
    }
  ],
  generation_time: 8.5
}
```

**Features to Use**:
- Text-to-image generation
- Style transfer
- Background removal
- Image upscaling
- Inpainting (edit specific areas)

### 3. Brand Assets Storage
**AWS S3 or Cloudinary**:
- Upload brand assets
- Generate thumbnails
- CDN delivery
- Secure URLs

---

## Workflows

### Workflow 1: Generate Ad from Scratch
1. Navigate to "My AI Generations"
2. Enter text prompt or select template
3. Choose brand assets to apply
4. Select format(s)
5. Choose style preset
6. Click "Generate with AI"
7. Review variations
8. Add text overlays
9. Save to My Creatives
10. Export or use in campaign

### Workflow 2: Remix Competitor Ad
1. Navigate to "Ad Library"
2. Search for competitor ads
3. Find inspiring ad
4. Click "Generate Similar with AI"
5. AI analyzes ad and creates prompt
6. Customize prompt and settings
7. Generate variations
8. Edit and finalize
9. Save to My Creatives

### Workflow 3: Batch Generation
1. Upload product images to Brand Library
2. Create prompt template
3. Select multiple product images
4. Generate ad for each product
5. Review all variations
6. Bulk save to My Creatives
7. Organize into campaign folder

---

## Technical Implementation

### React Components Structure
```
AIAdsPage/
├── TabNavigation
├── AdLibrary/
│   ├── SearchFilters
│   ├── AdGrid
│   └── AdCard
├── BrandLibrary/
│   ├── LogoUpload
│   ├── ColorPalette
│   ├── ProductImages
│   └── FontManager
├── MyAIGenerations/
│   ├── GenerationControls
│   ├── PromptInput
│   ├── BrandAssetSelector
│   ├── FormatSelector
│   ├── StyleSettings
│   ├── PreviewPanel
│   └── TextOverlayEditor
└── MyCreatives/
    ├── CreativeGrid
    └── FolderOrganizer
```

### State Management
- **React Query**: API data fetching and caching
- **Zustand**: UI state (active tab, filters, selections)
- **Context**: Brand assets, user preferences

### File Upload
- **react-dropzone**: Drag & drop uploads
- **Image compression**: Before upload
- **Progress tracking**: Upload status
- **Validation**: File type, size limits

---

## Performance Considerations

### Optimization
- Lazy load images (Intersection Observer)
- Virtual scrolling for large grids
- Image CDN with optimization
- Debounce search inputs
- Cache API responses

### Loading States
- Skeleton screens for grids
- Shimmer effects on cards
- Progress bars for generation
- Optimistic UI updates

---

## Accessibility

### ARIA Labels
- Proper labels for all controls
- Screen reader announcements
- Semantic HTML structure

### Keyboard Navigation
- Tab through all interactive elements
- Arrow keys for grid navigation
- Shortcuts for common actions

### Color Contrast
- Minimum 4.5:1 for text
- Focus indicators visible
- Alternative text for images

---

## Success Metrics

### User Engagement
- Number of generations per user
- Time spent in creative studio
- Conversion: generation → campaign use
- Brand asset upload rate

### Quality Metrics
- Generation success rate
- User satisfaction (ratings)
- Regeneration rate
- Export/download rate

### Performance
- Generation time < 10 seconds
- Page load time < 2 seconds
- Image load time < 1 second
- API response time < 500ms
