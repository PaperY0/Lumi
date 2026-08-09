# Evidence-Informed Love Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic stage-guide copy with evidence-informed decision guidance, with article-level evidence boundaries and a unified Lumi methodology/source entry.

**Architecture:** Keep built-in article content local and preserve custom article compatibility. Extend built-in article metadata with an optional `evidence` card; render that card in article detail and expose the full methodology/source list in the Love Code page. Rework the 16 stage articles into an observation → decision → action model; do not present relationship advice as diagnosis or certainty.

**Tech Stack:** React, TypeScript, Vitest, existing Lumi Glass UI components.

## Global Constraints

- Do not copy source text; write original Chinese synthesis.
- Do not diagnose people or infer intent from one message.
- Treat MBTI as optional self-exploration, not a scientific prediction tool.
- Retain all existing IndexedDB custom articles and their free-form Markdown content.
- Keep the three selectable stages only; future dating remains unavailable.

---

### Task 1: Add evidence-card metadata and regression tests

**Files:**
- Modify: `frontend/src/types/loveGuide.ts`
- Modify: `frontend/src/lib/loveGuideStage.test.ts`
- Create: `frontend/src/data/loveGuideMethodology.ts`

- [ ] **Step 1: Write failing tests**

Assert that every built-in stage article has an evidence card containing `principle`, `evidenceBoundary`, and at least one source id, and that every article uses the expanded decision headings.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm run test -- --run src/lib/loveGuideStage.test.ts`

Expected: failure because the evidence metadata and expanded headings do not exist.

- [ ] **Step 3: Add the minimal content contracts**

Add:

```ts
export interface LoveGuideEvidence {
  principle: string;
  evidenceBoundary: string;
  sources: readonly LoveGuideSourceId[];
}
```

and a local `loveGuideMethodology` registry with source ids `healthy-relationship`, `personality-traits`, `warning-signs`, and `communication`.

- [ ] **Step 4: Re-run focused tests**

Expected: PASS.

### Task 2: Rewrite built-in stage content as decision guidance

**Files:**
- Modify: `frontend/src/data/loveGuideStageArticles.ts`
- Test: `frontend/src/lib/loveGuideStage.test.ts`

- [ ] **Step 1: Write failing content-contract tests**

For the 16 built-ins, require these headings: `适用范围`, `依据原则`, `可观察事实`, `不要擅自推断`, `风险分级`, `可执行步骤`, `话术示例`, `停止与求助`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm run test -- --run src/lib/loveGuideStage.test.ts`

Expected: failure because old generic seven-heading content is still present.

- [ ] **Step 3: Replace generated article prose**

Each new article must distinguish observable behaviour from intent inference; use green/yellow/red decision language; place safety escalation in `停止与求助`; include a concise evidence card. Keep article ids and stages unchanged to preserve read status.

- [ ] **Step 4: Re-run focused tests**

Expected: PASS.

### Task 3: Render evidence boundaries and methodology in Love Code

**Files:**
- Modify: `frontend/src/app/components/LoveCodePage.tsx`
- Test: `frontend/src/app/components/LoveCodePage.test.tsx` or focused utility test if component test harness is absent

- [ ] **Step 1: Write a failing test**

Verify that an evidence-backed article exposes its principle and boundary, and the methodology entry exposes all four sources.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm run test -- --run src/app/components/LoveCodePage.test.tsx`

Expected: failure because no evidence/methodology UI is rendered.

- [ ] **Step 3: Implement UI**

Render a compact `依据与边界` card after built-in article content. Add a `内容原则与来源` expandable panel on the Love Code list page. Do not render these cards for user-created articles unless metadata exists.

- [ ] **Step 4: Re-run focused tests**

Expected: PASS.

### Task 4: Verify the feature end-to-end

**Files:**
- Test: existing frontend suite

- [ ] **Step 1: Run all checks**

Run:

```powershell
cd frontend
npm run test -- --run
npm run type-check
npm run build
```

- [ ] **Step 2: Browser acceptance**

Open Love Code with a saved profile; verify the methodology panel, article `依据与边界` card, and a warning-signal article's pause/help guidance.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/types/loveGuide.ts frontend/src/data/loveGuideMethodology.ts frontend/src/data/loveGuideStageArticles.ts frontend/src/lib/loveGuideStage.test.ts frontend/src/app/components/LoveCodePage.tsx docs/superpowers/plans/2026-08-09-evidence-informed-love-code.md
git commit -m "feat: strengthen evidence-informed love guide content"
```
