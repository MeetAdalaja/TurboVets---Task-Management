TurboVets Task Management – Secure Multi-Org Task Board


MEET ADALAJA – FULL STACK ENGINEER

REFERENCE: TEJAS WADIWALA – SENIOR SOFTWARE DEVELOPER




This project contains the TurboVets Full-Stack Engineer Assessment: a secure, multi-organization task management system built with an Nx monorepo, NestJS (Backend), and Angular + Tailwind (Frontend).

The goal was to design and implement:

- A secure task dashboard for a veterinary group (TurboVets) operating multiple clinics.
- Multi-organization support (a user can belong to multiple orgs).
- Role-based access control (RBAC) with multiple levels of permissions.
- Audited task and membership changes for accountability



Table of Contents


GitHub Link:

Deployed Version:

- High-Level Overview
Each organization represents various branches – location wise (e.g. “TurboVets – San Diego”, “TurboVets – Austin”).

A user can be a member of one or more organizations with a specific role in each.

Inside an organization, users can:

- Create, edit, assign, and track tasks.
- Manage members (depending on role).
- See an audit log of important changes (only for higher-privilege roles).
The system is deliberately focused on:

- Security: real JWT auth, password hashing, RBAC checks at the service layer.
- Multi-tenancy at the organization level.
- Clarity: code structured so you can see where each concern lives (entities, services, controllers, guards, UI pages).

- Tech Stack
Monorepo & Tooling

- [Nx](https://nx.dev/) – Monorepo tooling (TypeScript project references, task running).
- Node.js + npm.
Backend (API – `api/`)

- [NestJS](https://nestjs.com/) – Modular Node.js framework.
- [TypeORM](https://typeorm.io/) – ORM with decorators for entities & relations.
- SQLite (file-based) for local development (configurable to Postgres in production).
- JSON Web Tokens (JWT) for authentication.
- Bcrypt for password hashing.
Frontend (Web – `web/`)

- [Angular](https://angular.io/) – Standalone component architecture.
- [Tailwind CSS](https://tailwindcss.com/) – Styling.
- Angular HTTP client + interceptor for attaching JWT and Org context.

- Setup Instructions (Backend & Frontend)
This section is written to match the assessment’s “Setup Instructions” requirement explicitly.

1. Prerequisites

- Node.js (LTS – e.g. 20.x)
- npm
2. Clone the repository

git clone https://github.com/MeetAdalaja/TurboVets---Task-Management.git

cd TurboVets---Task-Management

3. Install dependencies

npm install

4. .env Setup (JWT, DB, etc.)

At the root, there is a .env file.

If it’s missing or you want to customize it, create/edit .env with variables along these lines (names may vary slightly depending on the final config):

# API

API_PORT=3000

# Database (SQLite for local dev)

DB_PATH=./data/turbovets.sqlite

# JWT

JWT_SECRET=your-long-random-secret-here

JWT_EXPIRES_IN=1h    # or "15m", "24h" etc.

# Node environment

NODE_ENV=development

- API_PORT – Port for the NestJS API.
- DB_PATH – Path to SQLite DB file (created automatically if it doesn’t exist).
- JWT_SECRET – Secret key for signing JWTs.
- JWT_EXPIRES_IN – Token lifetime.
- NODE_ENV – Environment (development, production, etc.).
5. Run the API

npx nx serve api

- The API will:
- Connect to the SQLite database.
- Run the SeedService once to create organizations and demo users.
- Listen on http://localhost:3000/api.
6. Run the Web App

In a separate terminal:

npx nx serve web

- Angular dev server runs on
7. Login & Test

- Open   in your browser.
- Login with, for example:
- Email: owner.sd@example.com
- Password: Password123!
- You should now see:
- Header with org selector and nav.
- Tasks page.
Org members page (for Owner/Admin).


- Arcitecture & Design Decisions
Why Nx Monorepo?

- Keeps backend and frontend in one place.
- Shared TypeScript types / interfaces between API & UI can live in data/.
- Consistent tooling for building, linting, and testing both sides.
Why NestJS + Angular?

- The assessment explicitly mentions these technologies.
- Both have strong opinions around structure, which keeps the code organized:
- Modules, controllers, services, guards on the backend.
- Standalone components + routing on the frontend.
RBAC Approach

- Instead of hard-coding role checks in controllers, business logic is inside services:
- Helper like requireMembershipWithRole(userId, orgId, minRole).
- The OrgRole enum has a natural “level” hierarchy:
- OWNER > ADMIN > MANAGER > MEMBER > VIEWER.
- This makes it easy to adjust in the future (e.g., add a new role or adjust responsibilities).
Audit Logging

- Rather than sprinkling raw console.log calls, changes go through a LoggingService that writes structured records to the AuditLog entity.
- Benefits:
- Consistent shape of logs.
- Easier to filter by action, actorUserId, organizationId, or entityType.
- Can later be extended to stream to external logging systems.
Task & Membership Safety Rules

- Tasks are always scoped by x-org-id to prevent cross-org data leakage.
- Membership deletes:
- Cannot delete the last OWNER of an organization to avoid orphaned orgs.
- Assignee dropdown:
- Excludes VIEWER role to avoid assigning work to someone who is read-only.

- Data Model Explanation
Core Entities

User:

- id (UUID)
- email (unique)
- fullName
- passwordHash
- createdAt, updatedAt
- Relations:
- memberships: Membership[]
- tasksCreated: Task[]
- tasksAssigned: Task[]
Organization

- id (UUID)
- name (e.g. TurboVets – San Diego)
- createdAt, updatedAt
- Relations:
- memberships: Membership[]
- tasks: Task[]
Membership

- id (UUID)
- user: User
- organization: Organization
- role: OrgRole
Acts as the link between User and Organization, including the user’s role in that org.

Task

- id (UUID)
- title
- description (optional)
- status – e.g. "TODO" | "IN_PROGRESS" | "DONE"
- dueDate (optional)
- organization: Organization
- createdBy: User
- assignedTo: User (optional)
- createdAt, updatedAt
AuditLog

- id (UUID)
- action – e.g. "TASK_CREATED", "TASK_UPDATED", "ORG_USER_ADDED", "LOGIN_SUCCESS", etc.
- actorUserId
- organizationId (nullable if global)
- entityType – e.g. "Task", "Membership", "User"
- entityId
- metadata (JSON) – old/new values, extra details
- createdAt
ERD / Diagram


This structure:

- Cleanly separates identity (User) from membership (Membership) and role (OrgRole).
- Ensures all Tasks and AuditLogs are scoped by Organization.
Org Roles (RBAC)

The project uses a 5-level role system, scoped per organization (a user can have different roles in different orgs):

- OWNER
- Full control over the organization.
- Can manage all members (including other admins).
- Can create/update/delete tasks.
- Can view audit logs.
- ADMIN
- Almost the same as OWNER inside that org (with some safety rules like not deleting the last owner).
- Can manage members (add/update/remove).
- Can create/update/delete tasks.
- Can view audit logs.
- MANAGER
- Operational role.
- Can create and update tasks in that org.
- Can assign tasks to other non-viewer members.
- Cannot manage org members via the admin page.
- MEMBER
- Regular staff member.
- Can create and update tasks however cannot assign.
- Cannot manage membership or roles.
- VIEWER
- Read-only access to tasks in that organization.
- Cannot create, edit, delete, or be assigned tasks (filtered out from assignee dropdown).
- Cannot manage members or view audit logs.
- Implementation detail: Internally, roles can be treated as having a level so we can compare them (OWNER > ADMIN > MANAGER > MEMBER > VIEWER), which simplifies permission checks.

- Security & Authentication
JWT Auth & Org Context

Authentication flow:

- Login:
- POST /api/auth/login with { email, password }.
- Validates the user via UsersService and bcrypt.
- On success, returns:
- accessToken – JWT
- Basic user information
- A list of organizations and the user’s role in each.
- JWT:
- Signed with a secret from .env.
- Includes at least:
- sub (userId)
- email
- Protected endpoints:
- All main endpoints (/tasks, /org-users, /audit-log, /me) are guarded by a JWT strategy.
Organization context:

The frontend sends:

- Authorization: Bearer <token>
- x-org-id: <organization-id>
The backend uses these to:

- Resolve the current User from the JWT.
- Resolve the Membership (user + org).
- Enforce RBAC for that specific organization in the service-layer checks.
Access Control Implementation

Access control is implemented in two layers:

- Authentication (who are you?)
- NestJS AuthGuard validates JWT.
- Extracts userId and attaches it to the request context.
- Authorization (are you allowed to do this in this org?)
- For any operation touching org-specific data:
- Look up membership by userId + orgId (from x-org-id).
- Check if membership exists.
- Check if the membership role is high enough for that action.
- This is done via helper methods in services, such as:
- requireMembershipWithRole(userId, orgId, minRole)
- ensureCanManageOrgMembers(...)
- ensureCanModifyTask(...), etc.
- Examples:
- Creating a task:
- User must be at least MEMBER in that org.
- Deleting a task:
- User must be ADMIN or OWNER in that org.
- Viewing audit log:
- User must be ADMIN or OWNER.
- Adding/removing members:
- User must be ADMIN or OWNER.
- Additional check: cannot remove the last OWNER.
This approach keeps controllers thin and moves the real permission logic into reusable service-layer helpers.


- Backend API Overview
Base URL (local dev): http://localhost:3000/api

High-level areas:

- /auth – Login, token issuance.
- /me – Current user profile & organizations.
- /org-users – Membership / role management in the current org.
- /tasks – Task creation, updating, listing, deleting.
- /audit-log – Read audit events (for admins/owners).

- API Documentation
Below is a focused list of endpoints + sample requests/responses.

All endpoints except POST /auth/login require:

- Authorization: Bearer <jwt>
- x-org-id: <organization-id>
Auth

POST /api/auth/login

Body:

{

  "email": "owner.sd@example.com",

  "password": "Password123!"

}

Response (example):

{

  "accessToken": "jwt-token-here",

  "user": {

    "id": "user-uuid",

    "email": "owner.sd@example.com",

    "fullName": "San Diego Owner"

  },

  "organizations": [

    {

      "id": "org-sd-id",

      "name": "TurboVets – San Diego",

      "role": "OWNER"

    },

    {

      "id": "org-hp-id",

      "name": "Happy Paws Animal Clinic",

      "role": "VIEWER"

    }

  ]

}

Me & Organizations

GET /api/me

Returns details about the current user (based on token) and optionally org-specific info.

Headers:

- Authorization: Bearer <jwt>
- x-org-id: <org-id>
Response (example):

{

  "id": "user-uuid",

  "email": "owner.sd@example.com",

  "fullName": "San Diego Owner",

  "currentOrg": {

    "id": "org-sd-id",

    "name": "TurboVets – San Diego",

    "role": "OWNER"

  }

}

GET /api/me/organizations

Returns all organizations the user belongs to.

Response (example):

[

  {

    "id": "org-sd-id",

    "name": "TurboVets – San Diego",

    "role": "OWNER"

  },

  {

    "id": "org-aus-id",

    "name": "TurboVets – Austin",

    "role": "ADMIN"

  },

  {

    "id": "org-hp-id",

    "name": "Happy Paws Animal Clinic",

    "role": "VIEWER"

  }

]

Org Users Management

All endpoints here require at least ADMIN (or OWNER) in the current x-org-id.

GET /api/org-users

Returns members (memberships) of the current organization.

Response (example):

[

  {

    "membershipId": "mem-uuid-1",

    "userId": "user-uuid-1",

    "email": "owner.sd@example.com",

    "fullName": "San Diego Owner",

    "role": "OWNER"

  },

  {

    "membershipId": "mem-uuid-2",

    "userId": "user-uuid-2",

    "email": "multi.user@example.com",

    "fullName": "Multi Org User",

    "role": "MEMBER"

  }

]

POST /api/org-users

Create or update membership.

Request body (new user):

{

  "email": "new.user@example.com",

  "fullName": "New User",

  "role": "MEMBER",

  "password": "InitialPassword123!"

}

Request body (existing user, role change + optional password reset):

{

  "email": "multi.user@example.com",

  "fullName": "Multi Org User",

  "role": "ADMIN",

  "password": ""      // omit or empty = don't change password

}

Behavior:

- If the user does not exist:
- password is required. If omitted, API returns 400 with a clear message.
- Creates new User + Membership.
- If user already exists:
- Updates or creates the membership for the current org.
- If non-empty password provided → reset password for that user.
Response (example):

{

  "membershipId": "mem-uuid-3",

  "userId": "user-uuid-3",

  "email": "new.user@example.com",

  "fullName": "New User",

  "role": "MEMBER"

}

DELETE /api/org-users/:membershipId

Removes a membership from the organization.

Example:

DELETE /api/org-users/mem-uuid-1

Authorization: Bearer <jwt>

x-org-id: org-sd-id

If this is the last OWNER of the org, returns 403 Forbidden with an error message like:

"Cannot remove the last OWNER from this organization."

Tasks

All task endpoints are scoped to the current x-org-id. Only members of that org can see/modify its tasks.

GET /api/tasks

Returns all tasks for the current organization.

Response (example):

[

  {

    "id": "task-1",

    "title": "Call client about lab results",

    "description": "Follow up with client X",

    "status": "TODO",

    "priority": "HIGH",

    "dueDate": "2025-12-10",

    "assignedTo": {

      "id": "user-uuid-2",

      "fullName": "Multi Org User",

      "email": "multi.user@example.com"

    }

  }

]

POST /api/tasks

Creates a new task in the current org.

Body:

{

  "title": "Prepare surgery room",

  "description": "For 3pm surgery",

  "status": "TODO",

  "priority": "MEDIUM",

  "dueDate": "2025-12-05",

  "assignedToUserId": "user-uuid-2"  // or null

}

Response:

{

  "id": "task-2",

  "title": "Prepare surgery room",

  "status": "TODO",

  "priority": "MEDIUM",

  "assignedTo": null,

  "organizationId": "org-sd-id",

  "createdByUserId": "user-uuid-owner"

}

PUT /api/tasks/:id

Updates a task.

Body (example):

{

  "title": "Prepare surgery room",

  "status": "IN_PROGRESS",

  "priority": "HIGH",

  "assignedToUserId": "user-uuid-2",

  "dueDate": "2025-12-05"

}

DELETE /api/tasks/:id

Deletes a task (Admin/Owner level required).

Audit Log

GET /api/audit-log

Restricted to ADMIN / OWNER for the current org.

Response (example):

[

  {

    "id": "log-1",

    "action": "TASK_CREATED",

    "actorUserId": "user-uuid-owner",

    "organizationId": "org-sd-id",

    "entityType": "Task",

    "entityId": "task-2",

    "metadata": {

      "title": "Prepare surgery room",

      "priority": "MEDIUM"

    },

    "createdAt": "2025-12-03T10:15:00.000Z"

  }

]


- Frontend Overview
Base URL (local dev) Web:

Global Layout

The root AppComponent provides:

- A dark-mode header with:
- TurboVets Tasker logo/title.
- Organization selector (dropdown) populated from /me/organizations.
- Simple nav tabs: e.g. “Tasks”, “Org members”.
- Logged-in user info + “Logout” button.
- Body area with a router-outlet
- Tailwind-based responsive layout:
- On desktop, content is centered with max width.
- On smaller screens, cards stack (space-y-6) and remain usable.
Login Page (/login)


- Simple card layout with:
- Email + password fields.
- “Sign in” button.
- On success:
- Stores the JWT token.
- Stores the list of organizations.
- Auto-selects an org (usually the first).
- Navigates to /tasks.
For convenience, the login page can also mention demo accounts and their credentials in a small helper panel.

Task Page (/tasks)


- Layout:
- Top section: page title + small description.
- Create task card.
- Tasks Board.
Create Task card:

- Fields:
- Title (required).
- Description (optional).
- Due date (optional).
- Assignee (dropdown):
- Populated with non-VIEWER members for the current org.
- Includes an “Unassigned” option.
Tasks Board:

- Columns:
- To Do
- In Progress
- Done
- Behavior:
- Changing a Assignee or field triggers an update call to the API.
- Viewer role sees a read-only view (no editable controls).
- When no tasks exist, a friendly “empty state” message is shown.
Org Users Admin Page (/org-users)


Only visible/enabled for Owners/Admins.

Layout: stacked cards

1. Add or update member card:

- Fields:
- Email (required)
- Full name (required)
- Password:
- Required when creating a new user.
- Optional for existing user email → acts as password reset.
- Role dropdown (OWNER, ADMIN, MANAGER, MEMBER, VIEWER).
- On submit:
- Calls the POST /org-users endpoint.
- Shows success/error message
- Reloads the member list.
2. Current members card:

- Board with:
- Email
- Full name
- Role
- Clicking “Remove”:
- Confirms with the user.
- Calls DELETE /org-users/:membershipId.
- If trying to remove the last OWNER, the backend rejects with a clear error message.
The frontend automatically hides management actions for lower roles (Manager/Member/Viewer).


- Seed Data & Demo Logins
- The backend includes a SeedService that runs once on startup to create
Organizations

- TurboVets – San Diego
- TurboVets – Austin
- Happy Paws Animal Clinic
Users & Memberships (example)

- owner.sd@example.com – OWNER in TurboVets – San Diego
- owner.aus@example.com – OWNER in TurboVets – Austin
- owner.hp@example.com – OWNER in Happy Paws Animal Clinic
- multi.user@example.com
- MEMBER in TurboVets – San Diego
- VIEWER in Happy Paws Animal Clinic
All seeded accounts share a known password for convenience in local dev (e.g. Password123!).


- Future Considerations
This section directly addresses the “Future Considerations” requirements from the assessment.

Advanced Role Delegation

Support custom roles per organization:

- E.g. “Head Nurse”, “Front Desk Lead”.
- Each custom role could be mapped to a set of permissions (create tasks, assign tasks, manage members, view audit, etc.).
Implement delegated administration:

- Owners can grant certain admin power to specific users for specific modules (e.g. “Task admin but not member admin”).
Introduce resource-level permissions:

- Per-task overrides (e.g. “Only this small group can edit this task”).
Production-Ready Security

JWT Refresh Tokens

- Use short-lived access tokens + long-lived refresh tokens.
- Refresh token rotation on each refresh.
- Server-side revocation list (e.g. in Redis).
CSRF Protection

- Move away from localStorage to HttpOnly cookies for JWTs in a real deployment.
- Use CSRF tokens for state-changing requests.
- Add strict SameSite and Secure flags.
RBAC Caching

- Cache user-org-role mappings in memory or Redis for faster permission checks.
- Invalidate when roles or memberships change.
Hardening

- Add stricter content security policies (CSP).
- Add rate limiting for login and other sensitive endpoints.
- Expand validation for all DTOs to prevent invalid input.
Scaling Permission Checks Efficiently

Push more checks into database queries:

- Use joins to ensure a user only ever sees tasks for orgs they belong to.
- Potentially leverage database-level row security
Introduce permission evaluation service:

- Central service that answers “Can user U perform action A on resource R in org O?”.
Add fine-grained audit logging and analytics:

- Measure which endpoints are most used and where permission failures happen most.
