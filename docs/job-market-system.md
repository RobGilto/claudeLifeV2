# Job Market Analysis System

The job market analysis system provides data-driven career insights for the AI engineering transition.

## `/job-analysis` Command
- Comprehensive job market analysis using Firecrawl integration
- Searches major Australian job boards (Seek, Indeed, LinkedIn) for AI/Software Engineer roles
- Extracts and categorizes skill requirements from job descriptions
- Analyzes salary trends by experience level in AUD
- Generates skills gap analysis against current skill matrix
- Creates market trend data for long-term tracking
- Outputs detailed analysis files to `research/job-market/`

## `/skills-gap` Command
- Quick skills gap analysis against current job market data
- Visual progress bars showing skill levels vs market targets
- Identifies high-priority skills to develop based on demand frequency
- Highlights current strengths and emerging opportunities
- Shows quick wins available (skills close to targets)
- Provides weekly focus recommendations
- Tracks progress toward 2026 career goals

## Job Market Data Structure
```
research/job-market/
├── job-listings-YYYY-MM.json        # Raw job postings data
├── skills-analysis-YYYY-MM.json     # Processed skill requirements
├── gap-analysis-YYYY-MM-DD.json     # Skills gap vs your matrix
└── market-trends.json               # 3-month trend tracking
```

## Integration Features
- **Daily Brief**: Auto-includes market insights when data is available
- **Skills Matrix**: Gap analysis compares against your current skill levels
- **Weekly Updates**: Data refreshes automatically when over 1 week old
- **Australian Focus**: NSW/Sydney job market with AUD salary data
- **ADD-Optimized**: Visual progress indicators and prioritized recommendations