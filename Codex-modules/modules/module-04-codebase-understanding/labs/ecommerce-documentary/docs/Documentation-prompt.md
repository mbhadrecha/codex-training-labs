Analyze this repository like a senior engineer onboarding a new teammate.

Goal: produce a concrete, evidence-based guide to how this codebase works across backend and frontend.

Process requirements:
1. Inspect the repository structure first.
2. Identify backend and frontend boundaries.
3. Find actual entry points for each.
4. Trace backend runtime flow separately.
5. Trace frontend runtime and data flow separately.
6. Trace end-to-end flows between frontend and backend.
7. Separate facts from inferences.

Important constraints:
- Do not give a generic summary without inspecting code.
- Reference actual file paths, functions, classes, routes, hooks, components, services, schemas, and utilities.
- Prefer code-backed observations over assumptions.
- If something is missing or unclear, explicitly label it as Inference.
- If multiple entry points or patterns exist, explain the likely primary one and mention alternatives.
- Focus on helping a new engineer become productive quickly.

Required output structure:
1. High-level project overview
2. Backend explanation
   - folder-by-folder
   - startup flow
   - middleware
   - routes/controllers/services/models
   - request lifecycle
   - dependency flow
   - files to read first
   - risks
3. Frontend explanation
   - folder-by-folder
   - bootstrap flow
   - routing
   - pages/components/hooks/state/API layer
   - render/data flow
   - component hierarchy
   - files to read first
   - risks
4. Frontend-backend flow
   - API definitions
   - backend route mapping
   - response handling
   - at least 3 concrete end-to-end journeys
5. Execution flow
6. Architecture summary
7. Onboarding guide
8. Text diagrams
9. Codebase risks and improvements

Output style:
- Use headings
- Use bullets where useful
- Reference file paths throughout
- Be specific and evidence-based
- Separate Fact vs Inference
- Avoid generic textbook explanations


Before writing the final explanation, create a short internal inventory of:
- backend entry points
- frontend entry points
- route definitions
- API client definitions
- main state management files
- main config/env files

Use that inventory to drive the explanation.