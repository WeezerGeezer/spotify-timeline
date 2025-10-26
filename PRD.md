# Product Requirements Document: Year-End Playlist Analyzer

## 1. Product Overview

### 1.1 Product Name
Year-End Playlist Analyzer (Spotify/Apple Music Timeline)

### 1.2 Vision
Create an interactive web application that visualizes how music listening habits evolve over time through year-end playlists, using Sankey diagrams to reveal patterns in genre preferences, artist loyalty, and musical discovery across multiple years.

### 1.3 Problem Statement
Music streaming platforms provide year-end playlists (e.g., Spotify Wrapped, Apple Music Replay), but users lack tools to:
- Compare their top tracks across multiple years
- Visualize how their music taste evolves over time
- Identify recurring artists, genres, or albums across years
- Discover patterns in their listening habits

### 1.4 Target Users
- Music enthusiasts who want to analyze their listening history
- Data visualization enthusiasts
- Users with multiple years of streaming data
- Music bloggers and content creators
- Playlist curators

## 2. Core Features

### 2.1 Playlist Input & Management
**Priority: P0 (Must Have)**

**Requirements:**
- Support Spotify playlist URLs
- Support Apple Music playlist URLs (future enhancement)
- Accept up to 10 playlists (one per year recommended)
- Each playlist can contain up to 100 tracks
- Validate playlist accessibility before processing
- Display playlist metadata (name, year, track count)

**Acceptance Criteria:**
- Users can paste multiple playlist URLs
- System validates URLs and displays error messages for invalid inputs
- System retrieves playlist data via API integration
- Loading states shown during data fetch

### 2.2 Sankey Diagram Visualization
**Priority: P0 (Must Have)**

**Requirements:**
- Display interactive Sankey diagram
- Each column represents one playlist/year
- Tracks flow between columns based on appearance in consecutive playlists
- Track width proportional to play count (if available) or equal width
- Smooth, animated transitions
- Responsive design (desktop, tablet, mobile)

**Visual Specifications:**
- Minimum column width: 120px
- Maximum visible columns: auto-scroll for >5 years
- Track node height: minimum 5px
- Flow curves: bezier curves for smooth connections
- Color opacity: 70% for flows, 100% for nodes

**Acceptance Criteria:**
- Diagram renders correctly with 2-10 playlists
- Users can hover over tracks to see details
- Flows clearly show track continuity across years
- Diagram is readable on screens ≥768px width

### 2.3 Color Coding System
**Priority: P0 (Must Have)**

**Requirements:**
Implement four color-coding modes with toggle functionality:

#### 2.3.1 Genre-Based Coloring
- Assign colors based on primary genre
- Genre data from Spotify/Apple Music API
- Predefined color palette for common genres:
  - Pop: #FF6B9D
  - Rock: #C44536
  - Hip-Hop/Rap: #A64DFF
  - Electronic/Dance: #00D9FF
  - R&B/Soul: #FFB84D
  - Country: #8B4513
  - Jazz: #4ECDC4
  - Classical: #95A3B3
  - Indie: #FFE66D
  - Alternative: #6BCF7F
  - Other/Multi-genre: #CCCCCC

#### 2.3.2 Artist-Based Coloring
- Each unique artist gets a distinct color
- Use color generation algorithm for >20 artists
- Top 10 artists get predefined vibrant colors
- Remaining artists get auto-generated colors (HSL distribution)

#### 2.3.3 Album-Based Coloring
- Each unique album gets a distinct color
- Option to use album artwork dominant color
- Fallback to auto-generated colors for albums without artwork

#### 2.3.4 Release Year Coloring
- Gradient based on track release year
- Blue (oldest) → Red (newest)
- Display color legend with year range
- Example: 1980s = deep blue, 2020s = bright red

**Acceptance Criteria:**
- Radio buttons or toggle to switch between color modes
- Smooth transition animation when changing modes (300ms)
- Color legend displays current mode's key
- Colors are accessible (WCAG AA contrast ratio)
- Colorblind-friendly mode available

### 2.4 Interactive Features
**Priority: P1 (Should Have)**

**Requirements:**
- **Hover Tooltips:** Display track name, artist, album, genre, release year, playlist position
- **Click to Highlight:** Click a track to highlight its flow across all years
- **Search/Filter:** Search bar to find specific tracks, artists, or albums
- **Zoom & Pan:** Allow zooming into diagram sections
- **Export:** Download diagram as PNG or SVG

**Acceptance Criteria:**
- Tooltips appear within 100ms of hover
- Highlighted flows are visually distinct (increased opacity, glow effect)
- Search results highlight matching tracks in real-time
- Zoom range: 50% to 200%
- Export maintains current view and color scheme

### 2.5 Analytics Dashboard
**Priority: P2 (Nice to Have)**

**Requirements:**
Display summary statistics:
- Total unique tracks across all years
- Most recurring tracks (appeared in N years)
- Top artists by total appearances
- Genre distribution over time (stacked area chart)
- Discovery rate (% new tracks each year)
- Artist loyalty score (recurring artists vs. new artists)

**Acceptance Criteria:**
- Dashboard accessible via tab or collapsible panel
- Statistics update when playlists change
- Visual mini-charts for trends
- Exportable summary report (PDF or text)

## 3. Technical Requirements

### 3.1 Platform Support
- **Primary:** Web application (Chrome, Firefox, Safari, Edge - latest 2 versions)
- **Mobile:** Responsive design, touch-friendly on iOS/Android browsers
- **Offline:** Not required for MVP

### 3.2 API Integration
- **Spotify API:**
  - OAuth 2.0 authentication
  - Playlist retrieval
  - Track metadata (genre, release year, audio features)
  - Artist metadata
- **Apple Music API:** (Future phase)
  - MusicKit JS integration
  - Playlist retrieval
  - Track/artist metadata

### 3.3 Performance Requirements
- Initial load time: <3 seconds
- Playlist processing: <5 seconds per playlist
- Diagram rendering: <2 seconds for up to 10 playlists
- Smooth animations: 60fps minimum
- API rate limiting: Implement exponential backoff

### 3.4 Data Privacy
- No long-term storage of user listening data
- Session-based data only
- Clear data retention policy
- OAuth tokens stored securely (httpOnly cookies)
- No third-party analytics without consent

## 4. Technology Stack Recommendations

### 4.1 Frontend
- **Framework:** React 18+ with TypeScript
- **Visualization:** D3.js (Sankey diagram generation)
- **UI Library:** Tailwind CSS or Material-UI
- **State Management:** React Context API or Zustand
- **HTTP Client:** Axios

### 4.2 Backend
- **Framework:** Flask (Python) or Node.js/Express
- **API Integration:** Spotipy (Python) or spotify-web-api-node
- **Authentication:** OAuth 2.0 with PKCE flow
- **Caching:** Redis (optional for API response caching)

### 4.3 Deployment
- **Hosting:** Vercel, Netlify, or Railway
- **Database:** Not required for MVP (session storage only)
- **CDN:** For static assets

## 5. User Experience Flow

### 5.1 Onboarding
1. Landing page with example visualization
2. "Connect with Spotify" button
3. OAuth authorization
4. Brief tutorial overlay (dismissible)

### 5.2 Main Workflow
1. Select or paste playlist URLs (manual entry or auto-detect from user's library)
2. Optionally label each playlist with a year
3. Click "Generate Visualization"
4. View Sankey diagram with default genre coloring
5. Toggle between color modes
6. Interact with tracks (hover, click, search)
7. Export or share visualization

### 5.3 Error Handling
- Clear error messages for:
  - Invalid playlist URLs
  - Private/inaccessible playlists
  - API rate limits
  - Network failures
- Retry mechanism for failed API calls
- Graceful degradation (show partial data if some playlists fail)

## 6. Success Metrics

### 6.1 User Engagement
- Average playlists analyzed per session: ≥3
- Interaction rate (hover/click/filter usage): ≥60%
- Session duration: ≥5 minutes
- Return user rate: ≥20% within 30 days

### 6.2 Technical Performance
- API success rate: ≥98%
- Visualization render success rate: ≥95%
- Average load time: <3 seconds
- Mobile usability score: ≥80

### 6.3 User Satisfaction
- Net Promoter Score (NPS): ≥40
- Feature usage: Color toggle used in ≥70% of sessions
- Export usage: ≥30% of sessions

## 7. Future Enhancements

### Phase 2
- Apple Music integration
- Playlist comparison mode (side-by-side)
- Audio feature analysis (tempo, energy, danceability trends)
- Social sharing with custom URL

### Phase 3
- Collaborative playlist analysis (compare with friends)
- Machine learning: predict next year's top tracks
- Spotify playlist generator based on analysis
- Historical data tracking (save analysis over time)

### Phase 4
- Desktop app (Electron)
- Podcast episode tracking
- Album artwork mosaic view
- Music recommendation engine based on patterns

## 8. Open Questions & Decisions Needed

1. **Playlist Limits:** Should we support playlists with >100 tracks? (Consider performance)
2. **Apple Music Priority:** When to implement Apple Music support?
3. **Monetization:** Free tier vs. premium features?
4. **Customization:** Allow users to upload custom color palettes?
5. **Data Export:** What additional export formats (JSON, CSV)?
6. **Collaboration:** Support multi-user/shared analysis?

## 9. Constraints & Risks

### 9.1 Constraints
- Spotify API rate limits (varies by endpoint)
- Apple Music API requires user authentication
- Browser performance for large datasets (>1000 tracks)
- Mobile screen size limitations for complex diagrams

### 9.2 Risks
- **High:** API changes or deprecation
- **Medium:** Performance issues with large datasets
- **Medium:** User confusion with complex visualization
- **Low:** OAuth security vulnerabilities

### 9.3 Mitigation Strategies
- Implement robust error handling and fallbacks
- Optimize rendering with virtualization
- Provide clear UI instructions and tooltips
- Regular security audits and dependency updates

## 10. Timeline Estimate

- **Phase 1 (MVP):** 6-8 weeks
  - Week 1-2: Setup, Spotify OAuth, API integration
  - Week 3-4: Sankey diagram implementation
  - Week 5-6: Color coding system and interactivity
  - Week 7-8: Polish, testing, deployment

- **Phase 2 (Enhancements):** 4-6 weeks
  - Analytics dashboard
  - Apple Music integration
  - Performance optimization

## 11. Appendix

### 11.1 Design Inspirations
- Spotify Wrapped interactive elements
- SankeyMATIC (sankey diagram tool)
- Pudding.cool visualizations
- Observable D3 examples

### 11.2 Competitive Analysis
- **Stats for Spotify:** Focus on statistics, lacks temporal visualization
- **Obscurify:** Genre analysis, but no year-over-year comparison
- **Receiptify:** Receipt-style playlist, static image only
- **Opportunity:** Interactive Sankey diagram is unique in this space

### 11.3 Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Reduced motion option (disable animations)
- Text size adjustability

---

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Owner:** Development Team
**Status:** Draft - Awaiting Approval
