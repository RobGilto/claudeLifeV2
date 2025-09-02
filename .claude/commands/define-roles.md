# Define Roles Command

## Purpose
Define the key life roles that shape identity and responsibilities, complementing the values framework in Cal Newport's multi-scale planning approach.

## Command Usage
```
/define-roles
```

## Process

### Step 1: Role Identification
Help user identify their key life roles across all domains:

**Professional Roles**:
- Current: Technical Support Specialist
- Transitioning: AI Engineer (in training)
- Future: Senior AI Engineer, Team Lead, etc.

**Personal Roles**:
- Family roles (husband, father, son, etc.)
- Community roles (neighbor, citizen, volunteer, etc.)
- Personal development roles (learner, creator, mentor, etc.)

### Step 2: Role Definition
For each identified role, capture:
- **Role Name**: Clear, specific title
- **Core Responsibilities**: 3-5 key responsibilities for this role
- **Time Investment**: Approximate % of time or hours per week
- **Success Metrics**: How you measure success in this role
- **Values Connection**: Which core values this role serves
- **Growth Areas**: How you want to develop in this role

### Step 3: Role Prioritization
1. Identify which roles are most important during this life phase
2. Recognize role conflicts and how to manage them
3. Determine which roles align with AI engineering transition
4. Note seasonal variations in role priorities

### Step 4: Role Integration
1. Map how roles support each other vs. compete
2. Identify synergies between roles
3. Plan for role evolution (e.g., support → AI engineer)
4. Create boundaries to prevent role overload

## Output Files

### Primary Output: `planning/foundation/roles.json`
```json
{
  "life_roles": [
    {
      "name": "AI Engineer (In Training)",
      "category": "professional",
      "priority": "high",
      "time_investment_percent": 40,
      "core_responsibilities": [
        "Daily coding practice and skill development",
        "Building portfolio projects",
        "Networking and industry engagement",
        "Technical learning and certification pursuit"
      ],
      "success_metrics": [
        "Hours of coding practice per week",
        "Portfolio projects completed",
        "Technical skills acquired",
        "Industry connections made"
      ],
      "values_alignment": ["Growth", "Excellence", "Innovation"],
      "growth_areas": [
        "Machine learning fundamentals",
        "Python proficiency",
        "Software architecture understanding"
      ],
      "phase": "transition",
      "target_completion": "2026-06"
    },
    {
      "name": "Technical Support Specialist",
      "category": "professional",
      "priority": "medium",
      "time_investment_percent": 35,
      "core_responsibilities": [
        "Resolve customer technical issues",
        "Maintain product knowledge",
        "Collaborate with development teams",
        "Document solutions and processes"
      ],
      "success_metrics": [
        "Customer satisfaction scores",
        "Issue resolution time",
        "Knowledge base contributions",
        "Team collaboration effectiveness"
      ],
      "values_alignment": ["Service", "Excellence", "Growth"],
      "growth_areas": [
        "Technical troubleshooting efficiency",
        "Customer communication skills"
      ],
      "phase": "current",
      "transition_plan": "Maintain excellence while transitioning out"
    }
  ],
  "role_priorities_current": [
    "AI Engineer (In Training)",
    "Technical Support Specialist", 
    "Learner",
    "Financial Planner",
    "Family Member"
  ],
  "created_date": "YYYY-MM-DD",
  "last_reviewed": "YYYY-MM-DD",
  "review_frequency_days": 90
}
```

### Documentation: `planning/foundation/roles-definition.md`
```markdown
# My Life Roles

*Established: YYYY-MM-DD*
*Last Review: YYYY-MM-DD*

## Role Hierarchy (Current Phase)

### 1. AI Engineer (In Training) - HIGH PRIORITY
**Phase**: Transition (Current → Target by 2026)

**Core Responsibilities**:
- Daily coding practice and skill development
- Building portfolio projects that demonstrate AI/ML capabilities  
- Engaging with the AI/ML community and building professional network
- Pursuing relevant certifications and technical learning

**Time Investment**: ~40% of focused time (~30-35 hours/week)

**Success Metrics**:
- Consistent daily coding practice (streak tracking)
- Portfolio projects completed and deployed
- Technical skills acquired and demonstrated
- Professional network growth in AI/ML space
- Progress toward 2026 career transition goal

**Values Alignment**: Growth, Excellence, Innovation, Impact

**Current Growth Areas**:
- Python proficiency and best practices
- Machine learning fundamentals and practical application
- Software architecture and system design
- AI implementation in business contexts

---

### 2. Technical Support Specialist - MEDIUM PRIORITY
**Phase**: Current (Transitioning out by 2026)

**Core Responsibilities**:
- Resolve customer technical issues efficiently and effectively
- Maintain deep product knowledge and troubleshooting skills
- Collaborate with development and product teams
- Document solutions and contribute to knowledge base

**Time Investment**: ~35% of focused time (standard work hours)

**Success Metrics**:
- Customer satisfaction and issue resolution metrics
- Contribution to team knowledge and processes
- Professional reputation and skill demonstration
- Financial stability maintenance during transition

**Values Alignment**: Service, Excellence, Growth

**Transition Strategy**: 
- Maintain high performance standards while preparing for career change
- Leverage technical troubleshooting skills for AI/ML debugging
- Use customer interaction experience for understanding user needs
- Build bridges between support insights and AI solution development

---

*[Continue for additional roles like Learner, Financial Planner, Family Member, etc.]*

## Role Integration Strategy

### Synergies
- **Support + AI Training**: Technical troubleshooting skills translate to debugging ML systems
- **Learner + Professional**: Continuous learning culture supports both current role excellence and AI transition
- **Financial Planner + Career Transition**: Strategic financial management enables sustainable career change

### Potential Conflicts
- **Time Competition**: Support job demands vs. AI learning time - managed through disciplined scheduling
- **Energy Management**: Avoiding burnout by balancing challenging learning with stable work performance
- **Identity Transition**: Moving from "support person" to "AI engineer" mindset

### Role Evolution Timeline
- **2024-2025**: Maintain support excellence while intensifying AI learning
- **2025-2026**: Transition from learning to demonstrating AI capabilities
- **2026+**: Full transition to AI engineering role with continued growth focus

## Seasonal Role Adjustments
- **Q1**: Heavy focus on learning and skill building
- **Q2**: Project development and portfolio building
- **Q3**: Networking and professional development
- **Q4**: Review, planning, and strategic positioning

## Role Boundaries
- **Work-Learning Balance**: Dedicated time blocks for each without blending
- **Family Time Protection**: Clear boundaries around family roles during transition
- **Energy Management**: Sustainable pace that supports all role requirements
- **Financial Responsibility**: Maintaining income stability during career transition
```

## Integration with Values System

### Role-Values Mapping
Each role should clearly connect to core values:
- Show which values each role serves
- Identify roles that serve multiple values
- Spot gaps where values aren't represented in roles

### Decision Framework
Use roles to make decisions:
- Which opportunities align with priority roles?
- How do role conflicts get resolved?
- What role development investments make sense?

## Integration with Planning System

### Quarterly Planning
- Set objectives for each high-priority role
- Ensure role development is represented in quarterly goals
- Track role transition progress (support → AI engineer)

### Weekly Planning
- Allocate time blocks by role requirements
- Balance role needs across the week
- Protect high-priority role development time

### Daily Planning
- Begin each day by reviewing role priorities for that day
- Ensure daily actions serve role development
- Track time investment by role for analysis

## Review Process

### Monthly Role Review
- Assess time allocation vs. planned investment
- Evaluate role performance and satisfaction
- Adjust role priorities based on progress

### Quarterly Role Evolution
- Update role definitions based on progress
- Adjust role priorities for next quarter
- Plan role transition milestones

### Annual Role Assessment
- Major role evaluation and potential restructuring
- Life phase assessment and role adaptation
- Long-term role vision development

## Usage Notes
- Roles should reflect reality, not just aspirations
- Role conflicts are normal and need active management
- Role evolution is expected and should be planned
- Some roles are temporary (transition phases)
- Role clarity improves decision-making and reduces internal conflict