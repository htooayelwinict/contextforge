import type { Template } from "@/types";

export const templates: Template[] = [
  {
    id: "bugfix",
    name: "Bug Fix",
    description: "Structured prompt for fixing a bug with reproduction steps and expected behavior.",
    category: "bugfix",
    content: `## Bug Fix Request

**Component/Module:** [name the affected component]

**Current Behavior:**
[Describe what is happening now — the bug]

**Expected Behavior:**
[Describe what should happen instead]

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Error Message / Stack Trace:**
\`\`\`
[paste error output here]
\`\`\`

**Constraints:**
- Do not change [specify what must remain unchanged]
- Preserve existing [API behavior / database schema / public interface]

**Test Requirement:**
- [ ] Add a regression test that reproduces this bug
- [ ] Verify the fix does not break existing tests

**Acceptance Criteria:**
- [ ] Bug is fixed as described in Expected Behavior
- [ ] All existing tests pass
- [ ] New regression test added and passing
`,
  },
  {
    id: "refactor",
    name: "Refactor",
    description: "Structured prompt for refactoring code while preserving behavior.",
    category: "refactor",
    content: `## Refactor Request

**Target:** [name the module, class, or function to refactor]

**Current Pain Point:**
[Describe what is wrong with the current code — complexity, duplication, coupling, etc.]

**Target Design:**
[Describe the desired structure after refactoring]

**Behavior Preservation Rule:**
- Preserve existing public API behavior unless explicitly required to change
- Do not change [database schema / external interfaces / test expectations]

**Scope:**
- Files to change: [list specific files]
- Files to NOT change: [list files that must remain untouched]

**Constraints:**
- [Constraint 1]
- [Constraint 2]

**Test Requirement:**
- [ ] All existing tests must pass without modification
- [ ] Add tests for any newly introduced abstractions

**Acceptance Criteria:**
- [ ] Code is simpler and more maintainable
- [ ] No behavior changes in public API
- [ ] All tests pass
`,
  },
  {
    id: "feature",
    name: "Feature",
    description: "Structured prompt for implementing a new feature with clear requirements.",
    category: "feature",
    content: `## Feature Implementation

**Feature Name:** [name]

**Description:**
[One-paragraph description of what this feature does and why it's needed]

**User Story:**
As a [user type], I want to [action] so that [benefit].

**Requirements:**
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

**Technical Approach:**
[Describe the high-level implementation approach]

**Constraints:**
- Do not break existing functionality
- Follow existing [naming conventions / architecture patterns / code style]
- [Additional constraint]

**Output Format:**
- [ ] Implementation code
- [ ] Unit tests
- [ ] Updated documentation

**Acceptance Criteria:**
- [ ] All requirements are implemented
- [ ] All tests pass
- [ ] Edge cases are handled
- [ ] Code follows project conventions
`,
  },
  {
    id: "architecture-review",
    name: "Architecture Review",
    description: "Structured prompt for reviewing or designing system architecture.",
    category: "architecture",
    content: `## Architecture Review / Design

**System/Component:** [name]

**Current Architecture:**
[Describe the current structure, or "greenfield" if new]

**Goals:**
- [Goal 1: e.g., reduce coupling between modules]
- [Goal 2: e.g., improve scalability]
- [Goal 3: e.g., simplify testing]

**Components:**
1. [Component A] — [responsibility]
2. [Component B] — [responsibility]
3. [Component C] — [responsibility]

**Interfaces:**
- [Component A] communicates with [Component B] via [mechanism]
- [Define key interfaces and contracts]

**Constraints:**
- Non-functional: [performance / security / availability requirements]
- Technology: [required frameworks / languages / platforms]
- Organizational: [team size / timeline / budget]

**Design Patterns to Consider:**
- [Pattern 1] — [why it fits]
- [Pattern 2] — [why it fits]

**Deliverables:**
- [ ] Architecture diagram
- [ ] Component interface definitions
- [ ] Key design decisions with rationale
- [ ] Risk assessment
`,
  },
  {
    id: "skill-system-prompt",
    name: "Skill / System Prompt",
    description: "Template for writing reusable AI skill files or system prompts.",
    category: "skill",
    content: `## Skill / System Prompt

**Role:**
You are a [specialist role] with expertise in [domains].

**Context:**
[Describe the situation, project, or domain this skill operates in]

**Primary Task:**
[What this skill should do when invoked]

**Instructions:**
1. [Step 1 of the workflow]
2. [Step 2 of the workflow]
3. [Step 3 of the workflow]

**Input:**
- [What the skill receives]
- [Format of the input]

**Output:**
- [What the skill produces]
- [Format of the output]
- [Structure/template of the output]

**Constraints:**
- [What the skill should NOT do]
- [Boundaries and limitations]
- [Quality requirements]

**Examples:**

Input: [example input]
Output: [example output]

**Error Handling:**
- If [condition], then [action]
- If [condition], then [action]
`,
  },
];
