-- Enable Row Level Security on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_issues ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Users can view their own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id);

-- POS connections policies
CREATE POLICY "Users can view their own POS connections"
  ON pos_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own POS connections"
  ON pos_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own POS connections"
  ON pos_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own POS connections"
  ON pos_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Inventory items policies
CREATE POLICY "Users can view their own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- Sales data policies
CREATE POLICY "Users can view their own sales data"
  ON sales_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales data"
  ON sales_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales data"
  ON sales_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales data"
  ON sales_data FOR DELETE
  USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can view their own suppliers"
  ON suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- Forecasts policies
CREATE POLICY "Users can view their own forecasts"
  ON forecasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forecasts"
  ON forecasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forecasts"
  ON forecasts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forecasts"
  ON forecasts FOR DELETE
  USING (auth.uid() = user_id);

-- Cleanup issues policies
CREATE POLICY "Users can view their own cleanup issues"
  ON cleanup_issues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cleanup issues"
  ON cleanup_issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cleanup issues"
  ON cleanup_issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cleanup issues"
  ON cleanup_issues FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(user_id, sku);
CREATE INDEX idx_sales_data_user_id ON sales_data(user_id);
CREATE INDEX idx_sales_data_sku_date ON sales_data(user_id, sku, sale_date);
CREATE INDEX idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX idx_forecasts_sku_date ON forecasts(user_id, sku, forecast_date);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_cleanup_issues_user_id ON cleanup_issues(user_id);
CREATE INDEX idx_cleanup_issues_resolved ON cleanup_issues(user_id, resolved);
