-- Create keyspace
CREATE KEYSPACE IF NOT EXISTS indiaseller4
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- Use keyspace
USE indiaseller4;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    service_id uuid PRIMARY KEY,
    service_name text,
    description text,
    status text,
    created_at timestamp,
    updated_at timestamp
);

-- Create index on service name for uniqueness checks
CREATE INDEX IF NOT EXISTS services_name_idx ON services (service_name);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id uuid PRIMARY KEY,
    name text,
    slug text,
    description text,
    status text,
    created_at timestamp,
    updated_at timestamp
);

-- Create index on category slug for uniqueness checks
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY,
  email text,
  password text,
  role text,
  created_at timestamp,
  updated_at timestamp
);

-- Create index on email for login queries
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email);

-- Seller Types
CREATE TABLE IF NOT EXISTS seller_types (
    seller_id uuid,
    is_product_seller boolean,
    is_service_seller boolean,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (seller_id)
);

-- Seller Personal Details
CREATE TABLE IF NOT EXISTS sellers (
    seller_id uuid,
    name text,
    email text,
    phone text,
    profile_picture_url text,
    password_hash text,
    status boolean DEFAULT false,
    kyc_status boolean DEFAULT false,
    top_scorer decimal,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (seller_id)
);

-- Seller Business Details
CREATE TABLE IF NOT EXISTS seller_business_details (
    seller_id uuid,
    company_name text,
    gstin text,
    pan text,
    bank_name text,
    account_number text,
    ifsc_code text,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (seller_id)
);

-- Seller Product Categories (for product-based sellers)
CREATE TABLE IF NOT EXISTS seller_categories (
    seller_id uuid,
    category_id uuid,
    created_at timestamp,
    PRIMARY KEY (seller_id, category_id)
);

-- Seller Product Tags
CREATE TABLE IF NOT EXISTS seller_product_tags (
    seller_id uuid,
    tag text,
    created_at timestamp,
    PRIMARY KEY (seller_id, tag)
);

-- Seller Service Details
CREATE TABLE IF NOT EXISTS seller_service_details (
    seller_id uuid,
    service_id uuid,
    profession text,
    description text,
    years_experience int,
    available_days set<text>,
    timing_start text,
    timing_end text,
    pricing_type text,
    pricing_value decimal,
    pricing_unit text,
    is_onsite boolean,
    is_remote boolean,
    operating_radius int,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (seller_id, service_id)
);

-- Seller Service Certifications
CREATE TABLE IF NOT EXISTS seller_certifications (
    seller_id uuid,
    service_id uuid,
    document_url text,
    document_type text,
    created_at timestamp,
    PRIMARY KEY (seller_id, service_id, document_url)
);

-- Seller Business Documents
CREATE TABLE IF NOT EXISTS seller_documents (
    seller_id uuid,
    document_type text,
    document_url text,
    created_at timestamp,
    PRIMARY KEY (seller_id, document_type, document_url)
);

-- Seller Addresses
CREATE TABLE IF NOT EXISTS seller_addresses (
    seller_id uuid,
    address_id uuid,
    address_type text,
    line1 text,
    line2 text,
    city text,
    state text,
    postal_code text,
    country text,
    location_image_url text,
    is_default boolean,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (seller_id, address_id)
);

-- Seller Gallery Images
CREATE TABLE IF NOT EXISTS seller_gallery (
    seller_id uuid,
    image_id uuid,
    image_url text,
    caption text,
    created_at timestamp,
    PRIMARY KEY (seller_id, image_id)
);

-- Create indices for efficient querying
CREATE INDEX IF NOT EXISTS idx_seller_email ON sellers (email);
CREATE INDEX IF NOT EXISTS idx_seller_phone ON sellers (phone);
CREATE INDEX IF NOT EXISTS idx_seller_company ON seller_business_details (company_name);
CREATE INDEX IF NOT EXISTS idx_seller_gstin ON seller_business_details (gstin);
CREATE INDEX IF NOT EXISTS idx_seller_pan ON seller_business_details (pan);
CREATE INDEX IF NOT EXISTS idx_seller_status ON sellers (status);
CREATE INDEX IF NOT EXISTS idx_seller_kyc_status ON sellers (kyc_status); 