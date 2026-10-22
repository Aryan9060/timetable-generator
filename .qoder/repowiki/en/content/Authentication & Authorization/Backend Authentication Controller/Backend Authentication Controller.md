# Backend Authentication Controller

<cite>
**Referenced Files in This Document**
- [user.controller.js](file://Backend/src/controllers/user.controller.js)
- [user.models.js](file://Backend/src/models/user.models.js)
- [user.routers.js](file://Backend/src/routes/user.routers.js)
- [Token.js](file://Backend/src/utils/Token.js)
- [auth.middleware.js](file://Backend/src/middlewares/auth.middleware.js)
- [ApiError.js](file://Backend/src/utils/ApiError.js)
- [ApiResponse.js](file://Backend/src/utils/ApiResponse.js)
- [asyncHandler.js](file://Backend/src/utils/asyncHandler.js)
- [server.js](file://Backend/src/server.js)
- [db/index.js](file://Backend/src/db/index.js)
- [constenets.js](file://Backend/src/constenets.js)
- [errorHandler.middleware.js](file://Backend/src/middlewares/errorHandler.middleware.js)
</cite>

## Update Summary
**Changes Made**
- Redesigned authentication flow to use user_id instead of traditional username credentials
- Enhanced error handling and validation logic for user_id-based authentication
- Implemented comprehensive JWT-based authentication with token generation and management
- Added password hashing using bcryptjs with secure pre-save hooks
- Integrated secure httpOnly cookie handling for token storage
- Enhanced authentication middleware with role-based authorization
- Improved user registration with intelligent duplicate detection
- Expanded profile management with detailed user data aggregation

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the enhanced backend authentication controller implementation for user registration, login, logout, token management, and profile management. The system now includes comprehensive JWT-based authentication with user_id-based credentials, password hashing with bcryptjs, role-based authorization, and extensive debugging capabilities with console logging. It covers the complete user authentication flow including login validation, password verification, JWT token generation, user role assignment, and integration with Mongoose models for secure user data management.

**Updated** The authentication system has been redesigned to use user_id as the primary credential instead of traditional username/password combinations, providing enhanced security and flexibility for different user types (students, faculty, staff).

## Project Structure
The authentication controller now operates within a fully secured ecosystem with JWT token management, role-based authorization, and comprehensive error handling. The system integrates with Mongoose models, Express routes, JWT utilities, authentication middleware, and shared utilities for error and response handling.

```mermaid
graph TB
subgraph "Server Layer"
S["Express App<br/>server.js"]
R["Routes<br/>user.routers.js"]
EH["Error Handler<br/>errorHandler.middleware.js"]
end
subgraph "Authentication Layer"
AM["Auth Middleware<br/>auth.middleware.js"]
TK["Token Utils<br/>Token.js"]
end
subgraph "Controllers"
C["Enhanced User Controller<br/>user.controller.js"]
end
subgraph "Models"
M["Enhanced User Model<br/>user.models.js"]
end
subgraph "Utilities"
AE["ApiError<br/>ApiError.js"]
AR["ApiResponse<br/>ApiResponse.js"]
AH["Async Handler<br/>asyncHandler.js"]
end
subgraph "Database"
DB["MongoDB via Mongoose<br/>db/index.js"]
CN["Constants<br/>constenets.js"]
end
S --> R
R --> AM
AM --> TK
R --> C
C --> M
C --> AE
C --> AR
C --> TK
M --> DB
S --> EH
EH --> AE
```

**Diagram sources**
- [server.js:1-106](file://Backend/src/server.js#L1-L106)
- [user.routers.js:1-41](file://Backend/src/routes/user.routers.js#L1-L41)
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [user.controller.js:1-702](file://Backend/src/controllers/user.controller.js#L1-L702)
- [user.models.js:1-105](file://Backend/src/models/user.models.js#L1-L105)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [ApiResponse.js:1-74](file://Backend/src/utils/ApiResponse.js#L1-L74)
- [asyncHandler.js:1-47](file://Backend/src/utils/asyncHandler.js#L1-L47)
- [db/index.js:1-19](file://Backend/src/db/index.js#L1-L19)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)

**Section sources**
- [server.js:1-106](file://Backend/src/server.js#L1-L106)
- [user.routers.js:1-41](file://Backend/src/routes/user.routers.js#L1-L41)
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [user.controller.js:1-702](file://Backend/src/controllers/user.controller.js#L1-L702)
- [user.models.js:1-105](file://Backend/src/models/user.models.js#L1-L105)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [ApiResponse.js:1-74](file://Backend/src/utils/ApiResponse.js#L1-L74)
- [asyncHandler.js:1-47](file://Backend/src/utils/asyncHandler.js#L1-L47)
- [db/index.js:1-19](file://Backend/src/db/index.js#L1-L19)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)

## Core Components
- **Enhanced User Controller**: Implements comprehensive authentication flows including registration, login with JWT, logout, token refresh, password change, and profile management. Features user_id-based login, password hashing, token generation, and extensive console logging for debugging.
- **Enhanced User Model**: Includes bcryptjs password hashing, dynamic user_id generation, role validation, and password comparison methods with pre-save hooks for automatic password encryption.
- **JWT Token System**: Full token management with access tokens (15 minutes), refresh tokens (7 days), secure cookie options, and token verification utilities.
- **Authentication Middleware**: Comprehensive middleware for JWT verification, role-based authorization, admin-only access, and optional authentication.
- **Enhanced Error Handling**: Structured error responses with ApiError class providing consistent HTTP status codes and error messages.
- **Response Formatting**: Standardized ApiResponse class for consistent success responses across all controller methods.

Key responsibilities:
- **Registration**: Validates user data, generates unique user_ids, hashes passwords, and handles both single and bulk user registration with duplicate detection.
- **Authentication**: Supports user_id-based login with role-specific user identification, password verification using bcryptjs, and JWT token generation.
- **Session Management**: Handles token refresh cycles, logout procedures, and secure cookie-based session management.
- **Profile Management**: Comprehensive CRUD operations with role-based access control and detailed user data aggregation.
- **Security**: Implements password hashing, token-based authentication, role-based authorization, and account deactivation handling.

**Updated** The authentication system now uses user_id as the primary credential, automatically generated based on role and associated student/faculty identifiers, providing enhanced security and flexibility.

**Section sources**
- [user.controller.js:14-132](file://Backend/src/controllers/user.controller.js#L14-L132)
- [user.controller.js:414-701](file://Backend/src/controllers/user.controller.js#L414-L701)
- [user.models.js:4-105](file://Backend/src/models/user.models.js#L4-L105)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [ApiResponse.js:1-74](file://Backend/src/utils/ApiResponse.js#L1-L74)

## Architecture Overview
The enhanced authentication flow now includes comprehensive JWT-based security, role-based authorization, and extensive debugging capabilities with user_id-based credentials.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "User Router<br/>user.routers.js"
participant AuthMW as "Auth Middleware<br/>auth.middleware.js"
participant Ctrl as "Enhanced User Controller<br/>user.controller.js"
participant TokenUtil as "Token Utils<br/>Token.js"
participant Model as "Enhanced User Model<br/>user.models.js"
participant DB as "MongoDB<br/>db/index.js"
Client->>Router : POST /api/v1/users/login
Router->>Ctrl : userLogin(req,res)
Ctrl->>Ctrl : Validate user_id & password
Ctrl->>Model : findOne({user_id})
Model->>DB : Query user by user_id
DB-->>Model : User document
Model-->>Ctrl : User found
Ctrl->>Ctrl : Check isActive
Ctrl->>Ctrl : comparePassword()
Ctrl->>TokenUtil : generateTokens(user)
TokenUtil-->>Ctrl : {accessToken, refreshToken}
Ctrl->>Model : save refresh token
Model->>DB : Update refresh token
DB-->>Model : Updated user
Ctrl->>Ctrl : Aggregate user details
Ctrl->>Ctrl : Set secure cookies
Ctrl-->>Client : 200 OK with tokens
Client->>Router : POST /api/v1/users/refresh-token
Router->>Ctrl : refreshAccessToken(req,res)
Ctrl->>TokenUtil : verifyRefreshToken()
TokenUtil-->>Ctrl : Decoded token
Ctrl->>Model : findById()
Model->>DB : Query user
DB-->>Model : User with refreshToken
Model-->>Ctrl : User found
Ctrl->>TokenUtil : generateTokens(user)
TokenUtil-->>Ctrl : New tokens
Ctrl->>Model : save new refresh token
Ctrl-->>Client : 200 OK with new tokens
```

**Diagram sources**
- [user.routers.js:18-21](file://Backend/src/routes/user.routers.js#L18-L21)
- [auth.middleware.js:6-44](file://Backend/src/middlewares/auth.middleware.js#L6-L44)
- [user.controller.js:414-594](file://Backend/src/controllers/user.controller.js#L414-L594)
- [Token.js:33-55](file://Backend/src/utils/Token.js#L33-L55)
- [user.models.js:99-102](file://Backend/src/models/user.models.js#L99-L102)
- [db/index.js:4-16](file://Backend/src/db/index.js#L4-L16)

## Detailed Component Analysis

### Enhanced User Registration
The registration system now includes comprehensive validation, duplicate detection, and secure password handling with extensive logging for debugging.

```mermaid
flowchart TD
Start(["registerUser Entry"]) --> Validate["Validate input is array or single user"]
Validate --> Single{"Single user?"}
Single --> |Yes| SingleFields["Validate password, role, student_id/faculty_id"]
Single --> |No| MultiFields["Validate each user in array"]
MultiFields --> UniqueCheck["Check for existing student/faculty IDs"]
Single --> UniqueCheck
UniqueCheck --> FilterUnique["Filter unique records not in DB"]
FilterUnique --> HasUnique{"Any unique records?"}
HasUnique --> |No| Throw409["Throw ApiError(409) - Conflict"]
HasUnique --> |Yes| Insert["Insert unique records with logging"]
Insert --> Success{"Inserted > 0?"}
Success --> |No| Throw500["Throw ApiError(500) - Internal Error"]
Success --> |Yes| Response["Return ApiResponse(201) with user data"]
```

**Diagram sources**
- [user.controller.js:14-132](file://Backend/src/controllers/user.controller.js#L14-L132)
- [ApiError.js:28-59](file://Backend/src/utils/ApiError.js#L28-L59)
- [ApiResponse.js:16-22](file://Backend/src/utils/ApiResponse.js#L16-L22)

**Section sources**
- [user.controller.js:14-132](file://Backend/src/controllers/user.controller.js#L14-L132)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [ApiResponse.js:1-74](file://Backend/src/utils/ApiResponse.js#L1-L74)

### Enhanced User Login with JWT Authentication
The login system now supports user_id-based authentication, password verification with bcryptjs, JWT token generation, and comprehensive error handling.

**Updated** The login system has been redesigned to use user_id instead of traditional username credentials. The user_id is automatically generated based on role and associated identifiers, providing enhanced security and flexibility.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Router as "Router"
participant Ctrl as "Enhanced Controller"
participant Model as "Enhanced Model"
participant TokenUtil as "Token Utils"
participant DB as "MongoDB"
Client->>Router : POST /api/v1/users/login
Router->>Ctrl : userLogin(req,res)
Ctrl->>Ctrl : Validate user_id & password
Ctrl->>Model : findOne({user_id})
Model->>DB : Query user by user_id
DB-->>Model : User found
Model-->>Ctrl : User document
Ctrl->>Ctrl : Check isActive
Ctrl->>Ctrl : comparePassword()
Ctrl->>TokenUtil : generateTokens(user)
TokenUtil-->>Ctrl : {accessToken, refreshToken}
Ctrl->>Model : save refresh token
Model->>DB : Update refresh token
DB-->>Model : Updated user
Ctrl->>Ctrl : Aggregate user details
Ctrl->>Ctrl : Set secure cookies
Ctrl-->>Client : 200 OK with user data, tokens
```

**Diagram sources**
- [user.controller.js:414-519](file://Backend/src/controllers/user.controller.js#L414-L519)
- [user.models.js:99-102](file://Backend/src/models/user.models.js#L99-L102)
- [Token.js:33-37](file://Backend/src/utils/Token.js#L33-L37)
- [ApiError.js:33-39](file://Backend/src/utils/ApiError.js#L33-L39)
- [ApiResponse.js:16-18](file://Backend/src/utils/ApiResponse.js#L16-L18)

**Section sources**
- [user.controller.js:414-519](file://Backend/src/controllers/user.controller.js#L414-L519)
- [user.models.js:99-102](file://Backend/src/models/user.models.js#L99-L102)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [ApiResponse.js:1-74](file://Backend/src/utils/ApiResponse.js#L1-L74)

### Token Management System
Comprehensive JWT token management with access tokens, refresh tokens, and secure cookie handling.

```mermaid
flowchart TD
A["Token Generation"] --> B["generateAccessToken()"]
B --> C["JWT Sign with ACCESS_TOKEN_SECRET"]
C --> D["Set 15min expiry"]
D --> E["generateRefreshToken()"]
E --> F["JWT Sign with REFRESH_TOKEN_SECRET"]
F --> G["Set 7day expiry"]
G --> H["generateTokens()"]
H --> I["Return {accessToken, refreshToken}"]
J["Token Verification"] --> K["verifyAccessToken()"]
K --> L["jwt.verify()"]
L --> M["verifyRefreshToken()"]
M --> N["jwt.verify()"]
O["Cookie Options"] --> P["accessTokenCookieOptions"]
P --> Q["httpOnly, secure, strict, 15min"]
O --> R["refreshTokenCookieOptions"]
R --> S["httpOnly, secure, strict, 7days"]
```

**Diagram sources**
- [Token.js:3-71](file://Backend/src/utils/Token.js#L3-L71)

**Section sources**
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)

### Authentication Middleware Implementation
Role-based authorization and JWT verification middleware for route protection.

```mermaid
flowchart TD
A["verifyJWT Middleware"] --> B["Extract token from cookies/header"]
B --> C["Verify JWT token"]
C --> D["Find user by decoded ID"]
D --> E["Check user isActive"]
E --> F["Attach user to req.user"]
F --> G["Call next()"]
H["authorizeRoles Middleware"] --> I["Check req.user exists"]
I --> J["Verify role in allowed roles"]
J --> K["Allow access or throw 403"]
L["isAdmin Middleware"] --> M["Check req.user.role === 'admin'"]
M --> N["Allow or restrict access"]
O["isFacultyOrAdmin Middleware"] --> P["Check allowed roles array"]
P --> Q["Allow faculty, admin, coordinator, hod"]
```

**Diagram sources**
- [auth.middleware.js:6-121](file://Backend/src/middlewares/auth.middleware.js#L6-L121)

**Section sources**
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)

### Enhanced Profile Management
Comprehensive user profile management with role-based access control and detailed data aggregation.

```mermaid
flowchart TD
A["getAllUsers Entry"] --> B["User.aggregate()"]
B --> C["$lookup students & faculties"]
C --> D["$addFields user_data condition"]
D --> E["$project consolidated fields"]
E --> F["Return ApiResponse(200)"]
G["getUserById Entry"] --> H["Match by ObjectId"]
H --> I["Join student/faculty data"]
I --> J["Project consolidated fields"]
J --> K["Return ApiResponse(200)"]
L["updateUser Entry"] --> M["Validate ID & data"]
M --> N["Build update object"]
N --> O["Handle password separately"]
O --> P["Hash password with bcryptjs"]
P --> Q["Update user fields"]
Q --> R["Return ApiResponse(200)"]
S["deleteUser Entry"] --> T["Validate ID"]
T --> U["Find and delete user"]
U --> V["Return ApiResponse(200)"]
```

**Diagram sources**
- [user.controller.js:135-263](file://Backend/src/controllers/user.controller.js#L135-L263)
- [user.controller.js:265-339](file://Backend/src/controllers/user.controller.js#L265-L339)
- [user.controller.js:341-395](file://Backend/src/controllers/user.controller.js#L341-L395)
- [user.controller.js:397-412](file://Backend/src/controllers/user.controller.js#L397-L412)

**Section sources**
- [user.controller.js:135-263](file://Backend/src/controllers/user.controller.js#L135-L263)
- [user.controller.js:265-339](file://Backend/src/controllers/user.controller.js#L265-L339)
- [user.controller.js:341-395](file://Backend/src/controllers/user.controller.js#L341-L395)
- [user.controller.js:397-412](file://Backend/src/controllers/user.controller.js#L397-L412)

### Enhanced Password Handling
Secure password management with bcryptjs integration and comprehensive validation.

**Updated** Password handling now includes bcryptjs integration with configurable salt rounds, automatic password hashing in pre-save hooks, and secure password comparison methods. The user_id is automatically generated based on role and associated identifiers during the pre-save hook.

**Section sources**
- [user.models.js:65-102](file://Backend/src/models/user.models.js#L65-L102)
- [user.controller.js:667-701](file://Backend/src/controllers/user.controller.js#L667-L701)

### Dynamic User ID Generation
Automatic user_id generation based on role and associated identifiers.

**Updated** The user_id is now automatically generated during the pre-save hook based on the user's role and associated student/faculty identifiers, providing enhanced security and uniqueness.

```mermaid
flowchart TD
A["Pre-save Hook"] --> B["Check isNew && !user_id"]
B --> C["Generate role prefix (first 3 letters)"]
C --> D{"Has student_id?"}
D --> |Yes| E["user_id = rolePrefix + student_id"]
D --> |No| F{"Has faculty_id?"}
F --> |Yes| G["user_id = rolePrefix + faculty_id"]
F --> |No| H["Generate unique timestamp + random"]
H --> I["user_id = rolePrefix + timestamp + random"]
```

**Diagram sources**
- [user.models.js:65-97](file://Backend/src/models/user.models.js#L65-L97)

**Section sources**
- [user.models.js:65-97](file://Backend/src/models/user.models.js#L65-L97)

### Role-Based Authorization
Comprehensive role management with validation and access control.

**Updated** Role assignment now includes validation against enumerated values (admin, faculty, student, coordinator, hod) with automatic lowercase conversion and role-based route protection. The user_id generation is role-specific, ensuring proper identification based on user type.

**Section sources**
- [user.models.js:19-28](file://Backend/src/models/user.models.js#L19-L28)
- [auth.middleware.js:47-92](file://Backend/src/middlewares/auth.middleware.js#L47-L92)

### Enhanced Error Handling
Structured error responses with comprehensive status codes and debugging support.

**Updated** Error handling now includes comprehensive ApiError implementations with consistent HTTP status codes, detailed error messages, and development environment stack traces for debugging. The error handler middleware now properly processes JWT-related errors and provides meaningful feedback.

**Section sources**
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [user.controller.js:26-44](file://Backend/src/controllers/user.controller.js#L26-L44)
- [user.controller.js:429-443](file://Backend/src/controllers/user.controller.js#L429-L443)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)

### Enhanced Debugging Capabilities
Extensive console logging for troubleshooting and monitoring.

**Updated** The controller now includes comprehensive console logging throughout all major operations including request processing, database queries, token generation, and user actions for enhanced debugging and monitoring capabilities. The user_id-based authentication flow includes detailed logging for troubleshooting.

**Section sources**
- [user.controller.js:17-18](file://Backend/src/controllers/user.controller.js#L17-L18)
- [user.controller.js:18-19](file://Backend/src/controllers/user.controller.js#L18-L19)
- [user.controller.js:424-425](file://Backend/src/controllers/user.controller.js#L424-L425)
- [user.controller.js:502-503](file://Backend/src/controllers/user.controller.js#L502-L503)

### Route Protection Strategies
Comprehensive authentication and authorization middleware.

**Updated** Routes are now protected with JWT authentication and role-based authorization middleware, providing granular access control with different permission levels for various operations. The user_id-based authentication ensures proper user identification across all protected routes.

**Section sources**
- [user.routers.js:18-38](file://Backend/src/routes/user.routers.js#L18-L38)
- [auth.middleware.js:6-121](file://Backend/src/middlewares/auth.middleware.js#L6-L121)

## Dependency Analysis
The enhanced controller now depends on JWT utilities, authentication middleware, bcryptjs for password hashing, and comprehensive error/response handling utilities.

```mermaid
graph LR
UC["user.controller.js"] --> UM["user.models.js"]
UC --> AH["asyncHandler.js"]
UC --> AE["ApiError.js"]
UC --> AR["ApiResponse.js"]
UC --> TK["Token.js"]
UR["user.routers.js"] --> UC
UR --> AM["auth.middleware.js"]
AM --> TK
SRV["server.js"] --> UR
SRV --> DBIDX["db/index.js"]
SRV --> EH["errorHandler.middleware.js"]
DBIDX --> CN["constenets.js"]
UM --> BC["bcryptjs"]
EH --> AE
```

**Diagram sources**
- [user.controller.js:1-702](file://Backend/src/controllers/user.controller.js#L1-L702)
- [user.models.js:1-105](file://Backend/src/models/user.models.js#L1-L105)
- [user.routers.js:1-41](file://Backend/src/routes/user.routers.js#L1-L41)
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [server.js:1-106](file://Backend/src/server.js#L1-L106)
- [db/index.js:1-19](file://Backend/src/db/index.js#L1-L19)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)
- [constenets.js:1-2](file://Backend/src/constenets.js#L1-L2)

**Section sources**
- [user.controller.js:1-702](file://Backend/src/controllers/user.controller.js#L1-L702)
- [user.models.js:1-105](file://Backend/src/models/user.models.js#L1-L105)
- [user.routers.js:1-41](file://Backend/src/routes/user.routers.js#L1-L41)
- [auth.middleware.js:1-121](file://Backend/src/middlewares/auth.middleware.js#L1-L121)
- [Token.js:1-71](file://Backend/src/utils/Token.js#L1-L71)
- [server.js:1-106](file://Backend/src/server.js#L1-L106)
- [db/index.js:1-19](file://Backend/src/db/index.js#L1-L19)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)
- [constenets.js:1-2](file://Backend/src/constenets.js#L1-L2)

## Performance Considerations
- **JWT Token Caching**: Consider implementing token caching for frequently accessed user data to reduce database queries.
- **Password Hashing**: Bcryptjs hashing is computationally intensive; consider adjusting salt rounds based on performance requirements.
- **Database Indexes**: Ensure proper indexing on user_id, student_id, faculty_id fields for optimal query performance.
- **Token Expiration**: Configure appropriate token expiration times to balance security and user experience.
- **Logging Overhead**: Console logging provides excellent debugging but may impact performance in production; consider log level configuration.
- **User ID Generation**: The automatic user_id generation during pre-save hooks adds minimal overhead but ensures uniqueness and security.

## Troubleshooting Guide
Common issues and resolutions with enhanced debugging capabilities:

**Authentication Issues:**
- **Login fails with invalid credentials**: Check user_id format and verify password hashing, and review console logs for detailed error information.
- **Token generation failures**: Verify JWT secret keys are properly configured in environment variables and check token utility functions.
- **Account deactivation**: Users with isActive=false will receive 403 Forbidden errors; verify user status in database.
- **User ID not found**: Ensure the user_id is properly generated and stored in the database during user creation.

**Authorization Issues:**
- **Role-based access denied**: Verify user role assignments and ensure proper middleware configuration for protected routes.
- **Token verification failures**: Check token expiration, verify JWT signatures, and confirm token storage in database.

**Database Issues:**
- **Duplicate user registration**: Review existing user detection logic and ensure unique constraints are properly enforced.
- **Password comparison failures**: Verify bcryptjs installation and check password hashing configuration.
- **User ID conflicts**: Check for proper user_id generation logic and ensure role-specific prefixes are correctly applied.

**Debugging Tips:**
- **Enable detailed logging**: Use console.log statements throughout controller methods to trace execution flow.
- **Check environment variables**: Verify JWT secrets, database connection strings, and application settings.
- **Monitor token lifecycle**: Track token generation, refresh, and expiration events for troubleshooting authentication flows.
- **Validate user_id format**: Ensure user_id follows the expected pattern (ROLE_PREFIX + IDENTIFIER) for proper authentication.

**Section sources**
- [user.controller.js:17-18](file://Backend/src/controllers/user.controller.js#L17-L18)
- [user.controller.js:18-19](file://Backend/src/controllers/user.controller.js#L18-L19)
- [user.controller.js:429-443](file://Backend/src/controllers/user.controller.js#L429-L443)
- [user.controller.js:502-503](file://Backend/src/controllers/user.controller.js#L502-L503)
- [ApiError.js:1-80](file://Backend/src/utils/ApiError.js#L1-L80)
- [errorHandler.middleware.js:1-88](file://Backend/src/middlewares/errorHandler.middleware.js#L1-L88)

## Conclusion
The enhanced backend authentication controller now provides a comprehensive, secure, and feature-rich authentication system with user_id-based credentials. Key improvements include JWT-based authentication with token refresh cycles, bcryptjs password hashing, role-based authorization, extensive debugging capabilities, and comprehensive error handling. The system supports user_id-based login with automatic user_id generation based on role and associated identifiers, secure token management with secure cookies, and granular access control through middleware. The addition of console logging throughout the authentication flow enables thorough debugging and monitoring capabilities. This implementation provides a solid foundation for enterprise-level authentication with scalability, security, and maintainability considerations built-in.

**Updated** The redesign to use user_id instead of traditional username credentials enhances security by providing unique, role-specific identifiers that are automatically generated and validated, while maintaining backward compatibility and extending functionality for different user types (students, faculty, staff).