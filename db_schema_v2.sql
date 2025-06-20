-- ENUM types first
CREATE TYPE event_status AS ENUM ('draft', 'scheduled', 'completed', 'live', 'cancelled');
CREATE TYPE event_venue_type AS ENUM ('online', 'offline', 'hybrid');

-- Base tables
CREATE TABLE organisers (
  id SERIAL PRIMARY KEY,
  organiser_name VARCHAR(255) NOT NULL,
  organiser_id VARCHAR(255) UNIQUE NOT NULL,
  email_id VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(255) NOT NULL,
  verification_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events (depends on organisers, locations, languages)
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  organiser_id INTEGER REFERENCES organisers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTERVAL,
  status event_status DEFAULT 'draft',
  is_free BOOLEAN NOT NULL,
  venue_type event_venue_type NOT NULL,
  thumbnails JSONB,
  max_per_user INTEGER DEFAULT 1,
  location_id INTEGER REFERENCES locations(id),
  language_id INTEGER REFERENCES languages(id)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Join table
CREATE TABLE event_genres (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, genre_id)
);

-- Ticket pricing (depends on events)
CREATE TABLE ticket_pricing (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  tier VARCHAR(100),
  tier_description VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  total_capacity INTEGER NOT NULL,
  available_quantity INTEGER DEFAULT 0,
  booked_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  UNIQUE(event_id, label)
);
