-- Core content: blog posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_type VARCHAR(50) NOT NULL DEFAULT 'human',
    author_name VARCHAR(255) NOT NULL,
    author_meta JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    tags TEXT[] NOT NULL DEFAULT '{}',
    reading_time_minutes INTEGER,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keyboard switches
CREATE TABLE switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    actuation_force_gf NUMERIC(5,1),
    bottom_out_force_gf NUMERIC(5,1),
    pre_travel_mm NUMERIC(4,2),
    total_travel_mm NUMERIC(4,2),
    force_curve JSONB,
    sound_profile VARCHAR(100),
    sound_sample_url VARCHAR(500),
    spring_type VARCHAR(100),
    stem_material VARCHAR(100),
    housing_material VARCHAR(100),
    price_usd NUMERIC(8,2),
    image_url VARCHAR(500),
    source_url VARCHAR(500),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site configuration and profile data
CREATE TABLE site_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin user(s)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Encounter documents (from encounter-kit, stored for blog integration)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL,
    front_matter JSONB,
    session_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_switches_type ON switches(type);
CREATE INDEX idx_switches_manufacturer ON switches(manufacturer);
CREATE INDEX idx_switches_tags ON switches USING GIN(tags);
CREATE INDEX idx_encounters_tags ON encounters USING GIN(tags);
CREATE INDEX idx_encounters_platform ON encounters(platform);
