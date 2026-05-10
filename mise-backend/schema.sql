-- MISE database schema
-- Apply as: psql -U mise -h localhost -p 5432 -d mise_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE session_status AS ENUM ('active', 'awaiting_payment', 'closed', 'abandoned');
CREATE TYPE order_status AS ENUM ('placed', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE order_item_status AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE prep_station AS ENUM ('kitchen', 'bar');

-- restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vkn VARCHAR(10) NOT NULL UNIQUE,
  tax_office TEXT NOT NULL,
  address TEXT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
  locale VARCHAR(10) NOT NULL DEFAULT 'tr-TR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tables
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  label TEXT NOT NULL,
  qr_token TEXT NOT NULL UNIQUE,
  april_tag_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_qr_token ON tables(qr_token);

-- table_sessions
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id),
  session_token TEXT NOT NULL UNIQUE,
  status session_status NOT NULL DEFAULT 'active',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opened_by_user_id UUID
);
CREATE UNIQUE INDEX idx_session_token ON table_sessions(session_token);

-- menu_categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- menu_items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  category_id UUID NOT NULL REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  kdz_rate NUMERIC(4,2) NOT NULL DEFAULT 0.10,
  otv_rate NUMERIC(4,2) NOT NULL DEFAULT 0,
  prep_station prep_station NOT NULL DEFAULT 'kitchen',
  is_alcohol BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- modifier_groups
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_select INT NOT NULL DEFAULT 0,
  max_select INT NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

-- modifiers
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

-- orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES table_sessions(id),
  sequence_no INT NOT NULL DEFAULT 1,
  status order_status NOT NULL DEFAULT 'placed',
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_note TEXT
);
CREATE INDEX idx_session_placed ON orders(session_id);

-- order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unit_price_snapshot NUMERIC(10,2) NOT NULL,
  kdz_rate_snapshot NUMERIC(4,2) NOT NULL,
  otv_rate_snapshot NUMERIC(4,2) NOT NULL DEFAULT 0,
  name_snapshot TEXT NOT NULL,
  prep_station prep_station NOT NULL DEFAULT 'kitchen',
  status order_item_status NOT NULL DEFAULT 'pending',
  item_note TEXT
);
CREATE INDEX idx_prep_station_status ON order_items(prep_station, status);

-- order_item_modifiers
CREATE TABLE order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id),
  name_snapshot TEXT NOT NULL,
  price_delta_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- order_events
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  event_type TEXT NOT NULL,
  actor_user_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB
);
CREATE INDEX idx_order_occurred ON order_events(order_id, occurred_at);

-- Grant all to mise user
GRANT ALL ON ALL TABLES IN SCHEMA public TO mise;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO mise;
