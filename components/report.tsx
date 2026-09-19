import {
  date,
  monthLabel,
  number,
  type Entry,
  type Professional,
} from "@/lib/utils";
export default function Report({
  professional,
  entries,
  month,
}: {
  professional: Professional;
  entries: Entry[];
  month: string;
}) {
  const total = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const sorted = [...entries].sort((a, b) =>
    a.work_date.localeCompare(b.work_date),
  );
  const notes = sorted.filter((e) => e.notes?.trim());
  return (
    <article className="report-sheet" aria-label="Relatório mensal de horas">
      <header className="report-header">
        <span>CONTROLE DE ATIVIDADES</span>
        <h1>RELATÓRIO MENSAL DE HORAS</h1>
        <p className="capitalize">{monthLabel(month)}</p>
      </header>
      <dl className="report-details">
        <div>
          <dt>Profissional</dt>
          <dd>{professional.name}</dd>
        </div>
        <div>
          <dt>CNPJ</dt>
          <dd>{professional.cnpj || "Não informado"}</dd>
        </div>
        <div className="full">
          <dt>Atividade/Contrato</dt>
          <dd>{professional.contract || "Não informado"}</dd>
        </div>
        <div>
          <dt>Competência</dt>
          <dd className="capitalize">{monthLabel(month)}</dd>
        </div>
      </dl>
      <table className="report-table">
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "66%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição das atividades</th>
            <th className="numeric">Horas</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length ? (
            sorted.map((e) => (
              <tr key={e.id}>
                <td className="nowrap">{date(e.work_date)}</td>
                <td className="preserve-text">{e.description}</td>
                <td className="numeric">{number(Number(e.hours))}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>
                Nenhuma atividade registrada nesta competência.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <section className="report-totals">
        <div>
          <span>Total de horas</span>
          <strong>{number(total)} h</strong>
        </div>
      </section>
      <section className="report-notes">
        <h2>Observações</h2>
        {notes.length ? (
          notes.map((e) => (
            <p key={e.id} className="preserve-text">
              <strong>{date(e.work_date)} — </strong>
              {e.notes}
            </p>
          ))
        ) : (
          <p>Sem observações.</p>
        )}
      </section>
      <footer className="signatures">
        <div>
          <span />
          <strong>{professional.name}</strong>
          <p>Assinatura e carimbo do profissional</p>
        </div>
      </footer>
    </article>
  );
}
