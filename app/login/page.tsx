import Login from "@/components/login";
export default function LoginPage() {
  return (
    <Login
      configured={Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )}
    />
  );
}
