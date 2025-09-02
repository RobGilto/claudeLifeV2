# Define Values Command

## Purpose
Establish core personal values that serve as the foundation for all planning decisions, implementing Cal Newport's values-based multi-scale planning approach.

## Command Usage
```
/define-values
```

## Process

### Step 1: Values Discovery
Guide the user through values identification:
1. Present a comprehensive list of potential values (see Values Reference below)
2. Ask user to select their top 10-15 values that resonate most strongly
3. Help narrow down to 5-7 core values through prioritization exercises
4. For each core value, ask for a personal definition/interpretation

### Step 2: Values Definition
For each selected core value, capture:
- **Value Name**: The core value (e.g., "Growth", "Authenticity", "Impact")
- **Personal Definition**: How the user interprets this value in their life
- **Life Examples**: 2-3 specific ways this value shows up in their decisions/actions
- **Career Application**: How this value applies to their AI engineering journey
- **Daily Manifestation**: How this value could influence daily choices

### Step 3: Values Validation
1. Read back all values and definitions
2. Check for conflicts or overlaps between values
3. Ensure values align with user's stated goals (AI engineering by 2026)
4. Verify values feel authentic and motivating

### Step 4: Values Hierarchy
1. Rank the 5-7 core values in order of importance
2. Identify the top 3 "non-negotiable" values
3. Note any situational priorities (work vs personal contexts)

## Output Files

### Primary Output: `planning/foundation/values.json`
```json
{
  "core_values": [
    {
      "name": "Growth",
      "rank": 1,
      "definition": "Continuously expanding my capabilities and understanding",
      "life_examples": [
        "Transitioning from support to AI engineering",
        "Daily coding practice despite challenges"
      ],
      "career_application": "Embracing the steep learning curve of AI/ML",
      "daily_manifestation": "Choosing learning opportunities over comfort",
      "non_negotiable": true
    }
  ],
  "values_hierarchy": ["Growth", "Authenticity", "Impact", "Balance", "Excellence"],
  "created_date": "YYYY-MM-DD",
  "last_reviewed": "YYYY-MM-DD",
  "review_frequency_days": 90
}
```

### Documentation: `planning/foundation/values-definition.md`
```markdown
# My Core Values

*Established: YYYY-MM-DD*
*Last Review: YYYY-MM-DD*

## Values Hierarchy

### 1. [Value Name] (Non-negotiable)
**Definition**: [Personal interpretation]

**Why This Matters**: [Deep reasoning behind this value]

**Life Applications**:
- [Example 1]
- [Example 2]

**Career Connection**: [How this drives AI engineering goals]

**Daily Decisions**: [How this shows up in day-to-day choices]

---
*[Repeat for all core values]*

## Values Integration
- **Planning**: How these values inform quarterly/monthly planning
- **Decision Making**: Framework for using values in tough choices
- **Conflict Resolution**: How to prioritize when values conflict
```

## Integration Points

### With Fractal Planning
- Reference values in all quarterly planning sessions
- Add "values alignment score" to quarterly objectives
- Include values check in monthly/weekly reviews

### With Daily Planning
- Start daily planning by reviewing top 3 values
- Evaluate daily time blocks for values alignment
- Track "values-aligned time" as a metric

### With Career Development
- Filter opportunities through values lens
- Ensure skill development aligns with core values
- Use values to guide networking and job decisions

## Values Reference List

**Achievement & Excellence**
- Achievement, Ambition, Excellence, Mastery, Success, Accomplishment

**Growth & Learning**  
- Growth, Learning, Curiosity, Innovation, Creativity, Discovery

**Relationships & Connection**
- Family, Friendship, Love, Community, Collaboration, Service

**Integrity & Authenticity**
- Authenticity, Integrity, Honesty, Transparency, Trust, Loyalty

**Balance & Wellbeing**
- Balance, Health, Peace, Mindfulness, Simplicity, Freedom

**Impact & Contribution**
- Impact, Purpose, Contribution, Leadership, Justice, Legacy

**Security & Stability**
- Security, Stability, Reliability, Consistency, Order, Tradition

**Adventure & Experience**
- Adventure, Experience, Variety, Spontaneity, Fun, Play

## Review Schedule
- **Quarterly**: Review values during Personal Retreat
- **Annual**: Deep values assessment and potential updates
- **Life Transitions**: Re-evaluate when major life changes occur

## Usage Notes
- Values should feel energizing, not constraining
- It's normal for values to evolve over time
- Values conflicts often reveal growth opportunities
- Use values to say "no" to good opportunities that aren't great