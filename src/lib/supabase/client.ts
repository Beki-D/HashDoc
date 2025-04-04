import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ppbgaxleynbkoxreghfi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYmdheGxleW5ia294cmVnaGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTY0MDYsImV4cCI6MjA1OTE3MjQwNn0.dAKGP2WZYr8ABJOS-AjwxblkgbvifzImJW7-G67F80U"
);
