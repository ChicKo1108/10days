# Plan: Refactor AI JSON Structure and Frontend Integration

## Goal
Update the AI service to generate multi-stage study plans (multiple 10-day cycles) based on the new prompt, refactor the backend to handle this multi-stage structure, and update the frontend to display and confirm these plans.

## Steps

### 1. Backend: Update AI Service (`server/src/services/aiService.js`)
- [ ] Update `generatePlan` with the new system prompt provided by the user.
- [ ] Update the JSON parsing logic to handle the new structure:
    ```json
    {
      "stages": {
          "baseTask": "...",
          "stage1": [ ... ],
          "stage2": [ ... ]
      }
    }
    ```
- [ ] Update the mock fallback data to match this new structure (including `stage1`, `stage2` examples).

### 2. Backend: Update Plan Controller (`server/src/controllers/planController.js`)
- [ ] Refactor `createPlan`:
    - [ ] When `type === 'plan'`, parse the AI response.
    - [ ] Create a parent `Plan` record.
    - [ ] Iterate through the `stages` object (e.g., `stage1`, `stage2`...).
    - [ ] For each stage, create a `Quest` record linked to the `Plan`.
        - Set `status` to `'locked'` initially.
        - Store the stage-specific tasks in `stageTasks`.
        - Store the global (or stage-specific) `baseTask`.
    - [ ] Return the `Plan` ID and the full preview structure.
- [ ] Refactor `confirmPlan`:
    - [ ] Add logic to check if the provided `id` is a `Plan` or `Quest`.
    - [ ] If `Plan`:
        - Receive updated tasks for all stages from frontend.
        - Update all associated `Quest` records.
        - Set the first `Quest` (Order 1) to `'ongoing'` and set its `startDate`.
        - Update `Plan` status to `'ongoing'`.
    - [ ] If `Quest` (existing logic):
        - Update the single quest and set to `'ongoing'`.

### 3. Frontend: Update Quest Creation Page (`miniprogram/pages/quest-create/index`)
- [ ] Update `onLoad` to handle the new preview structure (which might contain multiple stages).
- [ ] Refactor the UI (`index.wxml`) to support a list of stages:
    - [ ] Use a loop to render each stage (Stage 1, Stage 2...).
    - [ ] Within each stage, render the 3 phases (Intro, Advanced, Sprint).
    - [ ] Allow editing tasks for all stages.
- [ ] Update `confirmPlan` in `index.js`:
    - [ ] Collect data from all stages.
    - [ ] Send the bulk data to the backend `confirmPlan` endpoint.
- [ ] Handle the success navigation (redirect to the Plan detail or the first Quest detail).

### 4. Frontend: Update API (`miniprogram/api/plan.js`)
- [ ] Ensure `confirmPlan` supports the new payload structure.

### 5. Verification
- [ ] Start the server.
- [ ] Test generating a 30-day plan (should generate ~3 stages).
- [ ] Verify database records (`Plan` and 3 `Quests`).
- [ ] Verify frontend display and confirmation flow.
