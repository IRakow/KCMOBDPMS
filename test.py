from supabase import create_client

url = "https://ypenycislvwzzwvydppk.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZW55Y2lzbHZ3enp3dnlkcHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTA5MzQsImV4cCI6MjA2ODE2NjkzNH0.ZR4rIacGX-TuMVMIWAKNTXBLWCJB1bjLqS2bp22ILNU"

supabase = create_client(url, key)
print("✅ Supabase connected!")
