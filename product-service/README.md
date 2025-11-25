-- Create products table
CREATE TABLE IF NOT EXISTS products (
id SERIAL PRIMARY KEY,
created_by Int NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT,
price DECIMAL(10,2) NOT NULL CHECK (price > 0),
stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
category VARCHAR(100),
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for better performance
    CONSTRAINT unique_product_name UNIQUE (name)

);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));
