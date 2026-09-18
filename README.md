1. Crie um projeto no Supabase (ou use o projeto já conectado).
2. Execute `supabase/schema.sql` uma vez no SQL Editor.
3. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com a URL e a chave anon do Supabase.
4. Rode `npm install` e `npm run dev`. Valide com `npm run lint` e `npm run build`.
5. Publique na Vercel como Next.js e configure as mesmas variáveis. Em Supabase → Authentication → URL Configuration, cadastre a URL do app como Site URL e permita `https://SEU-DOMINIO/auth/confirm` e `http://localhost:3000/auth/confirm` em Redirect URLs. Após confirmar o email, entre com sua senha.
