-- Enable Row Level Security on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
DROP POLICY IF EXISTS "Allow authenticated users to select companies" ON public.companies;
CREATE POLICY "Allow authenticated users to select companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON public.companies;
CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update companies" ON public.companies;
CREATE POLICY "Allow authenticated users to update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true); 