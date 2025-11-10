-- Seed data for Smart Inventory Forecasting MVP
-- This file contains sample data for testing and development

-- Note: This seed data uses placeholder UUIDs
-- In a real environment, these would be actual user IDs from auth.users

-- Sample user ID (replace with actual user ID in development)
-- You can get this from your Supabase auth dashboard
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample store
INSERT INTO stores (id, user_id, name, address, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Electronics Store',
  '123 Main St, Demo City, DC 12345',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample suppliers
INSERT INTO suppliers (id, user_id, name, contact_email, contact_phone, address, lead_time_days, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'TechCorp Wholesale',
  'orders@techcorp.com',
  '+1-555-0123',
  '456 Industrial Blvd, Tech City, TC 67890',
  7,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  'Global Electronics Supply',
  'purchasing@globalsupply.com',
  '+1-555-0456',
  '789 Commerce Ave, Supply Town, ST 13579',
  14,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'Local Parts Distributor',
  'sales@localparts.com',
  '+1-555-0789',
  '321 Distribution Way, Local City, LC 24680',
  3,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample inventory items
INSERT INTO inventory_items (id, user_id, sku, name, current_stock, supplier_id, lead_time_days, unit_cost, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  'PHONE-001',
  'Smartphone Model X',
  25,
  '550e8400-e29b-41d4-a716-446655440002',
  7,
  299.99,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  'LAPTOP-001',
  'Business Laptop Pro',
  8,
  '550e8400-e29b-41d4-a716-446655440002',
  7,
  899.99,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440000',
  'TABLET-001',
  'Tablet Device Plus',
  15,
  '550e8400-e29b-41d4-a716-446655440003',
  14,
  399.99,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  'HEADPHONES-001',
  'Wireless Headphones Premium',
  3,
  '550e8400-e29b-41d4-a716-446655440004',
  3,
  149.99,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440000',
  'CHARGER-001',
  'Universal Phone Charger',
  0,
  '550e8400-e29b-41d4-a716-446655440004',
  3,
  19.99,
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-44665544000A',
  '550e8400-e29b-41d4-a716-446655440000',
  'CASE-001',
  'Protective Phone Case',
  45,
  '550e8400-e29b-41d4-a716-446655440004',
  3,
  24.99,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample sales data (last 60 days)
INSERT INTO sales_data (id, user_id, sku, item_name, quantity_sold, sale_date, unit_price, created_at) VALUES
-- Recent sales (last 7 days)
('550e8400-e29b-41d4-a716-44665544000B', '550e8400-e29b-41d4-a716-446655440000', 'PHONE-001', 'Smartphone Model X', 2, CURRENT_DATE - INTERVAL '1 day', 399.99, NOW()),
('550e8400-e29b-41d4-a716-44665544000C', '550e8400-e29b-41d4-a716-446655440000', 'CASE-001', 'Protective Phone Case', 3, CURRENT_DATE - INTERVAL '1 day', 29.99, NOW()),
('550e8400-e29b-41d4-a716-44665544000D', '550e8400-e29b-41d4-a716-446655440000', 'HEADPHONES-001', 'Wireless Headphones Premium', 1, CURRENT_DATE - INTERVAL '2 days', 179.99, NOW()),
('550e8400-e29b-41d4-a716-44665544000E', '550e8400-e29b-41d4-a716-446655440000', 'LAPTOP-001', 'Business Laptop Pro', 1, CURRENT_DATE - INTERVAL '3 days', 1099.99, NOW()),
('550e8400-e29b-41d4-a716-44665544000F', '550e8400-e29b-41d4-a716-446655440000', 'TABLET-001', 'Tablet Device Plus', 2, CURRENT_DATE - INTERVAL '4 days', 449.99, NOW()),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'CHARGER-001', 'Universal Phone Charger', 4, CURRENT_DATE - INTERVAL '5 days', 24.99, NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'PHONE-001', 'Smartphone Model X', 1, CURRENT_DATE - INTERVAL '6 days', 399.99, NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'CASE-001', 'Protective Phone Case', 2, CURRENT_DATE - INTERVAL '7 days', 29.99, NOW()),

-- Older sales (8-30 days ago)
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'PHONE-001', 'Smartphone Model X', 3, CURRENT_DATE - INTERVAL '10 days', 399.99, NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'LAPTOP-001', 'Business Laptop Pro', 2, CURRENT_DATE - INTERVAL '12 days', 1099.99, NOW()),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', 'TABLET-001', 'Tablet Device Plus', 1, CURRENT_DATE - INTERVAL '15 days', 449.99, NOW()),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', 'HEADPHONES-001', 'Wireless Headphones Premium', 2, CURRENT_DATE - INTERVAL '18 days', 179.99, NOW()),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', 'CHARGER-001', 'Universal Phone Charger', 6, CURRENT_DATE - INTERVAL '20 days', 24.99, NOW()),
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440000', 'CASE-001', 'Protective Phone Case', 4, CURRENT_DATE - INTERVAL '22 days', 29.99, NOW()),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440000', 'PHONE-001', 'Smartphone Model X', 2, CURRENT_DATE - INTERVAL '25 days', 399.99, NOW()),
('550e8400-e29b-41d4-a716-44665544001A', '550e8400-e29b-41d4-a716-446655440000', 'LAPTOP-001', 'Business Laptop Pro', 1, CURRENT_DATE - INTERVAL '28 days', 1099.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample forecasts
INSERT INTO forecasts (id, user_id, sku, forecast_date, forecast_quantity, confidence_score, model_used, trend, seasonality_detected, recommended_order, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001B', '550e8400-e29b-41d4-a716-446655440000', 'PHONE-001', CURRENT_DATE + INTERVAL '7 days', 3, 0.85, 'linear_regression', 'stable', false, 15, NOW()),
('550e8400-e29b-41d4-a716-44665544001C', '550e8400-e29b-41d4-a716-446655440000', 'LAPTOP-001', CURRENT_DATE + INTERVAL '7 days', 2, 0.78, 'linear_regression', 'increasing', false, 10, NOW()),
('550e8400-e29b-41d4-a716-44665544001D', '550e8400-e29b-41d4-a716-446655440000', 'TABLET-001', CURRENT_DATE + INTERVAL '7 days', 1, 0.72, 'linear_regression', 'decreasing', false, 5, NOW()),
('550e8400-e29b-41d4-a716-44665544001E', '550e8400-e29b-41d4-a716-446655440000', 'HEADPHONES-001', CURRENT_DATE + INTERVAL '7 days', 2, 0.80, 'linear_regression', 'stable', false, 20, NOW()),
('550e8400-e29b-41d4-a716-44665544001F', '550e8400-e29b-41d4-a716-446655440000', 'CHARGER-001', CURRENT_DATE + INTERVAL '7 days', 5, 0.90, 'linear_regression', 'increasing', false, 50, NOW()),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'CASE-001', CURRENT_DATE + INTERVAL '7 days', 4, 0.88, 'linear_regression', 'stable', false, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample cleanup issues
INSERT INTO cleanup_issues (id, user_id, issue_type, severity, affected_items, suggested_action, resolved, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'no_sales_history', 'medium', '["CHARGER-001"]', 'Item has no sales history. Consider adding manual sales data or removing if discontinued.', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'missing_supplier', 'high', '["PHONE-001"]', 'Item missing supplier information. Please assign a supplier for accurate lead time calculations.', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample purchase order
INSERT INTO purchase_orders (id, user_id, supplier_id, po_number, total_amount, status, generated_at, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'PO-2024-0001', 3499.75, 'draft', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample purchase order items
INSERT INTO purchase_order_items (id, purchase_order_id, sku, item_name, quantity, unit_cost, line_total, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440023', 'HEADPHONES-001', 'Wireless Headphones Premium', 20, 149.99, 2999.80, NOW()),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440023', 'CHARGER-001', 'Universal Phone Charger', 25, 19.99, 499.75, NOW())
ON CONFLICT (id) DO NOTHING;