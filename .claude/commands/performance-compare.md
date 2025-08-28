# Performance Compare

Side-by-side comparison of two planning periods with insights and recommendations.

## Process:

1. Read CLAUDE.md and existing performance context to understand comparison relevance.

2. Prompt for comparison parameters:
   ```
   📊 Performance Comparison Setup
   
   Period Type: [day/week/month/quarter/year]
   Period 1: [identifier - e.g., 2024-W03, 2024-01, 2024-Q1]
   Period 2: [identifier - e.g., 2024-W04, 2024-02, 2024-Q2]
   ```

3. Execute performance comparison:
   ```bash
   node scripts/performance-analyzer.cjs compare [period] [id1] [id2]
   ```

4. Generate detailed comparison report in `journal/planning/comparisons/compare-[period]-[id1]-vs-[id2].md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: performance-comparison
   period_type: [day/week/month/quarter/year]
   period_1: [identifier]
   period_2: [identifier]
   ---

   # Performance Comparison: [Period 1] vs [Period 2]

   ## Executive Summary
   - Overall performance change: [Improved/Declined/Stable]
   - Completion rate change: [+/- X.X%]
   - Wellbeing trend: [Improved/Declined/Stable]
   - Strategic alignment shift: [Better/Worse/Same]

   ## Quantitative Comparison

   ### Completion Metrics
   | Metric | [Period 1] | [Period 2] | Change |
   |--------|------------|------------|---------|
   | Completion Rate | XX.X% | XX.X% | +/- X.X% |
   | Objectives Met | X/Y | X/Y | +/- X |
   | Time Block Adherence | XX.X% | XX.X% | +/- X.X% |

   ### Wellbeing Metrics
   | Metric | [Period 1] | [Period 2] | Change |
   |--------|------------|------------|---------|
   | Energy Average | X.X/10 | X.X/10 | +/- X.X |
   | Focus Quality | X.X/10 | X.X/10 | +/- X.X |
   | Satisfaction | X.X/10 | X.X/10 | +/- X.X |

   ## Qualitative Analysis

   ### What Improved
   [Specific areas where Period 2 outperformed Period 1]

   ### What Declined  
   [Specific areas where Period 2 underperformed compared to Period 1]

   ### What Remained Consistent
   [Stable patterns and performance areas]

   ## Performance Insights

   ### Success Pattern Analysis
   [What contributed to improvements between periods]

   ### Challenge Pattern Analysis
   [What caused declines or persistent issues]

   ### Environmental Factor Impact
   [External factors that influenced performance differences]

   ## Strategic Learning

   ### Successful Strategies from Period 2
   [Approaches that should be replicated]

   ### Lessons from Period 1
   [Insights from the earlier period that remain relevant]

   ### Process Improvements Identified
   [System or workflow changes that could help]

   ## Recommendations

   ### Continue/Amplify
   [What's working well and should be increased]

   ### Modify/Adjust
   [What needs tweaking but shouldn't be abandoned]

   ### Stop/Replace
   [What isn't working and should be changed]

   ## Next Period Strategy
   [How insights from this comparison should inform future planning]

   ## Victory Pattern Evolution
   [How victory types and frequency changed between periods]
   ```

5. Provide specific actionable insights:
   ```
   💡 Key Insights:
   • [Most important pattern discovered]
   • [Critical success factor identified]
   • [Main improvement opportunity]

   🎯 Recommended Actions:
   • [Specific change to implement]
   • [Process adjustment to make]  
   • [Strategic focus to adopt]
   ```

6. Suggest follow-up analyses:
   - Trend analysis over more periods: `/performance-trend [period] [count]`
   - Deeper dashboard review: `/performance-dashboard`
   - Strategic planning adjustment if major gaps identified

Remember: Performance comparison reveals patterns and insights that drive continuous improvement in fractal planning effectiveness.