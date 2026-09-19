"use client";
import { useRef, useState } from "react";
export default function ActivityDescription({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className="full activity-field">
    <input type="hidden" name="description" value={value} />
    <p>Descrição das atividades *</p>
    <button type="button" className="secondary" onClick={() => { setDraft(value); dialog.current?.showModal(); }}>✎ Escrever em janela maior</button>
    <dialog ref={dialog} className="activity-dialog" aria-labelledby="activity-title">
      <h2 id="activity-title">Descreva suas atividades</h2>
      <label htmlFor="activity-draft">O que você fez neste dia?</label>
      <textarea id="activity-draft" rows={10} maxLength={5000} value={draft} onChange={e => setDraft(e.target.value)} />
      <div className="activity-actions"><button type="button" className="secondary" onClick={() => dialog.current?.close()}>Cancelar</button><button type="button" className="primary" onClick={() => { setValue(draft); dialog.current?.close(); }}>Usar esta descrição</button></div>
    </dialog>
  </div>;
}
