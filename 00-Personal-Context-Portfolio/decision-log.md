# Decision Log

## D-001: Keep Benton Automotive on Legacy ProofPoint

- **Date:** 2026-06 (approx.)
- **Area:** Customer / Product / Risk Management
- **Decision:** Leave Benton Automotive on a legacy ProofPoint product rather than forcing a migration.
- **Context:** Benton Automotive is a meaningful account with a relationship that could be damaged by a disruptive or poorly timed product change. The technical benefits of moving off the legacy product were outweighed by relationship risk.
- **Alternatives considered:**
  - Force a migration to the new standard product stack on a fixed timeline.
  - Incentivize a migration with discounts or other benefits.
  - Maintain the legacy product for this customer while continuing migrations elsewhere.
- **Rationale:** Relationship risk and potential churn were judged to be higher-cost than the technical debt of keeping this one customer on a legacy product. The safest path was to preserve trust and stability for this account.
- **Implications for future work:**
  - This is an intentional exception, not a model for all customers.
  - Any future proposals involving Benton Automotive and email/security products should assume they remain on legacy ProofPoint unless a clearly better, low-risk migration path is defined.

---

## D-002: Separate Work AI from Personal AI

- **Date:** 2026-06 (approx.)
- **Area:** Tools / Governance / Side Projects
- **Decision:** Use separate AI environments for work and personal/adjacent projects.
- **Context:** There is ongoing experimentation with AI for both work and personal/indie business ideas. Using the same environment for both could blur boundaries around data, cost, and governance.
- **Alternatives considered:**
  - Use the same AI tools and accounts for both work and personal projects.
  - Strictly limit AI use to work only and keep personal experimentation separate from AI entirely.
  - Use structurally similar but separate tools for work vs. personal.
- **Rationale:** Chose to keep work and personal AI use separate to avoid using work resources for side projects that may become adjacent businesses, while still benefiting from similar capabilities. For example, using Hatz for work tasks and Perplexity for non-work, recognizing they both aggregate models and use credit-based cost normalization.
- **Implications for future work:**
  - Work-related automations, agents, and prompts should live in the work stack (e.g., Hatz and company-approved tools).
  - Personal or speculative business ideas should not be implemented in work environments.
  - Recommendations should respect this separation rather than suggesting centralization in one AI tool.

---

## D-003: Reorganized Integration Timeline with Will, Todd, and Jake

- **Date:** 2026-06 (approx.)
- **Area:** Integrations / Roadmap / Executive Alignment
- **Decision:** Rearranged the integration timeline in collaboration with Will, Todd, and Jake to reflect updated organizational needs and priorities.
- **Context:** The original integration sequence did not fully reflect current operational and strategic realities. The timeline was adjusted to better match what the organization needed most at that time.
- **Alternatives considered:**
  - Stick with the original integration timeline despite misalignment with new priorities.
  - Make incremental tweaks instead of a broader reordering.
  - Fully re-baseline the timeline with stakeholder involvement.
- **Rationale:** A more accurate, priority-aligned timeline was necessary, even if it meant some items that otherwise might have taken priority were moved. Alignment on the new sequence was more valuable than preserving a theoretically ideal order that no longer matched organizational needs.
- **Implications for future work:**
  - The current integration sequence is the working baseline.
  - Recommendations should start from the current approved timeline and propose changes only with clear justification.

---

## D-004: Implement Daily WIN as a Personal Operating Cadence

- **Date:** 2026-06 (approx.)
- **Area:** Personal Workflow / Team Communication
- **Decision:** Implemented Daily WIN ("What's Important Now") as a recurring daily focus ritual.
- **Context:** There was a need for clearer daily focus and a simple way to anchor execution around the most important work. Existing systems tracked tasks, but they did not create enough clarity around what mattered most each day.
- **Alternatives considered:**
  - Rely solely on existing task systems without a daily focus ritual.
  - Use an internal chat post or meeting cadence instead.
  - Keep the concept informal rather than turning it into a repeatable practice.
- **Rationale:** Daily WIN creates a lightweight but reliable way to define the most important work for the day. It helps connect planning to execution without introducing a heavy process.
- **Implications for future work:**
  - Daily WIN should be treated as part of the operating rhythm.
  - Suggestions for planning, prioritization, or daily execution should fit into this cadence rather than bypass it.
