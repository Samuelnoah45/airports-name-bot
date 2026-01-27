-- Enable RLS on airports table (if not already enabled)
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read from the airports table
CREATE POLICY "Allow public read access" 
ON airports 
FOR SELECT 
TO public
USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'airports';
