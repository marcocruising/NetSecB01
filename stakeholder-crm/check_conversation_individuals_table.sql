-- Check if the conversation_individuals table exists and has the correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'conversation_individuals';

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND tablename = 'conversation_individuals'; 