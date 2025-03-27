-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT NOT NULL,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_individuals junction table
CREATE TABLE IF NOT EXISTS public.conversation_individuals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    individual_id UUID NOT NULL REFERENCES public.individuals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, individual_id)
);

-- Enable Row Level Security on conversations tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_individuals ENABLE ROW LEVEL SECURITY;

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

-- Create policies for conversation_individuals table
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