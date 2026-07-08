# Relationship Portrait Chat Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve relationship portrait generation by combining profiles, questionnaires, and the latest saved chat context.

**Architecture:** Reuse the existing `/api/portrait` contract because it already accepts `chatHistory`. The frontend hook gathers the latest chat session from IndexedDB, sends a bounded message list, and the backend prompt treats chat context as recent-state evidence while questionnaires remain long-term signals.

**Tech Stack:** React 18, TypeScript, Dexie repositories, Express, Zod, DeepSeek-compatible LLM client.

## Global Constraints

- Keep the MVP local-first and account-free.
- Do not add new database tables for this step.
- Do not print chat message content, nicknames, or full request bodies in logs.
- Keep the current AI response schema unchanged.
- Preserve the existing relationship portrait page layout and only add focused UX copy.

---

### Task 1: Add Latest Chat Context To Portrait Generation

**Files:**
- Modify: `frontend/src/hooks/useGeneratePortrait.ts`

**Interfaces:**
- Consumes: `chatRepository.getLatestSession(userId: string, girlId: string)` and `chatRepository.getMessages(sessionId: string)`.
- Produces: `chatHistory?: Array<{ role: string; content: string; timestamp?: string }>` on `PortraitRequest`.

- [ ] Import `chatRepository`.
- [ ] Read the latest session after loading user, girl, and questionnaires.
- [ ] Convert the latest 40 messages to `{ role, content, timestamp }`.
- [ ] Send `chatHistory` to `aiClient.generatePortrait`.
- [ ] Replace raw debug logs with dev-only summary logs.

### Task 2: Strengthen Backend Portrait Prompt

**Files:**
- Modify: `backend/src/prompts/portrait.ts`
- Modify: `backend/src/routes/portrait.ts`

**Interfaces:**
- Consumes: the existing `PortraitInput.chatHistory`.
- Produces: unchanged `PortraitResponseSchema`.

- [ ] Update the system prompt to explain that chat records are recent-state evidence.
- [ ] Increase the prompt chat slice from 20 to 40 messages.
- [ ] Keep the JSON schema unchanged.
- [ ] Add route-level summary logging without raw content.

### Task 3: Add User-Facing Source Hint

**Files:**
- Modify: `frontend/src/app/components/RelationshipPortraitPage.tsx`

**Interfaces:**
- Consumes: existing `data`, `loading`, `error`, `generate`, `loadCached`.
- Produces: a small hint explaining whether portraits can use recent chats.

- [ ] Update page copy to say the portrait uses profiles, questionnaires, and recent chats when available.
- [ ] Keep the existing stage, heat, signal, and suggestion cards.

### Task 4: Verification

**Commands:**
- `cd backend && npm run build`
- `cd frontend && npm run type-check`
- `cd frontend && npm run test`
- `cd frontend && npm run build`

**Expected:** all commands pass.
