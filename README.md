# CodeSidekick

> A Chrome Side Panel companion for coding, aptitude, reasoning, verbal, MCQs, and interview practice.

CodeSidekick is designed around a simple idea: **help the learner think before showing the answer**.

## Current features

- Chrome Manifest V3 Side Panel
- Universal question + answer/working input
- AI hints, explanations, answer checking, step-by-step solving, debugging, and complexity analysis
- Draft persistence with `chrome.storage.local`
- Optional FastAPI-compatible backend
- Built-in demo mode when no backend is configured
- Multi-domain local MCQ lab: Maths, Reasoning, English, DSA, DBMS, OS, CN, OOP, Python
- Human, lightweight UI with no page injection or DOM manipulation

## Install locally

1. Clone the repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository folder.
6. Click the CodeSidekick extension icon to open the side panel.

## Backend contract

The extension sends:

```json
POST /coach
{
  "mode": "hint | approach | debug | complexity | solve | explain | check",
  "problem": "...",
  "code": "...",
  "language": "Python"
}
```

Expected response:

```json
{ "answer": "..." }
```

Keep provider API keys on the backend. Do not put secrets in the Chrome extension.

## Product direction

Next additions should be:

- Hint ladder: nudge → stronger hint → pseudocode → solution
- More aptitude/reasoning/verbal question packs
- Practice history
- Mock interview timer
- Saved problem sets
- Test-case generation
- Code explanation by function
- Structured AI response cards
- Optional local-model support
- Automated extension tests

## Scope

CodeSidekick is intended for practice, learning, mock interviews, aptitude preparation, and general study. It is designed as a learning companion and does not attempt to bypass assessment proctoring, focus detection, or platform monitoring. It does not attempt to bypass assessment proctoring, focus detection, or platform monitoring.
