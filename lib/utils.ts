export type Professional = {
  id: string;
  user_id: string;
  name: string;
  cnpj: string | null;
  contract: string | null;
};
export type Entry = {
  id: string;
  user_id: string;
  professional_id: string;
  work_date: string;
  description: string;
  hours: number;
  notes: string | null;
};
export const number = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
export const date = (value: string) => value.split("-").reverse().join("/");
export const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
export const monthLabel = (month: string) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
export function monthRange(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new Error("Selecione um mês válido.");
  const [year, m] = month.split("-").map(Number);
  return [
    `${month}-01`,
    `${m === 12 ? year + 1 : year}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01`,
  ];
}
export function errorMessage(error: unknown) {
  const e = error as { code?: string; message?: string };
  const messages: Record<string, string> = {
    invalid_credentials: "Email ou senha incorretos.",
    email_not_confirmed: "Confirme seu email antes de entrar.",
    user_already_exists: "Este email já está cadastrado.",
    weak_password: "Use uma senha mais forte, com pelo menos 8 caracteres.",
    over_email_send_rate_limit:
      "Aguarde alguns minutos antes de solicitar outro email.",
    "23503": "O profissional não está mais disponível. Atualize a página.",
    "23514": "Confira os campos: as horas devem ser maiores que zero.",
    "42501": "Sua sessão não permite esta operação. Entre novamente.",
    "42P01":
      "As tabelas ainda não foram criadas. Execute o SQL do projeto no Supabase.",
  };
  return (
    messages[e?.code ?? ""] ??
    (e?.message === "Failed to fetch"
      ? "Falha de conexão. Verifique sua internet e tente novamente."
      : e?.message || "Não foi possível concluir. Tente novamente.")
  );
}
