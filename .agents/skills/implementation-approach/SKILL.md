---
name: implementation-approach
description: "Implementation strategy selection framework with meta-cognitive approach. Use when: planning implementation strategy, selecting between vertical/horizontal slicing, or defining verification criteria for tasks."
---

# Implementation Strategy Selection Framework (Meta-cognitive Approach)

## Meta-cognitive Strategy Selection Process [MANDATORY]

### Phase 1: Comprehensive Current State Analysis

**Core Question**: "What does the existing implementation look like?"

#### Analysis Framework
```yaml
Architecture Analysis: Responsibility separation, data flow, dependencies, technical debt
Implementation Quality Assessment: Code quality, test coverage, performance, security
Historical Context Understanding: Current form rationale, past decision validity, constraint changes, requirement evolution
```

#### Meta-cognitive Question List [MANDATORY CHECKPOINTS]
- What is the true responsibility of this implementation?
- Which parts are business essence and which derive from technical constraints?
- What dependencies or implicit preconditions are unclear from the code?
- What benefits and constraints does the current design bring?

**ENFORCEMENT**: CANNOT proceed to Phase 2 without answering all questions

### Phase 2: Strategy Exploration and Creation

**Core Question**: "When determining before to after, what implementation patterns or strategies should be referenced?"

#### Strategy Discovery Process
```yaml
Research and Exploration: Tech stack examples, similar projects, OSS references, literature/blogs
Creative Thinking: Strategy combinations, constraint-based design, phase division, extension point design
```

#### Reference Strategy Patterns (Creative Combinations Encouraged)

**Legacy Handling Strategies**:
- Strangler Pattern: Gradual migration through phased replacement
- Facade Pattern: Complexity hiding through unified interface
- Adapter Pattern: Bridge with existing systems

**New Development Strategies**:
- Feature-driven Development: Vertical implementation prioritizing user value
- Foundation-driven Development: Foundation-first construction prioritizing stability
- Risk-driven Development: Prioritize addressing maximum risk elements

**Integration/Migration Strategies**:
- Proxy Pattern: Transparent feature extension
- Decorator Pattern: Phased enhancement of existing features
- Bridge Pattern: Flexibility through abstraction

**IMPORTANT**: The optimal solution is discovered through creative thinking according to each project's context. EVALUATE multiple strategy combinations before selecting.

### Phase 3: Risk Assessment and Control [MANDATORY]

**Core Question**: "What risks arise when applying this to existing implementation, and what's the best way to control them?"

#### Risk Analysis Matrix
```yaml
Technical Risks: System impact, data consistency, performance degradation, integration complexity
Operational Risks: Service availability, deployment downtime, process changes, rollback procedures
Project Risks: Schedule delays, learning costs, quality achievement, team coordination
```

#### Risk Control Strategies
```yaml
Preventive Measures: Phased migration, parallel operation verification, integration/regression tests, monitoring setup
Incident Response: Rollback procedures, log/metrics preparation, communication system, service continuation procedures
```

### Phase 4: Constraint Compatibility Verification

**Core Question**: "What are this project's constraints?"

#### Constraint Checklist
```yaml
Technical Constraints: Library compatibility, resource capacity, mandatory requirements, numerical targets
Temporal Constraints: Deadlines/priorities, dependencies, milestones, learning periods
Resource Constraints: Team/skills, work hours/systems, budget, external contracts
Business Constraints: Market launch timing, customer impact, regulatory compliance
```

### Phase 5: Implementation Approach Decision

Select optimal solution from basic implementation approaches (creative combinations encouraged):

#### Vertical Slice (Feature-driven)
**Characteristics**: Vertical implementation across all layers by feature unit
**Application Conditions**: Low inter-feature dependencies, output in user-usable form, changes needed across all architecture layers
**Verification Method**: End-user value delivery at each feature completion

#### Horizontal Slice (Foundation-driven)
**Characteristics**: Phased construction by architecture layer
**Application Conditions**: Foundation system stability important, multiple features depend on common foundation, layer-by-layer verification effective
**Verification Method**: Integrated operation verification when all foundation layers complete

#### Hybrid (Creative Combination)
**Characteristics**: Flexible combination according to project characteristics
**Application Conditions**: Unclear requirements, need to change approach per phase, transition from prototyping to full implementation
**Verification Method**: Verify at appropriate L1/L2/L3 levels according to each phase's goals

### Phase 6: Decision Rationale Documentation

**Design Doc Documentation**: Clearly specify implementation strategy selection reasons and rationale.

## Verification Level Definitions

Priority for completion verification of each task:

- **L1: Functional Operation Verification** - Operates as end-user feature (e.g., search executable)
- **L2: Test Operation Verification** - New tests added and passing
- **L3: Build Success Verification** - Code builds/runs without errors

**Priority**: L1 > L2 > L3 in order of verifiability importance

## Integration Point Definitions

Define integration points according to selected strategy:
- **Strangler-based**: When switching between old and new systems for each feature
- **Feature-driven**: When users can actually use the feature
- **Foundation-driven**: When all architecture layers are ready and E2E tests pass
- **Hybrid**: When individual goals defined for each phase are achieved

## Anti-patterns [MANDATORY to detect]

- **Pattern Fixation**: EVALUATE unique combinations instead of selecting only listed strategies
- **Insufficient Analysis**: MUST complete Phase 1 analysis framework before strategy selection
- **Risk Neglect**: MUST complete Phase 3 risk analysis matrix before implementation
- **Constraint Ignorance**: MUST check Phase 4 constraint checklist before deciding strategy
- **Rationale Omission**: MUST use Phase 6 documentation template when selecting strategy

**ENFORCEMENT**: Detecting ANY anti-pattern requires IMMEDIATE correction before proceeding

## Guidelines for Meta-cognitive Execution

1. **Leverage Known Patterns**: Use as starting point, then EVALUATE creative combinations
2. **Active Research**: Research implementation examples from similar tech stacks
3. **Apply 5 Whys**: Pursue root causes to grasp essence
4. **Multi-perspective Evaluation**: EVALUATE comprehensively from each Phase 1-4 perspective
5. **Creative Thinking**: EVALUATE sequential application of multiple strategies and designs leveraging project-specific constraints
6. **Clarify Decision Rationale**: Strategy selection rationale MUST be explicit in design documents
