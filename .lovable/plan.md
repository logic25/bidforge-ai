

# BidForge — AI-Powered RFP Management Platform

## Overview
A full-featured SaaS application for managing RFPs (Request for Proposals) with AI-powered discovery, pipeline tracking, and proposal content management. Built with React + Supabase backend.

---

## Phase 1: Foundation & Auth

### Supabase Setup
- Connect Supabase (Lovable Cloud) for auth, database, and storage
- Create database tables: **companies**, **profiles**, **agencies**, and **user_roles**
- Enable RLS with company-scoped policies so users only see their own company's data
- Create a trigger to auto-create a profile on signup

### Authentication Pages (`/auth`)
- Login & Signup tabs with email/password
- Google SSO button
- Auth callback handler at `/auth/callback`
- Password reset flow with `/reset-password` page

### Route Guards
- Unauthenticated users → redirect to `/auth`
- Onboarding incomplete → redirect to `/onboarding`
- Otherwise → `/dashboard`

---

## Phase 2: App Layout & Navigation

### Sidebar Navigation
- Dark navy sidebar (`#1A1A2E`) with orange (`#F97316`) accent CTAs
- Collapsible sidebar with icon-only mini mode
- Active route highlighting
- Routes: Dashboard, Pipeline, Discovery, Content Library, RFI Manager, Templates, Calendar, Analytics, Settings
- User avatar and company name at the bottom

### White Content Area
- Clean, modern layout with breadcrumbs and page headers

---

## Phase 3: Onboarding Wizard (`/onboarding`)

A 4-step guided flow for new users:

1. **Industry Selection** — Choose from Construction, Government, IT, Professional Services, or Other
2. **States of Operation** — Multi-select US states with search
3. **Monitoring Keywords** — Comma-separated keyword input for RFP discovery alerts
4. **Team Invitations** — Enter teammate emails or skip

Saves all selections to the **companies** table and marks onboarding as complete.

---

## Phase 4: Dashboard (`/dashboard`)

Placeholder dashboard cards with real Supabase queries where data exists:
- **Pipeline Summary** — Active RFPs count and value
- **Upcoming Deadlines** — Next 5 deadlines
- **Win Rate** — Win/loss percentage
- **Recent Activity** — Latest actions feed
- **Discovery Alerts** — New RFP matches

---

## Phase 5: Settings Page (`/settings`)

- **Account Info** — Edit name, email, avatar
- **Team Members** — List current members with invite button
- **Billing** — Placeholder "Coming Soon" section for future Stripe integration

---

## Phase 6: Agencies Seed Data

Seed the **agencies** table with 30-50 real procurement portals across NY, CA, TX, FL, IL, PA, OH, NJ, GA, and WA — covering construction and government sectors.

---

## Phase 7: Remaining Page Shells

Create placeholder pages with appropriate headers and empty states for:
- **Pipeline** — Kanban-style RFP tracking (placeholder)
- **Discovery** — Auto-discovered RFPs list (placeholder)
- **Content Library** — Reusable proposal content (placeholder)
- **RFI Manager** — RFI tracking table (placeholder)
- **Templates** — Template marketplace grid (placeholder)
- **Calendar** — Deadline calendar view (placeholder)
- **Analytics** — Win/loss charts (placeholder)

Each page will have a consistent layout with descriptive empty states and CTAs.

