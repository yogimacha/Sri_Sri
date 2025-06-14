/*
  # Create missing database tables and relationships

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, required)
      - `duration` (integer, required, > 0)
      - `price` (numeric, required, >= 0)
      - `category` (text, required)
      - `image_url` (text, optional)
      - `artist_id` (uuid, foreign key to profiles)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to profiles)
      - `service_id` (uuid, foreign key to services)
      - `artist_id` (uuid, foreign key to profiles)
      - `appointment_date` (date, required)
      - `start_time` (time, required)
      - `end_time` (time, required)
      - `status` (text, default 'pending', check constraint)
      - `payment_status` (text, default 'pending', check constraint)
      - `total_amount` (numeric, required, >= 0)
      - `notes` (text, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `availability`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to profiles)
      - `day_of_week` (integer, 0-6)
      - `start_time` (time, required)
      - `end_time` (time, required)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all new tables
    - Add policies for proper access control
    - Services: viewable by all, manageable by artist owners
    - Bookings: viewable by participants, creatable by clients, updatable by participants
    - Availability: viewable by all, manageable by artist owners

  3. Performance
    - Add indexes on foreign keys and frequently queried columns
    - Add triggers for automatic updated_at timestamps
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  image_url text,
  artist_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  service_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints using DO blocks to check existence
DO $$
BEGIN
  -- Add services foreign key constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'services_artist_id_fkey' 
    AND table_name = 'services'
  ) THEN
    ALTER TABLE services 
    ADD CONSTRAINT services_artist_id_fkey 
    FOREIGN KEY (artist_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add bookings foreign key constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_client_id_fkey' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_service_id_fkey' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_service_id_fkey 
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_artist_id_fkey' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_artist_id_fkey 
    FOREIGN KEY (artist_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add availability foreign key constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'availability_artist_id_fkey' 
    AND table_name = 'availability'
  ) THEN
    ALTER TABLE availability 
    ADD CONSTRAINT availability_artist_id_fkey 
    FOREIGN KEY (artist_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS services_artist_id_idx ON services(artist_id);
CREATE INDEX IF NOT EXISTS services_category_idx ON services(category);
CREATE INDEX IF NOT EXISTS services_is_active_idx ON services(is_active);

CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_artist_id_idx ON bookings(artist_id);
CREATE INDEX IF NOT EXISTS bookings_service_id_idx ON bookings(service_id);
CREATE INDEX IF NOT EXISTS bookings_appointment_date_idx ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

CREATE INDEX IF NOT EXISTS availability_artist_id_idx ON availability(artist_id);
CREATE INDEX IF NOT EXISTS availability_day_of_week_idx ON availability(day_of_week);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Artists can insert their own services"
  ON services
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own services"
  ON services
  FOR UPDATE
  TO public
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own services"
  ON services
  FOR DELETE
  TO public
  USING (auth.uid() = artist_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Clients can create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Artists and clients can update their bookings"
  ON bookings
  FOR UPDATE
  TO public
  USING (auth.uid() = client_id OR auth.uid() = artist_id);

-- Availability policies
CREATE POLICY "Availability is viewable by everyone"
  ON availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Artists can manage their own availability"
  ON availability
  FOR ALL
  TO public
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_services_updated'
  ) THEN
    CREATE TRIGGER on_services_updated
      BEFORE UPDATE ON services
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_bookings_updated'
  ) THEN
    CREATE TRIGGER on_bookings_updated
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_availability_updated'
  ) THEN
    CREATE TRIGGER on_availability_updated
      BEFORE UPDATE ON availability
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;