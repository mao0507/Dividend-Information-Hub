## ADDED Requirements

### Requirement: Global resources are placed in designated top-level directories
Global code (used across multiple domains) SHALL reside in these `src/` subdirectories:
- `components/` — shared Vue components, organized by type (`chart/`, `icons/`, `layout/`)
- `composables/` — cross-domain composable functions
- `stores/` — Pinia stores
- `utils/` — generic utility functions
- `types/` — shared TypeScript types
- `services/` — HTTP client and API modules
- `plugins/` — third-party library initialization
- `router/` — route configuration
- `constants/` — application-wide constants
- `assets/` — static assets
- `styles/` — global CSS files

#### Scenario: Developer adds a component used in two or more page domains
- **WHEN** a Vue component is referenced from more than one domain folder under `views/`
- **THEN** it SHALL be placed in `src/components/<category>/` rather than inside any single domain

#### Scenario: Developer adds a third-party plugin configuration
- **WHEN** a new third-party library requires initialization (e.g., PrimeVue, GSAP)
- **THEN** the setup file SHALL be placed in `src/plugins/` and imported from `main.ts`

### Requirement: Page components are organized under views/ by business domain
All routable page components SHALL reside in `src/views/<domain>/` where `<domain>` is a kebab-case business function name. Page components SHALL NOT use a `Page` suffix.

#### Scenario: Developer creates a new page for a feature
- **WHEN** a new routable page is created
- **THEN** its `.vue` file SHALL be placed at `src/views/<domain>/<ComponentName>.vue` (no `Page` suffix)
- **THEN** the router SHALL reference the path as `@/views/<domain>/<ComponentName>.vue`

#### Scenario: Existing page components are accessed
- **WHEN** the router lazy-imports a view component
- **THEN** all imports SHALL resolve under `@/views/` (not `@/pages/`)

### Requirement: Domain-specific code lives inside the domain folder
Code that is only used within a single business domain SHALL be placed inside `src/views/<domain>/`:
- `views/<domain>/components/` — components exclusive to that domain
- `views/<domain>/utils/` — utility functions exclusive to that domain
- `views/<domain>/composables/` — composables exclusive to that domain

#### Scenario: A component is used only in the dashboard domain
- **WHEN** a Vue component is imported only by files inside `views/dashboard/`
- **THEN** it SHALL reside at `views/dashboard/components/<ComponentName>.vue`

#### Scenario: A utility function is specific to one domain
- **WHEN** a utility function is only called from within one domain folder
- **THEN** it SHALL reside at `views/<domain>/utils/<name>.ts`

### Requirement: API layer is organized under services/
All HTTP communication SHALL be organized under `src/services/`:
- `services/request.ts` — the Axios instance and interceptors
- `services/api/<module>.ts` — per-feature API call functions
- `services/api/index.ts` — barrel re-export of all API modules

#### Scenario: A page component calls a backend API
- **WHEN** a component or composable imports API functions
- **THEN** the import path SHALL start with `@/services/api`
- **THEN** it SHALL NOT import from `@/api/`

#### Scenario: Developer adds a new API module
- **WHEN** a new backend resource needs API functions
- **THEN** a new file `src/services/api/<resource>.ts` SHALL be created
- **THEN** it SHALL be re-exported from `src/services/api/index.ts`
