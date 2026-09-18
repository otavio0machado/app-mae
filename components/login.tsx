"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/utils";
import Icon from "./icon";
export default function Login({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState(false);
  const lock = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    };
    try {
      const supabase = createClient();
      const { data, error } = signup
        ? await supabase.auth.signUp({
            ...credentials,
            options: { emailRedirectTo: `${location.origin}/auth/confirm` },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }
      setFailure(false);
      setMessage(
        "Confira seu email para confirmar o cadastro. Depois, entre com sua senha.",
      );
    } catch (e) {
      setFailure(true);
      setMessage(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="login-layout">
      <section className="login-story">
        <Link className="brand" href="/">
          {" "}
          <span className="brand-mark">
            <Icon name="clock" size={25} />
          </span>
          hora clara<span className="brand-dot">.</span>
        </Link>
        <div>
          <span className="eyebrow">MENOS PLANILHAS. MAIS CLAREZA.</span>
          <h1>
            Cada hora conta.
            <br />
            Deixe tudo
            <br />
            <em>bem registrado.</em>
          </h1>
          <p>
            Organize suas atividades e transforme seu mês
            <br className="desktop-only" /> em um relatório pronto para assinar.
          </p>
          <div className="story-steps">
            <span>01 · Registre</span>
            <span>02 · Confira</span>
            <span>03 · Imprima</span>
          </div>
        </div>
        <small>Seu tempo, organizado.</small>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <span className="eyebrow">SEU ESPAÇO DE TRABALHO</span>
          <h2>{signup ? "Comece por aqui" : "Bem-vindo de volta"}</h2>
          <p>
            {signup
              ? "Crie sua conta para organizar suas horas."
              : "Entre para acompanhar seus registros."}
          </p>
          <div className="segmented">
            <button
              type="button"
              aria-pressed={!signup}
              className={!signup ? "selected" : ""}
              onClick={() => {
                setSignup(false);
                setMessage("");
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              aria-pressed={signup}
              className={signup ? "selected" : ""}
              onClick={() => {
                setSignup(true);
                setMessage("");
              }}
            >
              Criar conta
            </button>
          </div>
          {!configured && (
            <div className="notice error">
              Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
              no arquivo .env.local.
            </div>
          )}
          {message && (
            <div
              role={failure ? "alert" : "status"}
              className={`notice ${failure ? "error" : "success"}`}
            >
              {message}
            </div>
          )}
          <form onSubmit={submit}>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
                maxLength={254}
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                minLength={signup ? 8 : 1}
                maxLength={128}
                placeholder={signup ? "Pelo menos 8 caracteres" : "Sua senha"}
                required
              />
            </label>
            <button className="primary" disabled={busy || !configured}>
              {busy
                ? "Aguarde…"
                : signup
                  ? "Criar minha conta"
                  : "Entrar na minha conta"}
              <Icon name="arrow" size={17} />
            </button>
          </form>
          <small className="login-foot">
            Seus registros ficam disponíveis somente para você.
          </small>
        </div>
      </section>
    </main>
  );
}
