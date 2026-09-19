"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils";
import Dashboard from "./dashboard";
let opening: Promise<string> | null = null;
function openWorkspace() {
  if (!opening) opening = (async () => {
    const client = createClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data.session) {
      const result = await client.auth.getUser();
      if (result.error) throw result.error;
      return result.data.user.id;
    }
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
    return result.data.user!.id;
  })().finally(() => { opening = null; });
  return opening;
}
export default function AutomaticAccess() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    openWorkspace().then(id => { if (active) setUserId(id); }).catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, []);
  if (userId) return <Dashboard userId={userId} />;
  return <main className="loading-screen"><h1>{error ? "Não foi possível abrir" : "Abrindo seus registros…"}</h1>{error ? <><p role="alert">{error}</p><button className="primary" onClick={() => location.reload()}>Tentar novamente</button></> : <span className="spinner" role="status" aria-label="Carregando" />}</main>;
}
