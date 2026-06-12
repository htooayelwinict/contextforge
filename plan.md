
` The app never needs repo access. It only watches the **draft text** the user is currently writing and gives contextual suggestions. `

` The source alignment is still strong, but now the patterns are used inside the editor experience, not as an autonomous execution engine. Prompt chaining fits because the app can break the writing-assistance process into small checks: classify draft → extract intent → detect gaps → suggest completion → critique final prompt. The uploaded guide says chaining improves reliability by decomposing complex tasks into focused sequential steps and reducing ambiguity between steps.  Routing fits because the app must dynamically decide what kind of suggestion to show: autocomplete, missing context, design-pattern suggestion, risk warning, or formatting improvement.  The agentic-reasoning paper also contrasts static prompting with dynamic context and feedback-based interaction, which matches your “detect every move while writing” concept without requiring actual autonomous action. `

## The product shape should be:

```text
PromptPad / SkillPad

A smart notepad for writing AI instructions.

User types:
- implementation plan
- coding-agent prompt
- skill file
- system prompt
- architecture instruction
- debugging instruction
- test plan

App reacts:
- autocomplete next sentence
- diagnose missing requirement
- suggest structure
- suggest SE pattern
- warn about ambiguity
- offer 1-click rewrite
- offer alternate phrasing
```

The key principle:

```text
The user remains the author.
The LLM is only a writing co-pilot.
```

That is important. Your app should not “take over.” It should behave like an inline editor assistant.

A good UI model:

```text
┌──────────────────────────────────────────────┐
│ Main Notepad                                  │
│                                              │
│ "I want the AI coder to refactor the auth..." │
│                                              │
│ Inline ghost suggestion:                     │
│ "...without changing public API behavior."   │
└──────────────────────────────────────────────┘

Right sidebar:
- Detected task: Refactor
- Missing: constraints, test command, acceptance criteria
- Suggested pattern: Strategy / Adapter / Facade
- Risk: "too broad, may cause unwanted edits"
- Quick actions:
  [Tighten scope]
  [Add acceptance criteria]
  [Convert to Codex prompt]
  [Convert to skill format]
```

This is not a chat-first app. It is an **editor-first app**.

The internal pipeline should look like this:

```text
User keystrokes
   ↓
Debounced draft analyzer
   ↓
Draft state extraction
   ↓
Suggestion router
   ↓
Suggestion cards / inline completions
   ↓
User accepts, rejects, edits, ignores
```

No codebase. No tools. No file access. Just text.

You can define suggestion types like this:

```text
1. Inline Completion
Suggest the next phrase or sentence.

2. Gap Detection
“You mentioned implementation but not acceptance criteria.”

3. Ambiguity Warning
“‘Fix it properly’ is vague. Specify expected behavior.”

4. SE Pattern Suggestion
“This sounds like Strategy Pattern because behavior varies by type.”

5. Prompt Structure Suggestion
“Convert this into Role / Context / Task / Constraints / Output.”

6. Risk Warning
“This prompt allows broad changes. Add denied-scope wording.”

7. Alternative Intent Choices
“Are you asking for refactor, rewrite, or bug fix?”

8. Style Conversion
“Make this suitable for Codex / Claude Code / Cursor / system prompt / skill file.”
```

This is the feature that makes it special:

```text
Live SE-aware prompt diagnostics.
```

Example while typing:

```text
User draft:
"Refactor payment service and make it clean."

App sidebar:
Detected intent: Refactor
Detected architecture smell: conditional provider logic?
Missing:
- current pain point
- target design
- behavior preservation rule
- test expectation

Suggestions:
1. Add “preserve existing public API”
2. Add “do not change database schema”
3. Consider Adapter Pattern if providers differ
4. Consider Strategy Pattern if payment methods vary by behavior
```

Better than a prompt generator because it improves the user’s own thinking while they write.

I would split the app into **three engines**:

```text
1. Draft Analyzer
Reads current text and extracts:
- task type
- target output
- known constraints
- missing constraints
- ambiguity
- tone/style
- likely SE pattern

2. Suggestion Router
Decides what kind of help is useful now:
- autocomplete
- question
- warning
- pattern recommendation
- rewrite
- format conversion

3. Patch Composer
Creates small text edits:
- insert sentence
- rewrite paragraph
- convert section
- add checklist
- add prompt block
```

Important: suggestions should be **small and optional**.

Bad behavior:

```text
The app rewrites the whole prompt every 5 seconds.
```

Good behavior:

```text
The app shows:
“Add acceptance criteria?”
[Insert]
```

This means your product should use **text patches**, not only generated full prompts.

Example patch object:

```json
{
  "type": "insert_after_cursor",
  "label": "Add behavior preservation constraint",
  "preview": "Preserve existing API behavior unless explicitly required.",
  "confidence": 0.86,
  "reason": "The draft asks for refactor but does not constrain behavior changes."
}
```

This makes the UI feel like Copilot/Grammarly instead of ChatGPT.

Architecture:

```text
Frontend:
- Monaco Editor or TipTap/ProseMirror
- inline ghost text
- right-side suggestion panel
- diagnostics underline
- command palette

Backend:
- LLM wrapper endpoint
- template/pattern registry
- suggestion scoring
- user session state

Storage:
- local-first drafts
- optional account sync
- accepted/rejected suggestion history
- custom templates
```

Core LLM endpoints:

```text
POST /analyze-draft
Input: current draft, cursor position, selected mode
Output: extracted facts, diagnostics, detected pattern

POST /suggest-inline
Input: local text around cursor
Output: ghost completion candidates

POST /suggest-cards
Input: full draft analysis
Output: sidebar suggestions

POST /apply-transform
Input: selected text + transform type
Output: replacement text

POST /compile
Input: final draft + target format
Output: polished prompt / skill / instruction
```

The modes can be:

```text
Prompt Mode
For one-time AI coding/chat prompts.

Skill Mode
For reusable skill/system instructions.

Implementation Plan Mode
For turning rough plan into structured engineering instruction.

Architecture Mode
For design-pattern and architecture-aware suggestions.

Review Mode
For diagnosing weak prompts.
```

Your pattern registry becomes the brain.

Example:

```json
{
  "pattern": "Strategy Pattern",
  "signals": [
    "different behavior by type",
    "many if/else branches",
    "switch by provider",
    "algorithm varies"
  ],
  "suggestions": [
    "Clarify the interchangeable behaviors.",
    "Ask the AI to preserve the existing interface.",
    "Request tests for each strategy implementation."
  ],
  "insertable_lines": [
    "Use Strategy Pattern only if behavior varies by type and each behavior can be isolated behind a common interface.",
    "Do not introduce Strategy Pattern if the current logic is simple enough to remain procedural."
  ]
}
```

This is where your SE design-pattern knowledge becomes a product feature.

The UX should not ask too many chat questions. Instead, it should show **choice chips**:

```text
Your draft says: "make architecture clean"

What do you mean?
[Reduce coupling]
[Split responsibilities]
[Introduce interface]
[Improve testability]
[Remove duplication]
[Not sure]
```

When user clicks one, it inserts better language into the draft.

This is the correct framing:

```text
It is not an agent.
It is not a code assistant.
It is not a generic prompt generator.

It is an intelligent drafting surface for AI instructions.
```

MVP should be very small:

```text
MVP v1:
- Web notepad
- User writes prompt
- Live diagnostics sidebar
- Inline autocomplete
- 5 templates:
  Bug fix
  Refactor
  Feature
  Architecture review
  Skill/system prompt
- 10 SE pattern hints:
  Strategy
  Adapter
  Factory
  Facade
  Observer
  Chain of Responsibility
  Repository
  Unit of Work
  Ports and Adapters
  Specification
- Export to Markdown
```

Build **diagnostics first**, not autocomplete. Autocomplete is cool, but diagnostics is the differentiator.

Your first valuable feature:

```text
Prompt Linter for AI coding instructions.
```

Example diagnostics:

```text
Weak prompt:
"Fix the login and make it better."

Diagnostics:
- No expected behavior
- No reproduction steps
- No allowed scope
- No test requirement
- “make it better” is ambiguous
- Missing stop condition
- Missing output format

Suggested inserts:
[Add expected behavior]
[Add test requirement]
[Add stop condition]
[Add output format]
```

That is a real product. It teaches the user while they write.

My opinion: **this version is much better** than the agent/tool idea. It is lighter, clearer, less risky, and more unique. You are basically designing a **Copilot for writing prompts/instructions**, not a prompt generator.

Name it something like:

```text
PromptPad
SkillPad
SpecPad
PromptLint
InstructionSmith
ContextPad
```

Best name for this exact idea: **SpecPad**.

Because the user is not merely writing prompts. They are writing specs for another AI to execute.
