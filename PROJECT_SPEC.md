# Barbershop Web Application - Project Specification & Architecture

This document serves as the single source of truth for the Barbershop Booking & Management Web Application. It outlines the architecture, database schema, user roles, core workflows, and implementation roadmap.

---

## 1. System Overview & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** + **React** + **Tailwind CSS** + **shadcn/ui** | Modern, responsive UI with server-side rendering, client-side interactivity, and accessible component library. |
| **Backend & API** | **Next.js Route Handlers & Server Actions (Node.js)** | Node.js execution environment hosted seamlessly on Vercel with type-safe server actions. |
| **Database & Auth** | **Supabase (PostgreSQL + Supabase Auth + RLS)** | Relational database, role-based access control with Row Level Security (RLS), email/password auth, database triggers. |
| **Deployment** | **Vercel** | Automated CI/CD, global edge caching, preview deployments, and environment variable management. |

---

## 2. User Roles & Permissions Matrix

The application supports three distinct roles along with unauthenticated guest visitors.

| Capability | Guest (No Account) | Client (Default Account) | Barber | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Services & Barbers | ✅ | ✅ | ✅ | ✅ |
| Book Appointment (Guest Mode) | ✅ | — | — | — |
| Book Appointment (Account Mode) | — | ✅ | ✅ (Walk-ins) | ✅ (Any) |
| View Own Appointment History | — | ✅ | ✅ | ✅ |
| Leave Reviews & Ratings | — | ✅ (Completed only) | — | — |
| View Assigned Schedule & Bookings | — | — | ✅ | ✅ |
| Accept / Decline Appointments | — | — | ✅ | ✅ |
| Mark Appointments Completed/Cancelled | — | — | ✅ | ✅ |
| Manage Working Hours & Shifts | — | — | View only | ✅ (Set for all) |
| Assign Services to Barbers | — | — | — | ✅ |
| Promote / Demote Roles (Client <-> Barber) | — | — | — | ✅ |
| Delete Users / Delete Appointments | — | — | — | ✅ |
| Manage Service Catalog & Pricing | — | — | — | ✅ |

### 2.1 Header Navigation & Dynamic Auth State (Option A)

The application header dynamically reflects the user's authentication and role state:

#### A. Logged Out State (Guest / Visitor)
```
[Logo]   Services   Our Work   Barbers   Hours   │   [ Sign In ]   [ 📅 Book Appointment ]
```

#### B. Logged In State (Role-Aware User Menu)
```
[Logo]   Services   Our Work   Barbers   Hours   │   [ 👤 Name (Role) ▾ ]   [ 📅 Book Appointment ]
```

When clicked, the user menu opens a dropdown tailored to their specific role:
- **Client Menu**:
  - 📅 **My Appointments**: View upcoming bookings, appointment history, and leave reviews (`/client/appointments`).
  - ⚙️ **Profile Settings**: Update name, phone number, and preferences (`/client/profile`).
  - 🚪 **Log Out**: Terminates session and redirects/refreshes to public view.
- **Barber Menu**:
  - ✂️ **Barber Dashboard**: Daily/weekly calendar, accept/decline incoming appointments with WhatsApp (`/barber/appointments`).
  - ⚙️ **Profile & Bio**: Edit barber bio and specialties (`/barber/profile`).
  - 🚪 **Log Out**.
- **Admin Menu**:
  - ⚡ **Admin Dashboard**: Overview metrics and analytics (`/admin/overview`).
  - 👥 **User Management**: Promote/demote roles (Client <-> Barber), delete accounts (`/admin/users`).
  - 💈 **Barber Management**: Assign services and configure weekly shift hours (`/admin/barbers`).
  - 📋 **Service Catalog**: Manage services, durations, and pricing (`/admin/services`).
  - 📅 **Global Appointments**: Manage or delete all appointments (`/admin/appointments`).
  - 🚪 **Log Out**.

---

## 3. Database Schema (PostgreSQL / Supabase)

### 3.1 Custom Enums
```sql
CREATE TYPE user_role AS ENUM ('client', 'barber', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
```

### 3.2 Tables

#### `profiles`
Extends Supabase `auth.users`. Automatically populated on signup via database trigger.
- `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `full_name`: `TEXT NOT NULL`
- `email`: `TEXT NOT NULL UNIQUE`
- `phone`: `TEXT NOT NULL UNIQUE`
- `avatar_url`: `TEXT`
- `role`: `user_role NOT NULL DEFAULT 'client'`
- `bio`: `TEXT` (optional biography for barbers)
- `is_active`: `BOOLEAN DEFAULT true`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

#### `services`
Catalog of haircut and grooming services offered by the shop.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name`: `TEXT NOT NULL` (e.g. "Fade & Haircut", "Beard Trim & Lineup")
- `description`: `TEXT`
- `duration_minutes`: `INTEGER NOT NULL` (e.g., 30, 45, 60)
- `price`: `NUMERIC(10, 2) NOT NULL`
- `is_active`: `BOOLEAN DEFAULT true`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### `barber_services` (Junction Table)
Defines which services each barber is qualified or assigned to perform.
- `barber_id`: `UUID REFERENCES profiles(id) ON DELETE CASCADE`
- `service_id`: `UUID REFERENCES services(id) ON DELETE CASCADE`
- `PRIMARY KEY (barber_id, service_id)`

#### `barber_schedules`
Weekly recurring schedule configured for each barber.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `barber_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `day_of_week`: `INTEGER NOT NULL` (0 = Sunday, 1 = Monday, ... 6 = Saturday)
- `start_time`: `TIME NOT NULL` (e.g. '09:00:00')
- `end_time`: `TIME NOT NULL` (e.g. '18:00:00')
- `break_start`: `TIME` (e.g. '13:00:00')
- `break_end`: `TIME` (e.g. '14:00:00')
- `is_working`: `BOOLEAN DEFAULT true`
- `UNIQUE (barber_id, day_of_week)`

#### `barber_time_off`
Special dates when a barber is unavailable (vacations, sick leave, holidays).
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `barber_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `start_date`: `DATE NOT NULL`
- `end_date`: `DATE NOT NULL`
- `reason`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### `appointments`
Core booking record supporting both guest and registered client bookings.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `barber_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT`
- `client_id`: `UUID REFERENCES profiles(id) ON DELETE SET NULL` (NULL for guest bookings)
- `guest_name`: `TEXT` (Required if `client_id` is NULL)
- `guest_email`: `TEXT` (Required if `client_id` is NULL)
- `guest_phone`: `TEXT` (Required if `client_id` is NULL)
- `appointment_date`: `DATE NOT NULL`
- `start_time`: `TIME NOT NULL`
- `end_time`: `TIME NOT NULL`
- `status`: `appointment_status NOT NULL DEFAULT 'pending'`
- `total_price`: `NUMERIC(10, 2) NOT NULL`
- `notes`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

#### `reviews`
Client feedback on completed appointments.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `appointment_id`: `UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE`
- `client_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `barber_id`: `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `rating`: `INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)`
- `comment`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

---

## 4. Key Workflows

### 4.1 Backend-Driven User Registration Flow (`POST /auth/register`)

The registration system follows a secure, server-authoritative flow where validation, sanitization, database uniqueness verification, and auth creation happen inside a dedicated Next.js Route Handler (`app/auth/register/route.ts`).

```
[User Form /register]
       │  (POST JSON payload)
       ▼
[Route Handler: app/auth/register/route.ts]
       │
       ├─► 1. Check Full Name (min 2 chars) -> Error: "Please enter your full name"
       ├─► 2. Check Email (valid format) -> Error: "Please enter a valid email address"
       ├─► 3. Check Phone (sanitized for MK +389 or European dial code) -> Error: "Please enter a valid phone number"
       ├─► 4. Check Password (min 6 chars) -> Error: "Password must be at least 6 characters"
       ├─► 5. Check Password Confirmation (match) -> Error: "Passwords do not match"
       │
       ├─► 6. DB Email Uniqueness Check (SELECT id FROM profiles WHERE email = ?)
       │          └─► If found -> 409 Conflict: "This email address is already registered. Please sign in."
       │
       ├─► 7. DB Phone Uniqueness Check (SELECT id FROM profiles WHERE phone = ?)
       │          └─► If found -> 409 Conflict: "This phone number is already registered to another account."
       │
       ├─► 8. Supabase Auth Creation (supabase.auth.signUp with user metadata)
       │          └─► Database trigger `handle_new_user()` populates `public.profiles`.
       │
       └─► 9. Success Response -> Redirect to `/register/verify-email?email=<email>`
                  │
                  ▼
[Verify Email Page /register/verify-email]
       └─► Standalone confirmation screen displaying target email and instructions to check inbox.
       └─► Primary "Back to Sign In" CTA (no resend button).
```

### 4.2 Step-by-Step Booking Flow Architecture
The booking wizard uses the **Barber-First Hierarchical Flow**, which is mathematically the cleanest and safest state machine for schedule calculation:

```
[Booking Wizard]
       │
       ├─► Step 1: Select Barber
       │          └─► Loads specific barber profile, rating, and assigned services.
       │
       ├─► Step 2: Select Service
       │          └─► Displays only services assigned to this barber (via `barber_services`).
       │          └─► Sets exact duration (e.g. 45 min) and price.
       │
       ├─► Step 3: Select Date (Calendar)
       │          └─► Interactive calendar automatically disables:
       │                - Past dates
       │                - Days of week the barber does not work (e.g., Sunday/Monday)
       │                - Specific vacation dates from `barber_time_off`
       │
       ├─► Step 4: Calculate & Display Dynamic Time Slots
       │          └─► Fetches existing bookings for [Barber + Date].
       │          └─► Checks continuous duration window for selected service.
       │          └─► Renders only 100% conflict-free start times.
       │
       ├─► Step 5: Client / Guest Contact Info
       │          └─► Guest mode (Name, Email, Mandatory Phone) OR Sign In / Account autofill.
       │
       └─► Step 6: Confirmation (Pay at Shop - Cash)
                  └─► Atomic database insert with race-condition collision protection.
                  └─► Triggers Barber Dashboard notification & one-click WhatsApp confirmation.
```

### 4.2 WhatsApp Direct Communication & Phone Sanitization System (Zero Cost)
- **Primary Country**: **North Macedonia (`🇲🇰 +389`)** as default, with European country selector (`🇦🇱 +355`, `🇽🇰 +383`, `🇩🇪 +49`, `🇨🇭 +41`, `🇮🇹 +39`, `🇦🇹 +43`, `🇬🇧 +44`, etc.).
- **North Macedonia Mobile Rules**:
  - Local numbers start with `070`, `071`, `072`, `073`, `075`, `076`, `077`, `078`, `079`.
  - **Auto-Strip Zero**: If typed as `070123456`, automatically sanitized to `70123456` (**8 digits**).
  - **International WhatsApp URL**: Formats to `https://wa.me/38970123456?text=<encoded_message>`.
  - **Carrier Validation**: Rejects landlines (`02`, `03X`, `04X`) and ensures exact 8-digit mobile length.
- **Benefits**:
  - **100% Free**: No SMS or third-party WhatsApp API subscription fees.
  - **Authentic Sender**: The message is sent directly from the **barber's personal or business WhatsApp number** to the client's WhatsApp.
  - **Dynamic Templates**: The system automatically generates clean, professional messages, for example:
    - *Appointment Accepted*:
      > *"Hi [Client Name]! Your appointment for **[Service Name]** with **[Barber Name]** on **[Date]** at **[Time]** has been confirmed. Payment: [Price] (Cash at shop). Looking forward to seeing you at the shop! 💈"*
    - *Appointment Rescheduled / Note*:
      > *"Hi [Client Name], regarding your appointment with [Barber Name] on [Date]..."*
- **One-Click Action**: The Barber Dashboard provides an "Accept & Notify on WhatsApp" button that updates the appointment status to `'confirmed'` in Supabase and opens WhatsApp Web/Mobile with the prefilled message.

### 4.3 Time Slot & Duration Fitting Algorithm
1. Retrieve barber's `barber_schedules` for selected date's day of week.
2. Check `barber_time_off` to ensure barber is not on leave.
3. **Continuous Window Verification**: For any proposed start time, check if the full duration `[Start_Time, Start_Time + Service_Duration]` is completely open.
   - *Example*: If a barber has a 30-minute free gap from `14:00` to `14:30` (next appointment starts at `14:30`):
     - A **30-minute Haircut** at `14:00` is **Allowed** (finishes at `14:30`).
     - A **60-minute Full Service** at `14:00` is **Blocked / Hidden** (because it needs until `15:00` and would collide with the `14:30` booking).
4. Exclude slots that intersect with `break_start` - `break_end` or run past barber shift end time.
5. Return only valid start times where the full duration fits without overlaps.

### 4.4 Barber Appointment Management
- Barbers see a dashboard calendar / list of incoming requests.
- Actions:
  - **Accept & WhatsApp**: Changes status to `'confirmed'` and launches WhatsApp with the confirmation message.
  - **Decline**: Changes status to `'declined'` (with optional WhatsApp reason).
  - **Complete**: Changes status to `'completed'` upon finishing service.
  - **Add Walk-In / Manual Booking**: Direct creation of appointment slot for walk-in cash clients.

### 4.5 Admin Control Hub
- **Role Assignment**: Switch user role from `client` to `barber` or `barber` to `client`.
- **Barber Setup**:
  - Assign specific services to each barber.
  - Set working days, start/end hours, and breaks per barber.
- **Service Catalog**: Add new haircut/grooming services, adjust pricing (cash prices), edit durations.
- **Records & Cleanup**: Admin can delete past or erroneous appointments, and delete user accounts.

---

## 5. Application Architecture & Folder Structure

```
barbershop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (public)/
│   │   ├── page.tsx                     # Landing page (Hero, Services, Barbers, Reviews)
│   │   ├── book/page.tsx                # Interactive Booking Wizard
│   │   ├── services/page.tsx            # Services catalog
│   │   └── barbers/page.tsx             # Barber team showcase
│   ├── (dashboard)/
│   │   ├── client/
│   │   │   ├── appointments/page.tsx    # Client appointment history & upcoming
│   │   │   └── profile/page.tsx         # Client profile edit
│   │   ├── barber/
│   │   │   ├── schedule/page.tsx        # Barber schedule view & incoming requests
│   │   │   └── appointments/page.tsx    # Manage/Accept/Decline bookings
│   │   └── admin/
│   │       ├── overview/page.tsx        # Analytics & metrics
│   │       ├── users/page.tsx           # Role management & user deletion
│   │       ├── barbers/page.tsx         # Working hours & service assignments
│   │       ├── services/page.tsx        # Service CRUD
│   │       └── appointments/page.tsx    # Global appointment manager & deletion
│   ├── api/
│   │   └── appointments/
│   │       └── available-slots/route.ts # API for slot calculation
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                              # Buttons, inputs, modals, calendars, badges
│   ├── booking/                         # Multi-step booking wizard components
│   ├── dashboard/                       # Reusable table, calendar, and card views
│   └── layout/                          # Navbar, Sidebar, Footer
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── server.ts                    # Server-side Supabase client (SSR)
│   │   ├── admin.ts                     # Supabase admin client (Service Role for Admin tasks)
│   │   └── middleware.ts                # Route protection & role verification
│   ├── booking-utils.ts                 # Slot generation & collision detection logic
│   └── validations.ts                   # Zod schemas for forms and actions
├── types/
│   └── database.types.ts                # Supabase generated / custom TS types
├── supabase/
│   ├── migrations/
│   │   └── 20260829000000_init_schema.sql # Complete DB schema, functions & RLS policies
│   └── seed.sql                         # Initial test data (services, admin, barbers)
├── PROJECT_SPEC.md                      # This specification file
└── package.json
```

---

## 6. Implementation Milestones

1. **Phase 1: Project Initialization & Supabase Setup**
   - Initialize Next.js project with Tailwind CSS, TypeScript, and Lucide icons.
   - Setup Supabase project config, migration SQL with tables, enums, triggers, and RLS policies.
   - Configure SSR auth middleware with role-based routing guards.

2. **Phase 2: Authentication & Role Management**
   - Auth pages (Sign up, Login, Logout, Password reset).
   - Auto profile creation trigger (defaulting to `'client'`).
   - Admin user management UI to promote/demote roles and delete users.

3. **Phase 3: Service Catalog & Barber Availability**
   - Admin CRUD for Services (Name, Price, Duration, Description).
   - Barber working hours and weekly schedule management.
   - Barber-Service association mapping.

4. **Phase 4: Dynamic Booking Engine (Guest + Client)**
   - Multi-step booking wizard UI (Service -> Barber -> Date & Time -> Details -> Confirm).
   - Conflict-free available slot calculation algorithm.
   - Guest booking with contact info vs Authenticated booking with profile link.

5. **Phase 5: Barber & Client Portals**
   - Barber dashboard: Schedule view, pending bookings queue, Accept/Decline actions.
   - Client dashboard: Upcoming/Past appointments, cancel action, review submission.
   - Notifications / status badges.

6. **Phase 6: Admin Dashboard & Cleanup Tools**
   - Global appointments manager with delete capabilities.
   - Summary statistics (Bookings, Revenue, Active Barbers).
   - Deployment setup and verification on Vercel.
