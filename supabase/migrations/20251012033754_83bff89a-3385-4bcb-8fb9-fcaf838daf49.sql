-- Add INSERT policy to payments table to restrict payment record creation to admins only
CREATE POLICY "Only admins can create payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add UPDATE policy to allow admins to update payment status
CREATE POLICY "Only admins can update payments"
ON payments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add DELETE policy for admins to manage payments
CREATE POLICY "Only admins can delete payments"
ON payments FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));