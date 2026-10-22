# Redux Store Configuration

<cite>
**Referenced Files in This Document**
- [store.js](file://Client/src/store/store.js)
- [authSlice.js](file://Client/src/store/auth/authSlice.js)
- [themeSlice.js](file://Client/src/store/theme/themeSlice.js)
- [adminSlice.js](file://Client/src/store/admin/adminSlice.js)
- [formSlice.js](file://Client/src/store/formSlice.js)
- [main.jsx](file://Client/src/main.jsx)
- [App.jsx](file://Client/src/App.jsx)
- [Admin.jsx](file://Client/src/pages/dashboard/Admin.jsx)
- [DataTable.jsx](file://Client/src/components/deshboard/DataTable.jsx)
- [Form.jsx](file://Client/src/components/deshboard/Form.jsx)
- [apiClient.js](file://Client/src/services/apiClient.js)
- [package.json](file://Client/package.json)
</cite>

## Update Summary
**Changes Made**
- Enhanced adminSlice.js documentation to reflect pagination system with separate state management for each entity type
- Updated fetchMasterData async thunk documentation to include query parameter handling
- Added comprehensive pagination state management documentation
- Updated store architecture to include pagination state structure
- Enhanced component integration documentation for pagination features

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Pagination System Implementation](#pagination-system-implementation)
7. [Query Parameter Handling](#query-parameter-handling)
8. [Cache Invalidation Mechanisms](#cache-invalidation-mechanisms)
9. [Dependency Analysis](#dependency-analysis)
10. [Performance Considerations](#performance-considerations)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Conclusion](#conclusion)

## Introduction
This document explains the Redux store configuration and setup for the client-side application. It covers the store creation via configureStore, reducer composition, and initialization. It documents the store structure with auth, theme, admin, and form reducers, and details how the store integrates with the React application using Provider. The store now includes a comprehensive pagination system with separate state management for each entity type and enhanced query parameter handling in the admin slice. Best practices for middleware setup, development tools integration, performance considerations, debugging setup, and store enhancers are addressed. The relationship between the store configuration and individual slices is explained, along with practical guidance for maintainable Redux usage.

## Project Structure
The Redux store is centralized under Client/src/store. The store composes four domain-specific reducers:
- auth: user authentication state and actions with session verification
- theme: light/dark theme preference
- admin: master data CRUD operations, async flows, and pagination state management
- form: form state for dynamic forms

The store is exported as a singleton and consumed by wrapping the React application with Provider in main.jsx. The admin slice now includes comprehensive pagination capabilities with separate state management for each entity type and sophisticated query parameter handling for filtering, sorting, and search operations.

```mermaid
graph TB
subgraph "Client/src/store"
S["store.js"]
A["auth/authSlice.js"]
T["theme/themeSlice.js"]
AD["admin/adminSlice.js"]
F["formSlice.js"]
end
subgraph "Client/src"
M["main.jsx"]
APP["App.jsx"]
ADMIN["pages/dashboard/Admin.jsx"]
DATATABLE["components/deshboard/DataTable.jsx"]
FORM["components/deshboard/Form.jsx"]
end
subgraph "Client/src/services"
API["services/apiClient.js"]
end
S --> A
S --> T
S --> AD
S --> F
M --> S
APP --> S
ADMIN --> S
DATATABLE --> S
FORM --> S
AD --> API
```

**Diagram sources**
- [store.js:1-15](file://Client/src/store/store.js#L1-L15)
- [authSlice.js:1-61](file://Client/src/store/auth/authSlice.js#L1-L61)
- [themeSlice.js:1-29](file://Client/src/store/theme/themeSlice.js#L1-L29)
- [adminSlice.js:1-201](file://Client/src/store/admin/adminSlice.js#L1-L201)
- [formSlice.js:1-24](file://Client/src/store/formSlice.js#L1-L24)
- [main.jsx:1-18](file://Client/src/main.jsx#L1-L18)
- [App.jsx:1-119](file://Client/src/App.jsx#L1-L119)
- [Admin.jsx:1-951](file://Client/src/pages/dashboard/Admin.jsx#L1-L951)
- [DataTable.jsx:1-563](file://Client/src/components/deshboard/DataTable.jsx#L1-L563)
- [Form.jsx:1-165](file://Client/src/components/deshboard/Form.jsx#L1-L165)
- [apiClient.js:1-213](file://Client/src/services/apiClient.js#L1-L213)

**Section sources**
- [store.js:1-15](file://Client/src/store/store.js#L1-L15)
- [main.jsx:1-18](file://Client/src/main.jsx#L1-L18)

## Core Components
- Store configuration: The store is created with configureStore and composed of four reducers: auth, theme, admin, and form. No middleware or enhancers are configured in the store file.
- Authentication slice: Provides login/logout actions, session verification via `/users/me` endpoint, and persists state to localStorage.
- Theme slice: Manages theme selection with persistence and prefers OS theme by default.
- Admin slice: Implements async CRUD operations via createAsyncThunk for multiple entities including comprehensive pagination state management and query parameter handling.
- Form slice: Centralizes form state for dynamic forms and active entity selection.

**Section sources**
- [store.js:7-14](file://Client/src/store/store.js#L7-L14)
- [authSlice.js:12-22](file://Client/src/store/auth/authSlice.js#L12-L22)
- [themeSlice.js:15-28](file://Client/src/store/theme/themeSlice.js#L15-L28)
- [adminSlice.js:21-74](file://Client/src/store/admin/adminSlice.js#L21-L74)
- [formSlice.js:3-24](file://Client/src/store/formSlice.js#L3-L24)

## Architecture Overview
The store is initialized once and exported as a singleton. The React application is wrapped with Provider so components can access state and dispatch actions. Components use useSelector to read slices and useDispatch to trigger actions. Async flows in the admin slice integrate with an API client configured for credentials and include sophisticated cache invalidation mechanisms for real-time data synchronization. The enhanced pagination system provides separate state management for each entity type with comprehensive query parameter handling for filtering, sorting, and search operations.

```mermaid
sequenceDiagram
participant Root as "main.jsx"
participant Provider as "Provider"
participant App as "App.jsx"
participant Admin as "Admin.jsx"
participant DataTable as "DataTable.jsx"
participant Store as "Redux Store"
participant AdminSlice as "Admin Slice"
participant APIClient as "API Client"
Root->>Provider : "wrap app with store"
App->>Admin : "render admin dashboard"
Admin->>DataTable : "render data table"
DataTable->>Store : "dispatch fetchMasterData({ entityKey, params })"
Store->>AdminSlice : "execute pending"
AdminSlice->>APIClient : "GET /endpoint?page=1&limit=10&search=query"
APIClient-->>AdminSlice : "paginated response with pagination data"
AdminSlice-->>Store : "fulfilled action with entity data + pagination"
Store-->>DataTable : "state updated with paginated data"
DataTable->>Store : "user changes pagination/filter/sort"
Store->>AdminSlice : "execute fetchMasterData with new params"
AdminSlice->>APIClient : "GET /endpoint with updated query params"
APIClient-->>AdminSlice : "fresh paginated data"
AdminSlice-->>Store : "updated state with new pagination"
Store-->>DataTable : "re-render with updated data"
```

**Diagram sources**
- [main.jsx:6-16](file://Client/src/main.jsx#L6-L16)
- [App.jsx:14-24](file://Client/src/App.jsx#L14-L24)
- [Admin.jsx:29-46](file://Client/src/pages/dashboard/Admin.jsx#L29-L46)
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)
- [adminSlice.js:21-74](file://Client/src/store/admin/adminSlice.js#L21-L74)
- [apiClient.js:182-210](file://Client/src/services/apiClient.js#L182-L210)

## Detailed Component Analysis

### Store Composition and Initialization
- configureStore is used to create the store with a reducer map containing auth, theme, admin, and form keys.
- The store is exported as a singleton for global access across the app.
- No middleware or enhancers are configured in the store file.

```mermaid
flowchart TD
Start(["configureStore"]) --> Compose["Compose reducers:<br/>auth, theme, admin, form"]
Compose --> Export["Export store as singleton"]
Export --> Use["Import store in main.jsx<br/>wrap app with Provider"]
Use --> End(["Ready for useSelector/useDispatch"])
```

**Diagram sources**
- [store.js:7-14](file://Client/src/store/store.js#L7-L14)
- [main.jsx:6-7](file://Client/src/main.jsx#L6-L7)

**Section sources**
- [store.js:1-15](file://Client/src/store/store.js#L1-L15)
- [main.jsx:1-18](file://Client/src/main.jsx#L1-L18)

### Authentication Slice
- Purpose: Manage authentication state and persist user data and authentication flag to localStorage.
- Actions: login and logout update state and synchronize localStorage.
- Session Verification: Uses `/users/me` endpoint for automatic session verification on app load.
- Integration: Used by pages and components that require user session awareness.

```mermaid
flowchart TD
Dispatch["Dispatch verifySession"] --> Reduce["auth reducer updates state"]
Reduce --> Persist["localStorage updated"]
Persist --> NextRender["Components re-render with new auth state"]
```

**Diagram sources**
- [authSlice.js:12-22](file://Client/src/store/auth/authSlice.js#L12-L22)

**Section sources**
- [authSlice.js:12-22](file://Client/src/store/auth/authSlice.js#L12-L22)

### Theme Slice
- Purpose: Track and toggle theme preference with persistence and OS preference fallback.
- Actions: toggleTheme switches between light and dark themes and saves to localStorage.
- Integration: App.jsx reads theme to apply CSS classes to the document element.

```mermaid
flowchart TD
Toggle["toggleTheme action"] --> Update["Update theme state"]
Update --> Persist["Persist theme to localStorage"]
Persist --> Apply["App.jsx applies 'dark' class to document"]
```

**Diagram sources**
- [themeSlice.js:19-22](file://Client/src/store/theme/themeSlice.js#L19-L22)
- [App.jsx:16-24](file://Client/src/App.jsx#L16-L24)

**Section sources**
- [themeSlice.js:15-28](file://Client/src/store/theme/themeSlice.js#L15-L28)
- [App.jsx:14-24](file://Client/src/App.jsx#L14-L24)

### Admin Slice (Enhanced with Pagination System)
- Purpose: Manage master data CRUD operations for multiple entities with comprehensive pagination state management and query parameter handling.
- Async Thunks: fetchMasterData, addMasterData, updateMasterData, deleteMasterData with cache invalidation support.
- State Management: Tracks loading, error, active entity, editing ID, masterData map keyed by entity, and separate pagination state for each entity.
- Query Parameter Handling: Enhanced fetchMasterData accepts entityKey and params object for pagination, filtering, sorting, and search operations.
- Pagination State: Separate pagination object stores pagination metadata for each entity type including currentPage, totalPages, totalItems, itemsPerPage, and navigation flags.
- Cache Invalidation: Automatic cache clearing and refresh mechanisms for real-time data synchronization.
- Integration: Components dispatch thunks with query parameters and read state to render paginated lists and forms.

**Updated** The admin slice now includes comprehensive pagination state management with separate state for each entity type. The fetchMasterData async thunk has been enhanced to accept query parameters including page, limit, search, sortBy, sortOrder, and filter fields. This enables sophisticated filtering, sorting, and search operations with pagination support.

```mermaid
sequenceDiagram
participant UI as "DataTable.jsx"
participant Store as "Redux Store"
participant Thunk as "admin async thunk"
participant API as "Axios Client"
participant Cache as "API Cache"
UI->>Store : "dispatch fetchMasterData({ entityKey, params })"
Store->>Thunk : "execute pending"
Thunk->>API : "HTTP request with query params"
API->>Cache : "check cache with params"
API-->>Thunk : "paginated response with pagination data"
Thunk->>Store : "fulfilled action with entity data + pagination"
Store->>Store : "update masterData[entityKey] + pagination[entityKey]"
Store-->>UI : "state updated with paginated data"
```

**Diagram sources**
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)
- [adminSlice.js:21-74](file://Client/src/store/admin/adminSlice.js#L21-L74)
- [adminSlice.js:125-136](file://Client/src/store/admin/adminSlice.js#L125-L136)
- [apiClient.js:182-210](file://Client/src/services/apiClient.js#L182-L210)

**Section sources**
- [adminSlice.js:5-19](file://Client/src/store/admin/adminSlice.js#L5-L19)
- [adminSlice.js:21-74](file://Client/src/store/admin/adminSlice.js#L21-L74)
- [adminSlice.js:76-192](file://Client/src/store/admin/adminSlice.js#L76-L192)
- [DataTable.jsx:8-17](file://Client/src/components/deshboard/DataTable.jsx#L8-L17)
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)

### Form Slice
- Purpose: Centralize form state for dynamic forms, including entityForm, editingEntityId, and activeEntity.
- Integration: Used by form components to manage transient UI state without persisting to localStorage.

**Section sources**
- [formSlice.js:3-24](file://Client/src/store/formSlice.js#L3-L24)

### Store Export Pattern and React Integration
- Export pattern: The store is created once and exported as a named constant for reuse across the app.
- React integration: main.jsx wraps the application with Provider and passes the store instance.
- Consumption: Components import useSelector and useDispatch to connect to the store.

```mermaid
graph LR
Store["store.js: export store"] --> ImportMain["main.jsx: import store"]
ImportMain --> Provider["Provider store={store}"]
Provider --> App["App.jsx renders routes"]
App --> Components["Components use useSelector/useDispatch"]
```

**Diagram sources**
- [store.js:7-14](file://Client/src/store/store.js#L7-L14)
- [main.jsx:6-7](file://Client/src/main.jsx#L6-L7)
- [App.jsx:14-24](file://Client/src/App.jsx#L14-L24)

**Section sources**
- [store.js:7-14](file://Client/src/store/store.js#L7-L14)
- [main.jsx:1-18](file://Client/src/main.jsx#L1-L18)
- [App.jsx:1-119](file://Client/src/App.jsx#L1-L119)

## Pagination System Implementation

### Pagination State Architecture
The admin slice implements a sophisticated pagination system with separate state management for each entity type:

- **Separate Entity State**: Each entity maintains its own pagination state in the pagination object
- **Pagination Metadata**: Stores currentPage, totalPages, totalItems, itemsPerPage, startIndex, endIndex, and navigation flags
- **Entity-Specific Management**: Pagination state is isolated per entity to support independent pagination controls
- **Fallback Handling**: Graceful fallback when backend doesn't return pagination data

### Pagination State Structure
```javascript
// State structure for pagination
pagination: {
  [entityKey]: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    startIndex: number,
    endIndex: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

### Query Parameter Processing
The enhanced fetchMasterData async thunk processes query parameters for comprehensive filtering and search:

- **Pagination Parameters**: page, limit for controlling data volume and navigation
- **Search Parameters**: search for text-based filtering across entities
- **Sorting Parameters**: sortBy and sortOrder for data ordering
- **Filter Parameters**: filter_fieldName for advanced filtering with filter_ prefix
- **Dynamic Parameter Building**: Automatic parameter construction based on UI interactions

```mermaid
flowchart TD
Params["Query Params Object"] --> Build["Build Request Params"]
Build --> Page["page: 1"]
Build --> Limit["limit: 10"]
Build --> Search["search: query"]
Build --> Sort["sortBy: field, sortOrder: asc/desc"]
Build --> Filters["filter_field: value"]
Build --> Send["Send to API Endpoint"]
Send --> Response["Paginated Response"]
Response --> Update["Update State:<br/>masterData + pagination"]
```

**Diagram sources**
- [DataTable.jsx:31-43](file://Client/src/components/deshboard/DataTable.jsx#L31-L43)
- [adminSlice.js:23-32](file://Client/src/store/admin/adminSlice.js#L23-L32)

**Section sources**
- [adminSlice.js:76-83](file://Client/src/store/admin/adminSlice.js#L76-L83)
- [adminSlice.js:125-136](file://Client/src/store/admin/adminSlice.js#L125-L136)
- [DataTable.jsx:8-17](file://Client/src/components/deshboard/DataTable.jsx#L8-L17)
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)

## Query Parameter Handling

### Parameter Construction Logic
The DataTable component constructs comprehensive query parameters for enhanced filtering:

- **Basic Parameters**: page and limit for pagination control
- **Search Enhancement**: Adds search parameter when text is entered
- **Sorting Parameters**: Includes sortBy and sortOrder when sorting is applied
- **Filter Parameters**: Dynamically adds filter_ prefixed parameters for each active filter
- **Parameter Filtering**: Only includes parameters with valid, non-empty values

### Parameter Processing in Admin Slice
The enhanced fetchMasterData thunk processes incoming parameters:

- **Entity Validation**: Ensures entityKey corresponds to valid endpoint
- **Parameter Extraction**: Extracts entityKey and params from action payload
- **API Integration**: Passes parameters directly to API client for request
- **Response Handling**: Processes both paginated and non-paginated responses
- **State Updates**: Updates both masterData and pagination state appropriately

### Dynamic Parameter Building
The system supports dynamic parameter building based on user interactions:

```mermaid
sequenceDiagram
participant User as "User Interface"
participant DataTable as "DataTable Component"
participant Store as "Redux Store"
participant AdminSlice as "Admin Slice"
User->>DataTable : "change page/filter/sort"
DataTable->>DataTable : "build params object"
DataTable->>Store : "dispatch fetchMasterData(params)"
Store->>AdminSlice : "process params"
AdminSlice->>AdminSlice : "validate entity + extract params"
AdminSlice->>AdminSlice : "call API with params"
AdminSlice->>AdminSlice : "update state with results"
```

**Diagram sources**
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)
- [adminSlice.js:21-33](file://Client/src/store/admin/adminSlice.js#L21-L33)

**Section sources**
- [DataTable.jsx:28-46](file://Client/src/components/deshboard/DataTable.jsx#L28-L46)
- [adminSlice.js:21-33](file://Client/src/store/admin/adminSlice.js#L21-L33)
- [Admin.jsx:31-40](file://Client/src/pages/dashboard/Admin.jsx#L31-L40)

## Cache Invalidation Mechanisms

### Cache Management Architecture
The admin slice implements sophisticated cache invalidation mechanisms for real-time data synchronization:

- **Automatic Cache Invalidation**: Cache clearing on successful mutations (POST, PUT, DELETE)
- **Entity-Specific Cache Management**: Targeted cache invalidation for specific entities
- **Cache Statistics**: Built-in cache monitoring and statistics collection
- **Duplicate Request Handling**: Prevention of duplicate requests during cache operations

### Cache Invalidation Flow
When user data is modified, the system automatically invalidates the cache for the user entity to ensure real-time data synchronization across all components:

```mermaid
sequenceDiagram
participant Admin as "Admin Component"
participant AdminSlice as "Admin Slice"
participant APIClient as "API Client"
participant Cache as "Cache System"
Admin->>AdminSlice : "dispatch addMasterData / updateMasterData"
AdminSlice->>APIClient : "POST/PUT with invalidateCache"
APIClient->>Cache : "invalidate(entityKey)"
Cache-->>APIClient : "cache cleared for entity"
APIClient-->>AdminSlice : "success response"
AdminSlice-->>Admin : "state updated with refreshed data"
```

**Diagram sources**
- [adminSlice.js:35-74](file://Client/src/store/admin/adminSlice.js#L35-L74)
- [apiClient.js:182-210](file://Client/src/services/apiClient.js#L182-L210)
- [apiClient.js:155-180](file://Client/src/services/apiClient.js#L155-L180)

**Section sources**
- [adminSlice.js:99-115](file://Client/src/store/admin/adminSlice.js#L99-L115)
- [apiClient.js:155-180](file://Client/src/services/apiClient.js#L155-L180)
- [apiClient.js:182-210](file://Client/src/services/apiClient.js#L182-L210)

## Dependency Analysis
- Internal dependencies:
  - store.js depends on each slice's reducer export.
  - main.jsx depends on store.js and react-redux Provider.
  - App.jsx and Admin.jsx depend on the store for state and actions.
  - DataTable.jsx depends on Admin.jsx and uses pagination state.
  - Admin.jsx depends on Form.jsx for user management interface.
  - adminSlice.js depends on apiClient.js for HTTP operations.
- External dependencies:
  - @reduxjs/toolkit for configureStore and createSlice/createAsyncThunk.
  - react-redux for Provider and hooks.
  - axios for admin async thunks with custom cache management.
  - react-hot-toast for user feedback notifications.

```mermaid
graph TB
Pkg["package.json: dependencies"] --> RTK["@reduxjs/toolkit"]
Pkg --> RR["react-redux"]
Pkg --> AX["axios"]
Pkg --> HT["react-hot-toast"]
StoreJS["store.js"] --> RTK
StoreJS --> Auth["authSlice.js"]
StoreJS --> Theme["themeSlice.js"]
StoreJS --> Admin["adminSlice.js"]
StoreJS --> Form["formSlice.js"]
MainJSX["main.jsx"] --> RR
MainJSX --> StoreJS
AppJSX["App.jsx"] --> StoreJS
AdminJSX["Admin.jsx"] --> StoreJS
DataTableJSX["DataTable.jsx"] --> StoreJS
AdminJSX --> FormJSX["Form.jsx"]
Admin["adminSlice.js"] --> APIClient["apiClient.js"]
APIClient --> AX
```

**Diagram sources**
- [package.json:12-22](file://Client/package.json#L12-L22)
- [store.js:1-5](file://Client/src/store/store.js#L1-L5)
- [main.jsx:6-7](file://Client/src/main.jsx#L6-L7)
- [App.jsx:5](file://Client/src/App.jsx#L5)
- [Admin.jsx:1-16](file://Client/src/pages/dashboard/Admin.jsx#L1-L16)
- [DataTable.jsx:1-5](file://Client/src/components/deshboard/DataTable.jsx#L1-L5)
- [Form.jsx:1-4](file://Client/src/components/deshboard/Form.jsx#L1-L4)
- [adminSlice.js:1-4](file://Client/src/store/admin/adminSlice.js#L1-L4)
- [apiClient.js:1-2](file://Client/src/services/apiClient.js#L1-L2)

**Section sources**
- [package.json:12-22](file://Client/package.json#L12-L22)
- [store.js:1-5](file://Client/src/store/store.js#L1-L5)
- [main.jsx:6-7](file://Client/src/main.jsx#L6-L7)
- [App.jsx:5](file://Client/src/App.jsx#L5)
- [Admin.jsx:1-16](file://Client/src/pages/dashboard/Admin.jsx#L1-L16)
- [DataTable.jsx:1-5](file://Client/src/components/deshboard/DataTable.jsx#L1-L5)
- [Form.jsx:1-4](file://Client/src/components/deshboard/Form.jsx#L1-L4)
- [adminSlice.js:1-4](file://Client/src/store/admin/adminSlice.js#L1-L4)
- [apiClient.js:1-2](file://Client/src/services/apiClient.js#L1-L2)

## Performance Considerations
- Keep slices focused: Each slice manages a single domain (auth, theme, admin, form). This improves readability and reduces unnecessary re-renders.
- Normalize async data: The admin slice stores arrays per entity key in masterData. Consider normalizing deeply nested data if lists grow large to minimize object churn.
- Pagination optimization: Separate pagination state prevents unnecessary re-renders when switching between entities.
- Query parameter efficiency: Dynamic parameter building ensures only relevant parameters are sent to the server.
- Avoid excessive localStorage writes: The auth and theme slices write to localStorage on every change. Batch writes or throttle if frequent toggles occur.
- Memoized selectors: Use memoized selectors (e.g., createSelector) for derived computations to avoid recomputation.
- Minimize deep object mutations: Prefer immutable updates in reducers to prevent accidental shared references.
- Lazy loading and chunking: For large admin lists, consider pagination or virtualization in UI components to reduce rendering overhead.
- Cache optimization: The API client implements intelligent caching with cache invalidation to balance performance and data freshness.
- Network efficiency: Duplicate request prevention and exponential backoff for failed requests improve network efficiency.

## Troubleshooting Guide
- Symptom: Theme not applying on initial load
  - Verify theme slice initializes from localStorage or OS preference and App.jsx applies the 'dark' class accordingly.
  - Check localStorage key for theme and confirm App.jsx effect runs on theme changes.
- Symptom: Admin async operations fail silently
  - Confirm async thunks dispatch pending/fulfilled/rejected actions and that error payloads are handled in components.
  - Ensure API base URL and credentials are correctly configured in the axios client.
- Symptom: Form not resetting after submit
  - Verify dispatch of setEditingEntityId(null) and clearError() after successful unwrap.
- Symptom: Missing Provider in main.jsx
  - Ensure Provider wraps the application and the imported store is passed correctly.
- Symptom: Pagination not working correctly
  - Check that pagination state is properly structured in the admin slice.
  - Verify that fetchMasterData is receiving query parameters correctly.
  - Ensure DataTable component is dispatching fetchMasterData with proper entityKey and params.
- Symptom: Query parameters not applied
  - Confirm DataTable component is building params object correctly.
  - Verify adminSlice fetchMasterData thunk is extracting and processing parameters.
  - Check that API endpoint supports the query parameters being sent.
- Symptom: User data not updating after modifications
  - Check that cache invalidation is working correctly for user entity operations.
  - Verify that invalidateCache option is being used in POST/PUT/DELETE requests.
- Symptom: Pagination state conflicts between entities
  - Ensure separate pagination state is maintained for each entity type.
  - Verify that pagination updates only affect the current entity.
- Symptom: Cache not clearing properly
  - Check cache invalidation logic in admin slice reducers.
  - Verify that apiCache.invalidate is being called with correct entity keys.

**Section sources**
- [themeSlice.js:3-9](file://Client/src/store/theme/themeSlice.js#L3-L9)
- [App.jsx:16-24](file://Client/src/App.jsx#L16-L24)
- [adminSlice.js:109-115](file://Client/src/store/admin/adminSlice.js#L109-L115)
- [DataTable.jsx:54-58](file://Client/src/components/deshboard/Form.jsx#L54-L58)
- [main.jsx:6-7](file://Client/src/main.jsx#L6-L7)
- [Admin.jsx:694-744](file://Client/src/pages/dashboard/Admin.jsx#L694-L744)
- [apiClient.js:155-180](file://Client/src/services/apiClient.js#L155-L180)

## Conclusion
The Redux store is configured as a minimal, focused setup using configureStore with four domain-specific reducers. The store is exported as a singleton and integrated with the React application via Provider. The auth and theme slices demonstrate persistence and UI synchronization, while the admin slice handles complex async flows with clear loading and error handling. The form slice centralizes transient form state.

**Updated** The store now includes comprehensive pagination capabilities with separate state management for each entity type and enhanced query parameter handling. The admin slice supports sophisticated filtering, sorting, and search operations with pagination, automatic cache management, and seamless integration with the existing master data management system. The enhanced fetchMasterData async thunk provides flexible query parameter handling for various use cases including user management, entity filtering, and data organization.

For future enhancements, consider adding middleware for async flows, store enhancers for development tools, and memoized selectors for performance. The current structure supports maintainability and scalability across the application with robust pagination and query parameter handling capabilities.