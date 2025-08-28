# Performance Trend

Multi-period trend analysis with pattern detection and strategic recommendations.

## Process:

1. Read CLAUDE.md and performance context to understand strategic trajectory relevance.

2. Prompt for trend analysis parameters:
   ```
   📈 Performance Trend Analysis Setup
   
   Period Type: [day/week/month/quarter/year]
   Number of Periods: [count - e.g., 4 weeks, 3 months, 2 quarters]
   ```

3. Execute trend analysis:
   ```bash
   node scripts/performance-analyzer.cjs trend [period] [count]
   ```

4. Generate comprehensive trend analysis report in `journal/planning/trends/trend-[period]-[count]periods-YYYY-MM-DD.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: performance-trend
   period_type: [day/week/month/quarter/year]
   period_count: [number]
   analysis_range: [start] to [end]
   ---

   # Performance Trend Analysis: [Count] [Periods]

   ## Executive Trend Summary
   - Overall trajectory: [Improving/Declining/Stable/Cyclical]
   - Performance direction: [+/- X.X% average change per period]
   - Trend strength: [Strong/Moderate/Weak]
   - Pattern type: [Linear/Cyclical/Irregular/Seasonal]

   ## Quantitative Trend Analysis

   ### Completion Rate Trend
   - Starting rate: XX.X%
   - Ending rate: XX.X%  
   - Total change: +/- X.X%
   - Average change per period: +/- X.X%
   - Trend direction: [Improving/Declining/Stable]

   ### Wellbeing Trend Analysis
   | Metric | Start | End | Change | Trend |
   |--------|-------|-----|--------|--------|
   | Energy | X.X/10 | X.X/10 | +/- X.X | [↗️/↘️/→] |
   | Focus | X.X/10 | X.X/10 | +/- X.X | [↗️/↘️/→] |  
   | Satisfaction | X.X/10 | X.X/10 | +/- X.X | [↗️/↘️/→] |

   ## Pattern Detection Results

   ### Cyclical Patterns Identified
   [Regular cycles in performance - weekly, monthly, seasonal patterns]

   ### Peak Performance Periods
   [When performance is consistently highest and why]

   ### Low Performance Periods  
   [When performance dips and contributing factors]

   ### Consistency Analysis
   [How stable vs. variable performance has been]

   ## Moving Average Analysis
   [Smoothed trend line showing underlying trajectory beyond day-to-day variations]

   ## Strategic Trend Insights

   ### Positive Trend Drivers
   [What has consistently contributed to improvements]

   ### Negative Trend Influences
   [What has consistently hindered performance]

   ### Environmental Factor Correlation
   [External factors that correlate with performance changes]

   ## Trajectory Implications

   ### Current Trajectory Assessment
   [Where current trends will lead if continued]

   ### Goal Achievement Probability
   [Likelihood of meeting strategic objectives based on current trends]

   ### Course Correction Needs
   [Whether strategic adjustments are needed]

   ## Performance Prediction

   ### Next Period Forecast
   [Expected performance range based on trends]

   ### Seasonal/Cyclical Considerations
   [Known patterns that will affect upcoming periods]

   ### Strategic Milestone Timeline
   [When major goals might be achieved based on current trajectory]

   ## Trend-Based Recommendations

   ### Amplify Successful Patterns
   [What's working and should be enhanced]

   ### Address Declining Trends  
   [Areas needing intervention to prevent further decline]

   ### Optimize Cyclical Patterns
   [How to work with natural cycles rather than against them]

   ### Strategic Pivot Recommendations
   [Major changes needed if trends indicate strategic misalignment]

   ## Victory Pattern Evolution
   [How victory types and frequency have changed over the trend period]

   ## Environmental Optimization
   [Environmental or systematic changes that could improve trends]

   ## Next Actions Based on Trends

   ### Immediate Actions (Next Period)
   [Short-term adjustments to optimize performance]

   ### Medium-term Strategy (2-3 Periods)
   [Tactical changes to improve trajectory]

   ### Long-term Strategic Adjustments
   [Strategic pivots if trends indicate fundamental issues]
   ```

5. Provide strategic recommendations based on trend analysis:
   ```
   📊 Trend-Based Strategic Insights:
   • [Most significant trend pattern identified]
   • [Biggest opportunity for improvement]
   • [Greatest risk requiring mitigation]

   🎯 Recommended Strategic Actions:
   • [Immediate tactical adjustment]
   • [Medium-term process change]
   • [Long-term strategic pivot if needed]
   ```

6. Suggest follow-up actions:
   - Comparative analysis with similar periods: `/performance-compare`
   - Strategic planning revision if trends indicate problems
   - Dashboard review for current status: `/performance-dashboard`

Remember: Trend analysis reveals the underlying trajectory of fractal planning effectiveness and strategic goal achievement probability.