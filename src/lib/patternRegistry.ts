import type { PatternEntry } from "@/types";

/**
 * SE Pattern Registry
 *
 * Each entry defines:
 * - signals: keywords/phrases that indicate this pattern is relevant
 * - suggestions: diagnostic messages to show the user
 * - insertableLines: ready-to-insert prompt text
 */
export const patternRegistry: PatternEntry[] = [
  {
    pattern: "Strategy Pattern",
    signals: [
      "different behavior by type",
      "many if/else branches",
      "switch by provider",
      "algorithm varies",
      "interchangeable",
      "varying behavior",
      "multiple strategies",
      "behavior varies",
      "payment method",
      "notification type",
    ],
    suggestions: [
      "Clarify the interchangeable behaviors.",
      "Ask the AI to preserve the existing interface.",
      "Request tests for each strategy implementation.",
    ],
    insertableLines: [
      "Use Strategy Pattern only if behavior varies by type and each behavior can be isolated behind a common interface.",
      "Do not introduce Strategy Pattern if the current logic is simple enough to remain procedural.",
    ],
  },
  {
    pattern: "Adapter Pattern",
    signals: [
      "incompatible interface",
      "wrap existing",
      "third-party library",
      "legacy system",
      "different api",
      "convert interface",
      "bridge between",
      "integrate external",
      "mismatched interface",
      "adapt",
    ],
    suggestions: [
      "Specify which interfaces need adaptation.",
      "Clarify whether the adapter should be one-way or two-way.",
      "Request that the adapter does not leak the wrapped type.",
    ],
    insertableLines: [
      "Use Adapter Pattern to wrap the incompatible interface behind the expected contract.",
      "Ensure the adapter does not expose implementation details of the wrapped component.",
    ],
  },
  {
    pattern: "Factory Pattern",
    signals: [
      "create object",
      "object creation",
      "instantiate",
      "construct",
      "build instances",
      "factory method",
      "abstract factory",
      "creation logic",
      "complex construction",
      "multiple types of",
    ],
    suggestions: [
      "Clarify what varies across the created objects.",
      "Specify whether creation logic should be centralized or distributed.",
      "Request that the factory returns a common interface.",
    ],
    insertableLines: [
      "Use Factory Pattern to centralize object creation logic behind a single entry point.",
      "The factory should return a common interface so callers do not depend on concrete types.",
    ],
  },
  {
    pattern: "Facade Pattern",
    signals: [
      "simplify interface",
      "complex subsystem",
      "unified api",
      "hide complexity",
      "simplified access",
      "wrapper around",
      "single entry point",
      "reduce coupling",
      "high-level interface",
    ],
    suggestions: [
      "Define which subsystem operations the facade should expose.",
      "Clarify whether the facade should be the only public entry point.",
      "Request that the facade does not prevent direct subsystem access when needed.",
    ],
    insertableLines: [
      "Use Facade Pattern to provide a simplified interface over the complex subsystem.",
      "The facade should not prevent advanced users from accessing subsystem components directly.",
    ],
  },
  {
    pattern: "Observer Pattern",
    signals: [
      "event",
      "notify",
      "subscribe",
      "listener",
      "publish",
      "react to change",
      "state change",
      "broadcast",
      "callback",
      "emit",
      "watch for",
      "when something changes",
    ],
    suggestions: [
      "Clarify which state changes trigger notifications.",
      "Specify whether observers should be synchronous or asynchronous.",
      "Request handling for observer failures (one failing observer should not break others).",
    ],
    insertableLines: [
      "Use Observer Pattern so that state changes are broadcast to all registered listeners.",
      "Ensure that one failing observer does not prevent other observers from being notified.",
    ],
  },
  {
    pattern: "Chain of Responsibility",
    signals: [
      "pipeline",
      "chain",
      "middleware",
      "sequential processing",
      "pass along",
      "handler chain",
      "request processing",
      "multiple handlers",
      "next handler",
      "interceptor",
    ],
    suggestions: [
      "Define the order of handlers in the chain.",
      "Clarify what happens when no handler processes the request.",
      "Specify whether a handler can stop the chain or must always pass it forward.",
    ],
    insertableLines: [
      "Use Chain of Responsibility so each handler can process or pass the request.",
      "Define a clear fallback behavior when no handler in the chain matches.",
    ],
  },
  {
    pattern: "Repository Pattern",
    signals: [
      "data access",
      "database query",
      "crud",
      "persist",
      "store",
      "retrieve",
      "fetch from",
      "save to",
      "data layer",
      "query builder",
      "collection",
    ],
    suggestions: [
      "Clarify whether the repository should abstract the data source completely.",
      "Specify pagination, filtering, and sorting requirements.",
      "Request that the repository returns domain objects, not raw database rows.",
    ],
    insertableLines: [
      "Use Repository Pattern to abstract data access behind a collection-like interface.",
      "The repository should return domain objects and hide all database-specific details.",
    ],
  },
  {
    pattern: "Unit of Work",
    signals: [
      "transaction",
      "atomic",
      "commit",
      "rollback",
      "batch save",
      "consistency",
      "all or nothing",
      "multiple changes",
      "save together",
    ],
    suggestions: [
      "Clarify the transaction boundary — what operations belong in one unit.",
      "Specify rollback behavior on partial failure.",
      "Request that the unit of work tracks all changes and commits them atomically.",
    ],
    insertableLines: [
      "Use Unit of Work to track all changes in a single transaction and commit or rollback atomically.",
      "Ensure that partial failures trigger a complete rollback of all pending changes.",
    ],
  },
  {
    pattern: "Ports and Adapters",
    signals: [
      "hexagonal",
      "ports and adapters",
      "core logic",
      "infrastructure",
      "decouple",
      "independent of framework",
      "domain layer",
      "external dependency",
      "clean architecture",
      "boundary",
    ],
    suggestions: [
      "Define the ports (interfaces) the core domain expects.",
      "Clarify which external systems need adapters.",
      "Request that the core domain has zero dependencies on infrastructure.",
    ],
    insertableLines: [
      "Use Ports and Adapters to keep the core domain independent of infrastructure and frameworks.",
      "Define inbound and outbound ports as interfaces; implement adapters for each external system.",
    ],
  },
  {
    pattern: "Specification Pattern",
    signals: [
      "business rule",
      "validation rule",
      "filter criteria",
      "composable",
      "predicate",
      "query criteria",
      "eligibility",
      "rule engine",
      "combine conditions",
      "specification",
    ],
    suggestions: [
      "Clarify whether specifications should be composable (AND, OR, NOT).",
      "Specify where the specifications are evaluated (in-memory vs. database query).",
      "Request that each specification is a single, testable business rule.",
    ],
    insertableLines: [
      "Use Specification Pattern to encapsulate business rules as composable, reusable predicates.",
      "Each specification should represent a single business rule that can be combined with others using AND, OR, and NOT.",
    ],
  },
];
