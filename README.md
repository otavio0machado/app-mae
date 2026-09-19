1. Crie um projeto no Supabase (ou use o projeto já conectado).
2. Execute `supabase/schema.sql` uma vez e habilite Authentication → Sign In / Providers → Allow anonymous sign-ins.
3. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com a URL e a chave anon do Supabase.
4. Rode `npm install` e `npm run dev`. Valide com `npm run lint` e `npm run build`.
5. Publique na Vercel como Next.js com as mesmas variáveis. O acesso é automático e vinculado à sessão deste navegador; não limpe os dados do navegador para conservar o acesso.
