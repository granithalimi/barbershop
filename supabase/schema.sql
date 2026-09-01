-- ==============================================================================
-- BARBERSHOP WEB APPLICATION - COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to "SQL Editor" in the left sidebar
-- 3. Create a "New query", paste this entire script, and click "Run"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'barber', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- 3.1 Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Services Catalog Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Barber Services (Junction Table: Barbers <-> Services)
CREATE TABLE IF NOT EXISTS public.barber_services (
    barber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (barber_id, service_id)
);

-- 3.4 Barber Weekly Working Schedules
CREATE TABLE IF NOT EXISTS public.barber_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday... 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (barber_id, day_of_week)
);

-- 3.5 Barber Time Off / Vacation / Leave
CREATE TABLE IF NOT EXISTS public.barber_time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 3.6 Appointments Table (Supports Guest & Authenticated Bookings)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL DEFAULT 'cash',
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_client_or_guest CHECK (
        (client_id IS NOT NULL) OR (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
    )
);

-- 3.7 Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SECURITY & HELPER FUNCTIONS

-- Function to check if the executing user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Function to check if the executing user is a barber
CREATE OR REPLACE FUNCTION public.is_barber()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'barber'
    );
$$;

-- Automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to automatically create a profile record when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_phone TEXT;
    user_name TEXT;
BEGIN
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client');

    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        user_phone,
        'client'::user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = CASE WHEN public.profiles.phone = '' THEN EXCLUDED.phone ELSE public.profiles.phone END;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        -- Non-admins cannot alter their own role
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- 5.2 SERVICES POLICIES
DROP POLICY IF EXISTS "Services viewable by everyone" ON public.services;
CREATE POLICY "Services viewable by everyone"
    ON public.services FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
    ON public.services FOR ALL
    USING (public.is_admin());

-- 5.3 BARBER SERVICES POLICIES
DROP POLICY IF EXISTS "Barber services viewable by everyone" ON public.barber_services;
CREATE POLICY "Barber services viewable by everyone"
    ON public.barber_services FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage barber services" ON public.barber_services;
CREATE POLICY "Admins can manage barber services"
    ON public.barber_services FOR ALL
    USING (public.is_admin());

-- 5.4 BARBER SCHEDULES POLICIES
DROP POLICY IF EXISTS "Barber schedules viewable by everyone" ON public.barber_schedules;
CREATE POLICY "Barber schedules viewable by everyone"
    ON public.barber_schedules FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage schedules" ON public.barber_schedules;
CREATE POLICY "Admins can manage schedules"
    ON public.barber_schedules FOR ALL
    USING (public.is_admin());

-- 5.5 BARBER TIME OFF POLICIES
DROP POLICY IF EXISTS "Barber time off viewable by everyone" ON public.barber_time_off;
CREATE POLICY "Barber time off viewable by everyone"
    ON public.barber_time_off FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins and barbers can manage time off" ON public.barber_time_off;
CREATE POLICY "Admins and barbers can manage time off"
    ON public.barber_time_off FOR ALL
    USING (public.is_admin() OR auth.uid() = barber_id);

-- 5.6 APPOINTMENTS POLICIES
DROP POLICY IF EXISTS "View appointments" ON public.appointments;
CREATE POLICY "View appointments"
    ON public.appointments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Anyone can insert appointments (Guest & Client)" ON public.appointments;
CREATE POLICY "Anyone can insert appointments (Guest & Client)"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Update appointments" ON public.appointments;
CREATE POLICY "Update appointments"
    ON public.appointments FOR UPDATE
    USING (
        public.is_admin()
        OR auth.uid() = barber_id
        OR (auth.uid() IS NOT NULL AND auth.uid() = client_id)
    );

DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
CREATE POLICY "Admins can delete appointments"
    ON public.appointments FOR DELETE
    USING (public.is_admin());

-- 5.7 REVIEWS POLICIES
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Clients can insert review for their completed appointment" ON public.reviews;
CREATE POLICY "Clients can insert review for their completed appointment"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = client_id
        AND EXISTS (
            SELECT 1 FROM public.appointments
            WHERE id = appointment_id 
              AND client_id = auth.uid()
              AND status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews"
    ON public.reviews FOR DELETE
    USING (public.is_admin());


-- 6. SEED DATA (INITIAL SERVICES CATALOG)
INSERT INTO public.services (name, description, duration_minutes, price)
VALUES
    ('Classic Haircut', 'Precision scissor and clipper cut, neckline cleanup, hot towel finish, and styling.', 30, 25.00),
    ('Beard Trim & Lineup', 'Detailed beard shaping, electric trim, razor line edging, and beard oil application.', 20, 15.00),
    ('Haircut & Beard Combo', 'Complete package: Custom haircut, styling, full beard trim, hot towel, and razor finish.', 45, 35.00),
    ('Royal Hot Towel Shave', 'Traditional straight razor shave with warm lather, hot towels, and soothing balm.', 30, 20.00),
    ('Kids / Senior Haircut', 'Gentle and stylish haircut for kids under 12 or seniors 65+.', 25, 20.00)
ON CONFLICT DO NOTHING;
