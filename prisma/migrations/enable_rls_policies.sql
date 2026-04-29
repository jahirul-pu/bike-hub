-- ============================================================
-- Enable Row Level Security (RLS) on all public tables
-- and create appropriate access policies.
--
-- Context:
--   • Prisma connects as `postgres` (superuser) → bypasses RLS
--   • These policies secure direct PostgREST / Supabase client access
--   • Resolves the "RLS Disabled in Public" warnings
-- ============================================================

-- ─── 1. BRAND ─────────────────────────────────────────────────
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;

-- Anyone can read brands (public catalog data)
CREATE POLICY "brands_public_read"
  ON "Brand" FOR SELECT
  USING (true);

-- Authenticated users can manage brands (admin panel)
CREATE POLICY "brands_authenticated_write"
  ON "Brand" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "brands_service_role"
  ON "Brand" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─── 2. VEHICLE ───────────────────────────────────────────────
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;

-- Anyone can read vehicles (marketplace listings)
CREATE POLICY "vehicles_public_read"
  ON "Vehicle" FOR SELECT
  USING (true);

-- Authenticated users can manage vehicles (admin panel)
CREATE POLICY "vehicles_authenticated_write"
  ON "Vehicle" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "vehicles_service_role"
  ON "Vehicle" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─── 3. INSPECTION ────────────────────────────────────────────
ALTER TABLE "Inspection" ENABLE ROW LEVEL SECURITY;

-- Anyone can read inspections (displayed on product cards)
CREATE POLICY "inspections_public_read"
  ON "Inspection" FOR SELECT
  USING (true);

-- Authenticated users can manage inspections (admin workflow)
CREATE POLICY "inspections_authenticated_write"
  ON "Inspection" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "inspections_service_role"
  ON "Inspection" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─── 4. COMPARISON SCORE ──────────────────────────────────────
ALTER TABLE "ComparisonScore" ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached comparison results
CREATE POLICY "comparisons_public_read"
  ON "ComparisonScore" FOR SELECT
  USING (true);

-- Authenticated users can manage comparison cache
CREATE POLICY "comparisons_authenticated_write"
  ON "ComparisonScore" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "comparisons_service_role"
  ON "ComparisonScore" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─── 5. PART ──────────────────────────────────────────────────
ALTER TABLE "Part" ENABLE ROW LEVEL SECURITY;

-- Anyone can read parts (spare parts marketplace)
CREATE POLICY "parts_public_read"
  ON "Part" FOR SELECT
  USING (true);

-- Authenticated users can manage parts (admin inventory)
CREATE POLICY "parts_authenticated_write"
  ON "Part" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "parts_service_role"
  ON "Part" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
