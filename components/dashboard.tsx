"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  date,
  errorMessage,
  monthRange,
  number,
  today,
  type Entry,
  type Professional,
} from "@/lib/utils";
import Icon from "./icon";
import Report from "./report";
import ActivityDescription from "./activity-description";

type Tab = "entries" | "report" | "profile";
const titles = {
  entries: [
    "Lançamentos",
    "Um registro de cada dia. Uma visão clara do seu mês.",
  ],
  report: [
    "Relatório mensal",
    "Seu trabalho organizado, pronto para imprimir e assinar.",
  ],
  profile: ["Meus dados", "Informações usadas automaticamente nos seus relatórios."],
};
export default function Dashboard({
  userId,
}: {
  userId: string;
}) {
  const [supabase] = useState(createClient);
  const [tab, setTab] = useState<Tab>("entries");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [ascending, setAscending] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const lock = useRef(false);
  const sequence = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const load = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true);
    setLoadError("");
    try {
      const [start, end] = monthRange(month);
      const allProfessionals: Professional[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", userId)
          .order("name")
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        allProfessionals.push(...(data as Professional[]));
        if (data.length < 1000) break;
      }
      let flavia = allProfessionals.find(p =>
        /^flavia(?:\s|$)/i.test(p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()),
      );
      if (!flavia) {
        const { error } = await supabase.from("professionals").upsert(
          { id: userId, user_id: userId, name: "FLAVIA PELUFFO DA SILVA" },
          { onConflict: "id", ignoreDuplicates: true },
        );
        if (error) throw error;
        const result = await supabase.from("professionals").select("*").eq("id", userId).eq("user_id", userId).single();
        if (result.error) throw result.error;
        flavia = result.data as Professional;
      }
      const allEntries: Entry[] = [];
      for (let offset = 0; ; offset += 1000) {
        let query = supabase
          .from("entries")
          .select("*")
          .eq("professional_id", flavia.id)
          .eq("user_id", userId)
          .order("work_date")
          .order("id")
          .range(offset, offset + 999);
        if (tab === "report") {
          query = query.gte("work_date", start).lt("work_date", end);
        }
        const { data, error } = await query;
        if (error) throw error;
        allEntries.push(...(data as Entry[]));
        if (data.length < 1000) break;
      }
      if (current === sequence.current) {
        setProfessional(flavia);
        setEntries(allEntries);
      }
    } catch (e) {
      if (current === sequence.current) {
        setLoadError(errorMessage(e));
        setEntries([]);
      }
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }, [supabase, userId, month, tab]);
  useEffect(() => {
    // Synchronize the remote query when its filters change; sequence is a request counter, not a DOM ref.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const invalidate = () => {
      sequence.current++;
    };
    return invalidate;
  }, [load]);
  async function mutate(operation: () => Promise<void>, success: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await operation();
      setNotice({ text: success, error: false });
      await load();
    } catch (e) {
      setNotice({ text: errorMessage(e), error: true });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function clearForms() {
    setEditingEntry(null);
    setFormVersion((v) => v + 1);
  }
  function navigate(next: Tab) {
    setTab(next);
    clearForms();
    setNotice(null);
  }
  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const hours = Number(String(data.get("hours")).replace(",", "."));
    const payload = {
      user_id: userId,
      professional_id: editingEntry?.professional_id ?? professional?.id ?? "",
      work_date: String(data.get("work_date")),
      description: String(data.get("description")).trim(),
      hours,
      notes: editingEntry?.notes ?? null,
    };
    if (
      !payload.description ||
      !payload.professional_id ||
      !payload.work_date ||
      !Number.isFinite(hours) ||
      hours <= 0
    ) {
      setNotice({
        text: "Preencha a data, descreva a atividade e informe horas maiores que zero.",
        error: true,
      });
      return;
    }
    await mutate(
      async () => {
        const query = editingEntry
          ? supabase
              .from("entries")
              .update(payload)
              .eq("id", editingEntry.id)
              .eq("user_id", userId)
          : supabase.from("entries").insert(payload);
        const { error } = await query.select("id").single();
        if (error) throw error;
        clearForms();
      },
      `Lançamento ${editingEntry ? "atualizado" : "salvo"}.`,
    );
  }
  async function remove(id: string) {
    if (!confirm("Excluir este lançamento? Esta ação não pode ser desfeita.")) return;
    await mutate(async () => {
      const { error } = await supabase.from("entries").delete().eq("id", id).eq("user_id", userId).select("id").single();
      if (error) throw error;
      clearForms();
    }, "Lançamento excluído.");
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!professional) return;
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      cnpj: String(data.get("cnpj") ?? "").trim() || null,
      contract: String(data.get("contract") ?? "").trim() || null,
      hourly_rate: String(data.get("hourly_rate") ?? "").trim() === "" ? null : Number(String(data.get("hourly_rate")).replace(",", ".")),
    };
    if (payload.hourly_rate !== null && (!Number.isFinite(payload.hourly_rate) || payload.hourly_rate < 0 || payload.hourly_rate > 9999999999.99)) {
      setNotice({ text: "Informe um valor/hora válido, maior ou igual a zero.", error: true });
      return;
    }
    if (!payload.name) {
      setNotice({ text: "Informe seu nome.", error: true });
      return;
    }
    await mutate(async () => {
      const { data: updated, error } = await supabase.from("professionals").update(payload).eq("id", professional.id).eq("user_id", userId).select("*").single();
      if (error) throw error;
      setProfessional(updated as Professional);
    }, "Dados atualizados. Eles aparecerão no relatório.");
  }
  const total = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
  const sorted = [...entries].sort((a, b) =>
    ascending
      ? a.work_date.localeCompare(b.work_date)
      : b.work_date.localeCompare(a.work_date),
  );
  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Icon name="clock" size={24} />
          </span>
          hora clara<span className="brand-dot">.</span>
        </Link>
        <span className="nav-label">ESPAÇO DE TRABALHO</span>
        <nav aria-label="Navegação principal">
          {(
            [
              { id: "entries", text: "Lançamentos", icon: "list" },
              { id: "report", text: "Relatório", icon: "report" },
              { id: "profile", text: "Meus dados", icon: "people" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              {item.text}
              {tab === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="report" />
          <strong>Feche o mês com clareza.</strong>
          <p>Seus lançamentos viram um relatório pronto para assinar.</p>
          <button onClick={() => navigate("report")}>
            Ver relatório <Icon name="arrow" size={15} />
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar no-print">
          <span>
            Olá, Flávia <span className="breadcrumb">/</span>{" "}
            <strong>{titles[tab][0]}</strong>
          </span>
          <span className="private-badge">
            <span />
            Área pessoal
          </span>
        </header>
        <div className="content">
          <section className="page-heading no-print">
            <div>
              <span className="eyebrow">SUAS HORAS, SEM COMPLICAÇÃO</span>
              <h1>{titles[tab][0]}</h1>
              <p>{titles[tab][1]}</p>
            </div>
            {tab === "entries" && (
              <button className="secondary" onClick={() => navigate("report")}>
                <Icon name="report" size={17} />
                Ver relatório
                <Icon name="arrow" size={15} />
              </button>
            )}
          </section>
          {notice && (
            <div
              className={`notice no-print ${notice.error ? "error" : "success"}`}
              role={notice.error ? "alert" : "status"}
            >
              {notice.text}
              <button
                aria-label="Fechar mensagem"
                onClick={() => setNotice(null)}
              >
                ×
              </button>
            </div>
          )}
          {loadError && (
            <div className="notice error no-print" role="alert">
              {loadError}
              <button onClick={() => void load()}>Tentar novamente</button>
            </div>
          )}
          {tab === "report" && (
            <section className="filter-bar no-print">
              <div className="filter-caption">
                <Icon name="list" size={18} />
                <strong>Mês do relatório</strong>
              </div>
              <label>
                Competência
                <input
                  type="month"
                  required
                  min="1900-01"
                  max="9998-12"
                  value={month}
                  onChange={(e) => {
                    if (e.target.value) setMonth(e.target.value);
                  }}
                />
              </label>
            </section>
          )}
          {tab === "profile" && professional && <section className="card no-print profile-card">
                <div className="card-heading"><div><h2>Meus dados para o relatório</h2><p>Preencha uma vez e use em todos os seus relatórios.</p></div></div>
                <form onSubmit={saveProfile}><fieldset disabled={busy || loading}><div className="form-grid">
                  <label>Nome *<input name="name" required defaultValue={professional.name} /></label>
                  <label>CNPJ<input name="cnpj" defaultValue={professional.cnpj ?? ""} placeholder="Opcional" /></label>
                  <label>Atividade/Contrato<input name="contract" defaultValue={professional.contract ?? ""} placeholder="Opcional" /></label>
                  <label>Valor/hora (R$)<input name="hourly_rate" type="number" min="0" max="9999999999.99" step="0.01" defaultValue={professional.hourly_rate ?? ""} placeholder="Opcional" /></label>
                </div><div className="form-footer"><span>Esses dados aparecem no relatório.</span><button className="primary" disabled={busy}>Salvar meus dados</button></div></fieldset></form>
              </section>}
          {tab === "entries" && professional && (
            <>
              <section className="card no-print">
                <div className="card-heading">
                  <div>
                    <h2>
                      <Icon name="plus" size={18} />
                      {editingEntry ? "Editar lançamento" : "Novo lançamento"}
                    </h2>
                    <p>Preencha os detalhes da atividade realizada.</p>
                  </div>
                  <span className="subtle">* Campos obrigatórios</span>
                </div>
                <form
                  key={`entry-${formVersion}-${editingEntry?.id ?? "new"}`}
                  ref={formRef}
                  onSubmit={saveEntry}
                >
                  <fieldset disabled={busy || loading}>
                    <div className="form-grid">
                      <label>
                        Data *
                        <input
                          name="work_date"
                          type="date"
                          required
                          defaultValue={editingEntry?.work_date ?? today()}
                          min="1900-01-01"
                          max="9998-12-31"
                        />
                      </label>
                      <ActivityDescription initialValue={editingEntry?.description ?? ""} />
                      <label>
                        Horas *
                        <input
                          name="hours"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="999999.99"
                          required
                          defaultValue={editingEntry?.hours ?? ""}
                          placeholder="Ex.: 8,5"
                        />
                      </label>
                    </div>
                    <div className="form-footer">
                      <span>
                        <Icon name="clock" size={15} />
                        Use horas decimais: 1h30 = 1,5 h
                      </span>
                      <div>
                        {editingEntry && (
                          <button
                            type="button"
                            className="secondary"
                            onClick={clearForms}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          className="primary"
                          disabled={!professional || busy}
                        >
                          <Icon name="plus" size={17} />
                          {busy
                            ? "Salvando…"
                            : editingEntry
                              ? "Salvar alterações"
                              : "Salvar lançamento"}
                        </button>
                      </div>
                    </div>
                  </fieldset>
                </form>
              </section>
              <section className="card no-print">
                <div className="card-heading">
                  <div className="inline-heading">
                    <h2>Lançamentos registrados</h2>
                    <span className="count-badge">{entries.length}</span>
                  </div>
                </div>
                {loading ? (
                  <Loading />
                ) : !entries.length ? (
                  <Empty
                    title="Seu mês começa aqui"
                    text="Suas atividades aparecerão aqui após salvar."
                  />
                ) : (
                  <>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th
                              aria-sort={ascending ? "ascending" : "descending"}
                            >
                              <button
                                className="sort"
                                onClick={() => setAscending(!ascending)}
                              >
                                Data {ascending ? "↑" : "↓"}
                              </button>
                            </th>
                            <th>Descrição</th>
                            <th className="numeric">Horas</th>
                            <th className="numeric">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((entry) => (
                            <tr key={entry.id}>
                              <td className="nowrap">
                                {date(entry.work_date)}
                              </td>
                              <td className="description-cell">
                                {entry.description}
                              </td>
                              <td className="numeric hours-cell">
                                {number(Number(entry.hours))} h
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button
                                    disabled={busy}
                                    onClick={() => {
                                      setEditingEntry(entry);
                                      setFormVersion((v) => v + 1);
                                      formRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                      });
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    disabled={busy}
                                    className="danger-link"
                                    onClick={() =>
                                      void remove(entry.id)
                                    }
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer">
                      <span>Total de horas</span>
                      <strong>{number(total)} h</strong>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
          {tab === "report" && (
            <>
              {loading ? (
                <Loading />
              ) : loadError ? (
                <Empty
                  title="Relatório indisponível"
                  text="Corrija o erro de carregamento para gerar um relatório completo."
                />
              ) : !professional ? (
                <div className="card">
                  <Empty
                    title="Tudo pronto para fechar o mês"
                    text="Selecione o mês para visualizar seu relatório."
                  />
                </div>
              ) : (
                <>
                  <div className="report-toolbar no-print">
                    <span>
                      <span className="status-dot" />
                      Salve o PDF e assine pelo Gov.br · Flávia e Eva
                    </span>
                    <button className="primary" onClick={() => window.print()}>
                      <Icon name="print" size={18} />
                      Imprimir / Salvar PDF
                    </button>
                  </div>
                  <Report
                    professional={professional}
                    entries={entries}
                    month={month}
                  />
                </>
              )}
            </>
          )}
          <footer className="app-footer no-print">
            <span>
              hora clara<span className="brand-dot">.</span>
            </span>
            <span>Mais organização. Mais tempo para você.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="report" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Loading() {
  return (
    <div className="empty" role="status">
      <span className="spinner" />
      <p>Carregando registros…</p>
    </div>
  );
}
