'use client';
import { useEffect, useRef, useState } from 'react';
type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
export default function InstallApp() {
  const pending = useRef<InstallEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const display = matchMedia('(display-mode: standalone)');
    const sync = () => setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    sync();
    const ready = (event: Event) => { event.preventDefault(); pending.current = event as InstallEvent; };
    const done = () => { pending.current = null; setInstalled(true); dialog.current?.close(); };
    window.addEventListener('beforeinstallprompt', ready);
    window.addEventListener('appinstalled', done);
    display.addEventListener('change', sync);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => { /* Installation via browser menu remains available. */ });
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', ready);
      window.removeEventListener('appinstalled', done);
      display.removeEventListener('change', sync);
    };
  }, []);
  async function install() {
    if (busy) return;
    const event = pending.current;
    if (!event) { dialog.current?.showModal(); return; }
    setBusy(true); pending.current = null;
    try { await event.prompt(); await event.userChoice; }
    catch { dialog.current?.showModal(); }
    finally { setBusy(false); }
  }
  if (installed) return null;
  return <div className="install-app no-print">
    <button className="primary install-trigger" onClick={install} disabled={busy}>{busy ? 'Aguarde…' : '↓ Instalar app'}</button>
    <dialog ref={dialog} className="install-dialog" aria-labelledby="install-title">
      <h2 id="install-title">Instalar Hora Clara</h2>
      <p>Abra este link no navegador do celular para adicionar o app à tela inicial.</p>
      <h3>Android</h3><p>No Chrome, abra o menu ⋮ e toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p>
      <h3>iPhone / iPad</h3><p>No Safari, toque em <strong>Compartilhar → Adicionar à Tela de Início → Adicionar</strong>. Se aparecer, mantenha <strong>Abrir como App da Web</strong> ativado.</p>
      <p className="subtle">É necessário internet para acessar e salvar seus registros. No computador, use a opção de instalação do Chrome ou Edge.</p>
      <form method="dialog"><button className="primary">Entendi</button></form>
    </dialog>
  </div>;
}
