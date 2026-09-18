"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="loading-screen">
      <h1>Não foi possível carregar a página.</h1>
      <p>Verifique sua conexão e tente novamente.</p>
      <button className="primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
