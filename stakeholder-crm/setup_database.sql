-- Enable Row Level Security on all tables
ALTER TABLE public.individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for individuals table
CREATE POLICY "Allow authenticated users to select individuals"
ON public.individuals
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert individuals"
ON public.individuals
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update individuals"
ON public.individuals
FOR UPDATE
TO authenticated
USING (true);

-- Create policies for companies table
CREATE POLICY "Allow authenticated users to select companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true);

-- Create policies for profiles table
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create policies for conversations table
CREATE POLICY "Allow authenticated users to select conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (true); 