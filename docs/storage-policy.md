# Storage Policy

Lumi is local-first. User-owned relationship data should be stored in IndexedDB through Dexie repositories.

## IndexedDB

Use IndexedDB for durable business data:

- User profile and girl profile
- Questionnaires
- Chat sessions and messages
- AI analysis reports
- Reply history
- Simulation history
- Relationship portraits
- Important dates

## localStorage

Use localStorage only for lightweight app state that is safe to recreate:

- Onboarding completion flag
- UI preferences
- Non-critical reading progress

Do not store API keys, AI tokens, raw chat exports, or long-term business records in localStorage.

## Export And Clear

The settings export should include IndexedDB business records and clearly document any localStorage-only UI state that is not included. Clearing user data should clear both IndexedDB business records and localStorage onboarding/reading flags when the user chooses a full reset.
