-- Drop existing policies for conversation_individuals table
DROP POLICY IF EXISTS "Allow authenticated users to select conversation_individuals" ON public.conversation_individuals;
DROP POLICY IF EXISTS "Allow authenticated users to insert conversation_individuals" ON public.conversation_individuals;
DROP POLICY IF EXISTS "Allow authenticated users to update conversation_individuals" ON public.conversation_individuals;
DROP POLICY IF EXISTS "Allow authenticated users to delete conversation_individuals" ON public.conversation_individuals;

-- Create new policies with proper permissions
CREATE POLICY "Allow authenticated users to select conversation_individuals"
ON public.conversation_individuals
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert conversation_individuals"
ON public.conversation_individuals
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conversation_individuals"
ON public.conversation_individuals
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete conversation_individuals"
ON public.conversation_individuals
FOR DELETE
TO authenticated
USING (true); 