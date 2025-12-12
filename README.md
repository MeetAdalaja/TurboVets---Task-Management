# TurboVets Tasker – Multi‑tenant RBAC Task Management

A full‑stack, **multi‑tenant task management platform** built with **Angular** (frontend) and **NestJS** (backend), designed to showcase **real‑world authentication**, **role‑based access control (RBAC)**, and **multi‑organization** access patterns.

> Built as a technical assessment inspired by TurboVets, this project focuses on clean architecture, strict permission rules, and a polished developer/demo experience.

---

## 🔗 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Getting Started](#-getting-started)
7. [Authentication & RBAC Model](#-authentication--rbac-model)
8. [Demo Roles & Scenarios](#-demo-roles--scenarios)
9. [Design Choices & Trade-offs](#-design-choices--trade-offs)
10. [Future Improvements](#-future-improvements)
11. [Screenshots & Demo](#-screenshots--demo)
12. [Author & Contact](#-author--contact)
13. [License](#-license)

---

## 🧭 Overview

**TurboVets Tasker** is a multi‑tenant web application where:

- Users can belong to **multiple organizations** (e.g., `TurboVets – San Diego`, `TurboVets – Austin`, `Happy Paws Animal Clinic`).
- Each user gets a **role per organization** (Owner, Admin, Manager, Member, Viewer).
- Every action in the system is governed by **strict RBAC rules**, enforced on both the **API** and the **UI**.

This project is intentionally built like a **real SaaS product** to demonstrate:

- How to design **multi‑org data models**.
- How to implement **defensive RBAC** using NestJS guards and service‑level checks.
- How to create a **role‑aware Angular UI** that feels smooth and secure to end‑users.

---

## ✨ Key Features

### Multi‑tenant organizations

- Separate organizations with isolated data:
  - Tasks, members, and settings are always **scoped by organization**.
- A single user can belong to multiple organizations with **different roles** in each.
- Organization switcher in the UI to change context safely.

### Five‑role RBAC model

Roles (from highest to lowest):

- **Owner**
- **Admin**
- **Manager**
- **Member**
- **Viewer**

Each role has clear, realistic permissions, for example:

- `Viewer`: read‑only access; cannot create, update, or delete anything.
- `Member`: can collaborate on tasks but cannot manage organization settings.
- `Manager`: can manage tasks and team execution within the org.
- `Admin`: can manage members and settings, but typically not the root ownership logic.
- `Owner`: full control over the organization and its settings.

### Authentication & authorization

- Token‑based authentication (login + protected REST API endpoints).
- **NestJS guards** and custom decorators for route‑level authorization:
  - Ensures only authenticated users can access protected routes.
  - Ensures the current user has the required role for an action.
- **Service‑layer checks** as a second line of defense:
  - Prevents bypassing rules via direct API calls or crafted requests.

### Role‑aware Angular frontend

- Protected routes using route guards.
- UI automatically adapts based on role:
  - Buttons and menus hidden or disabled if the user lacks permission.
  - Clear messaging for forbidden actions.
- Organization switcher so users can safely switch between orgs they belong to.

### Developer‑friendly demo setup

- Seed scripts create:
  - Multiple organizations
  - Owners, Admins, Managers, Members, and Viewers
  - A user who belongs to multiple orgs with different roles
- Designed to easily demo scenarios like:
  - “What happens when a `Viewer` tries to modify data?”
  - “What can a `Manager` do that a `Member` cannot?”
  - “How does the same user behave across two different organizations?”

---

## 🏗 System Architecture

At a high level:

```text
[ Angular Frontend ]  -->  [ NestJS API ]  -->  [ Database (SQL via TypeORM) ]
         |                          |
 [ Auth Guards,                    [ Auth Guards,
   Role-aware UI ]                  Service-level RBAC ]
```

### Backend

- **NestJS** modular architecture:
  - `auth` module for authentication and tokens.
  - `organizations` module for org CRUD and membership management.
  - `tasks` module for task creation, updates, and filtering.
  - Shared RBAC utilities for role checks and permissions.
- Controllers handle HTTP requests, while services handle business logic and permission enforcement.
- TypeORM entities model users, organizations, org memberships (user + org + role), tasks, etc.

### Frontend

- **Angular** SPA:
  - Auth service to store and attach tokens to requests.
  - HTTP interceptors for auth headers and error handling.
  - Route guards to protect private routes.
  - Components/pages for organizations, members, and tasks, with role‑aware UX.

---

## 🧰 Tech Stack

**Frontend**

- Angular
- TypeScript
- Angular Router & HttpClient
- Modern, utility‑first styling (Tailwind‑style classes / CSS)

**Backend**

- NestJS (Node.js, TypeScript)
- TypeORM (SQL database)
- Class‑validator / class‑transformer for DTO validation
- NestJS Guards, Interceptors, and custom decorators for RBAC

**General**

- RESTful APIs
- Environment‑based configuration (`.env`)
- Seed scripts for realistic test data

---

## 📁 Project Structure

> Folder names may vary slightly depending on your setup; this is the general idea.

```text
turbovets-tasker/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── tasks/
│   │   ├── common/        # shared RBAC utilities, decorators, guards
│   │   └── main.ts
│   ├── test/
│   ├── ormconfig.ts or equivalent
│   ├── package.json
│   └── ...env files, scripts, etc.
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/      # auth service, interceptors, models
    │   │   ├── features/  # orgs, members, tasks pages
    │   │   └── shared/    # components, UI pieces
    │   └── index.html
    ├── angular.json
    ├── package.json
    └── ...env files, assets, styles
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (LTS)
- npm or yarn
- A SQL database (e.g., PostgreSQL/MySQL; configured via TypeORM)
- Git

### 2. Clone the repository

```bash
git clone https://github.com/<your-username>/turbovets-tasker.git
cd turbovets-tasker
```

> You can rename the repo; just update the project name in this README.

### 3. Backend setup (NestJS)

```bash
cd backend
npm install
# or
yarn
```

Copy the environment template and update `DB` credentials, JWT secret, and any other config:

```bash
cp .env.example .env
```

Run database migrations and seeds (adjust to your actual scripts):

```bash
npm run typeorm:migration:run
npm run seed
```

Start the backend:

```bash
npm run start:dev
```

By default, the API will be available at something like:

```text
http://localhost:3000
```

### 4. Frontend setup (Angular)

```bash
cd frontend
npm install
# or
yarn
```

Update the environment files (e.g., `src/environments/environment.ts`) so the frontend points to your backend API URL.

Start the Angular dev server:

```bash
npm start
# or
ng serve
```

By default, the frontend will be available at something like:

```text
http://localhost:4200
```

### 5. Logging in (seeded users)

The seed script creates multiple organizations and demo users with different roles (Owner, Admin, Manager, Member, Viewer).

> Check the seed file for the exact email/password combinations.  
> Example users (you can modify these as you like):
>
> - `owner@demo.com` – Owner in one organization
> - `manager@demo.com` – Manager in one organization
> - `viewer@demo.com` – Viewer in one organization
> - `multi.org@demo.com` – Different roles across multiple organizations

Use any of these accounts to explore role‑specific behavior.

---

## 🔐 Authentication & RBAC Model

### Entities

At a conceptual level:

- **User**
- **Organization**
- **OrgMembership** (joins **User** + **Organization** + **Role**)
- **Task** (always belongs to a single organization)

This allows:

- A user to belong to multiple organizations.
- The same user to have different roles in each organization.

### Role definitions (example)

| Role    | Typical capabilities                                                                 |
|--------|----------------------------------------------------------------------------------------|
| Owner  | Full control over the organization, members, roles, and all data                     |
| Admin  | Manage members and settings, high‑level configuration                                |
| Manager| Manage tasks and team execution within the organization                              |
| Member | Work on tasks (create/update own items), limited settings access                     |
| Viewer | Read‑only access; cannot create, update, or delete                                   |

### Where RBAC is enforced

1. **API level (NestJS guards + decorators)**  
   - Guards ensure:
     - The request is authenticated.
     - The user belongs to the target organization.
     - The user has at least a certain role, e.g. `@Roles('Manager', 'Admin', 'Owner')`.
   - This prevents unauthorized access even if the frontend is bypassed.

2. **Service level (business logic checks)**  
   - Service methods verify:
     - The resource belongs to the user’s organization.
     - The user’s role allows this specific action (e.g., only `Owner` can change some org‑level settings).
   - This adds a second layer of protection beyond controller guards.

3. **Frontend level (Angular UI/UX)**  
   - Route guards restrict navigation to protected routes.
   - The UI hides or disables actions the user cannot perform.
   - Attempting forbidden actions results in friendly error messages rather than crashes.

---

## 🎭 Demo Roles & Scenarios

Here are some realistic demo flows you can show in an interview or presentation:

1. **Viewer vs. Manager**
   - Log in as a **Viewer**:
     - Can see tasks but **cannot** create, edit, or delete them.
     - “Add task” buttons and destructive actions are hidden or disabled.
   - Log in as a **Manager**:
     - Can create and update tasks, assign them to members.
     - Still cannot change some organization‑level settings.

2. **Owner full control**
   - Log in as an **Owner**:
     - Can manage members and their roles.
     - Can update organization settings.
     - Still scoped to that **single organization**; cannot touch others.

3. **Multi‑organization user**
   - Log in as a user who belongs to multiple organizations:
     - Switch between orgs via the org selector.
     - In one org they might be a `Viewer`, in another a `Manager` or `Admin`.
     - Notice how the UI options change when the org context changes.

These flows clearly demonstrate both **RBAC** and **multi‑tenant isolation**.

---

## 🧠 Design Choices & Trade-offs

Some key decisions made in this project:

- **Membership‑based roles**  
  Roles are attached to **(User, Organization)** instead of just the user.  
  This matches real SaaS products where the same user can be an admin in one workspace and a viewer in another.

- **Double‑layered authorization**  
  RBAC rules are enforced both:
  - at the controller level (via guards & decorators), and
  - at the service level (business rules).
  This reduces the risk of mistakes where a route is exposed but the underlying service still prevents misuse.

- **Explicit scoping by organization**  
  All queries for tasks, members, and settings are explicitly scoped by organization ID.  
  This is crucial for multi‑tenant safety and makes it easier to reason about data isolation.

- **Seed‑first approach**  
  A rich seed script makes it easy to:
  - spin up the project quickly,
  - demo features in interviews,
  - test edge cases across different roles and organizations.

- **Clear separation of modules**  
  Auth, organizations, tasks, and shared logic each live in their own NestJS modules, which keeps the codebase maintainable and extendable.

---

## 🔮 Future Improvements

If given more time, I would extend the project with:

- **Activity & audit logs**  
  - Track who did what and when (e.g., “Manager X updated Task Y”).
  - Helpful for security reviews and compliance.

- **More granular permissions**  
  - Permissions at the project or team level.
  - Custom roles per organization.

- **Soft deletes and recovery flows**  
  - Safer task deletion, with undo/restore options.

- **End‑to‑end tests**  
  - Cypress or Playwright to test critical RBAC flows end‑to‑end.

- **Advanced filtering & search**  
  - Filter tasks by role, assignee, status, and tag.
  - Better support for large organizations.

- **Dockerization**  
  - Docker + docker‑compose for one‑command setup of backend, frontend, and database.

---

## 🖼 Screenshots & Demo

You can add screenshots or GIFs here once you capture them, for example:

- **Dashboard view** – tasks and organization switcher.
- **Members page** – list of org members with roles.
- **Forbidden action** – example of a viewer attempting to modify data.

```md
![Dashboard](./docs/screenshots/dashboard.png)
![Members](./docs/screenshots/members.png)
```

If you deploy the app, also add:

- **Live Demo:** `https://<your-demo-url>`

---

## 👤 Author & Contact

**Author:** Meet Adalaja

- LinkedIn: https://www.linkedin.com/in/meet-adalaja
- Portfolio: https://meetadalja-portfolio.vercel.app
- GitHub: https://github.com/MeetAdalaja

If you’re interested in this project or want to talk about RBAC, multi‑tenant SaaS design, or full‑stack development, feel free to reach out.

---

## 📄 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it for personal or commercial purposes, with proper attribution.
