
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ouybwkjapejgpuuujwgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eWJ3a2phcGVqZ3B1dXVqd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjQzMDYsImV4cCI6MjA3ODcwMDMwNn0.3JLJqAlW0oUCk3uprCz8j3dSSm95RG0dabXEKJbRPVo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
