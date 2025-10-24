/* eslint-disable @typescript-eslint/no-explicit-any */
const GLPI_BASE_URL =
  process.env.GLPI_BASE_URL ||
  "http://suporte.cometasupermercados.com.br/apirest.php";
const GLPI_APP_TOKEN =
  process.env.GLPI_APP_TOKEN || "90MIxmLN3yzkpMpPUJIRPrGwGqa3YVwqiEW2Fraf";

function escapeHtml(str: string | null | undefined): string {
  const s = String(str ?? "").trim();
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type LaudoInfoForGlpi = {
  equipamento?: string | null;
  modelo?: string | null;
  tombo?: string | null;
  setor?: string | null;
  loja?: string | null;
  testesRealizados?: string | null;
  diagnostico?: string | null;
  estadoEquipamento?: string | null;
  necessidade?: string | null;
};

function buildFollowupHtml(info: LaudoInfoForGlpi): string {
  const estado =
    info.estadoEquipamento === "funcionando"
      ? "Funcionando"
      : info.estadoEquipamento === "nao_funcionando"
      ? "Não funcionando"
      : escapeHtml(info.estadoEquipamento);

  const necessidade =
    info.necessidade === "substituido"
      ? "Ser substituído"
      : info.necessidade === "enviar_conserto"
      ? "Enviar para conserto"
      : info.necessidade === "descartado"
      ? "Descartado"
      : escapeHtml(info.necessidade);

  return (
    `<h3>* Informações do Laudo Técnico *</h3>` +
    `<p>` +
    `<br>Equipamento: ${escapeHtml(info.equipamento)}` +
    `<br><br>Modelo: ${escapeHtml(info.modelo)}` +
    `<br><br>Tombo: ${escapeHtml(info.tombo)}` +
    `<br><br>Setor: ${escapeHtml(info.setor)}` +
    `<br><br>Loja: ${escapeHtml(info.loja)}` +
    `<br><br>Testes Realizados: ${escapeHtml(info.testesRealizados)}` +
    `<br><br>Diagnóstico do equipamento: ${escapeHtml(info.diagnostico)}` +
    `<br><br>Estado do Equipamento: ${estado}` +
    `<br><br>Equipamento necessita: ${necessidade}` +
    `<br><br>OBS: Laudo entregue ao administrador(a) da loja.` +
    `</p>`
  );
}

async function initSession(login: string, password: string): Promise<string> {
  const url = `${GLPI_BASE_URL}/initSession`;
  const basic = Buffer.from(`${login}:${password}`).toString("base64");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Basic ${basic}`,
  };
  if (GLPI_APP_TOKEN) headers["App-Token"] = GLPI_APP_TOKEN;

  const resp = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(
      `Falha ao autenticar no GLPI (${resp.status}): ${body || resp.statusText}`
    );
  }

  const json = (await resp.json()) as { session_token?: string };
  if (!json.session_token)
    throw new Error("Session token não retornado pelo GLPI");
  return json.session_token;
}

export async function createTicketFollowup(
  username: string,
  password: string,
  tickets_id: number,
  info: LaudoInfoForGlpi
): Promise<{ id?: number; raw: any }> {
  const sessionToken = await initSession(username, password);

  const contentHtml = buildFollowupHtml(info);
  const url = `${GLPI_BASE_URL}/TicketFollowup`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({
      input: {
        tickets_id,
        content: contentHtml,
        is_private: 0,
      },
    }),
  });

  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao criar followup no GLPI (${resp.status}): ${JSON.stringify(raw)}`
    );
  }

  const id =
    typeof raw === "object" && raw && "id" in raw
      ? Number((raw as any).id)
      : undefined;
  return { id, raw };
}

export async function createTicketFollowupWithHeader(
  username: string,
  password: string,
  tickets_id: number,
  info: LaudoInfoForGlpi,
  relacao?: RelacaoHeader
): Promise<{ id?: number; raw: any }> {
  const sessionToken = await initSession(username, password);

  const headerHtml = relacao
    ? `<h3>Relacionamento com chamado existente</h3>` +
      `<p>` +
      `<br>Título: ${escapeHtml(relacao.titulo)}` +
      `<br><br>Localização: ${escapeHtml(relacao.localizacao)}` +
      `<br><br>Técnico atribuído: ${escapeHtml(relacao.tecnicoAtribuido)}` +
      `<br><br>Grupo: ${escapeHtml(relacao.grupo)}` +
      `<br><br>Categoria: ${escapeHtml(relacao.categoria)}` +
      `<br><br>Requerente: ${escapeHtml(relacao.requerente)}` +
      `</p>`
    : "";

  const contentHtml = headerHtml + buildFollowupHtml(info);
  const url = `${GLPI_BASE_URL}/TicketFollowup`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({
      input: {
        tickets_id,
        content: contentHtml,
        is_private: 0,
      },
    }),
  });

  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao criar followup com relação (${resp.status}): ${JSON.stringify(
        raw
      )}`
    );
  }

  const id =
    typeof raw === "object" && raw && "id" in raw
      ? Number((raw as any).id)
      : undefined;
  return { id, raw };
}

export async function createTicket(
  username: string,
  password: string,
  info: LaudoInfoForGlpi,
  relacao?: {
    titulo?: string;
    categoriaId?: number | null;
    localizacaoId?: number | null;
    grupoId?: number | null;
  }
): Promise<{ id?: number; raw: any }> {
  const sessionToken = await initSession(username, password);

  const contentHtml = buildFollowupHtml(info);
  const defaultName =
    `Laudo Técnico - ` +
    (info.equipamento ||
      info.modelo ||
      info.tombo ||
      info.setor ||
      info.loja ||
      "Sem título");

  const inputPayload: Record<string, any> = {
    name: escapeHtml(relacao?.titulo || defaultName),
    content: contentHtml,
    type: 1,
    priority: 3,
    status: 1,
  };

  if (relacao?.categoriaId)
    inputPayload["itilcategories_id"] = relacao.categoriaId;
  if (relacao?.localizacaoId)
    inputPayload["locations_id"] = relacao.localizacaoId;
  if (relacao?.grupoId) inputPayload["groups_id_assign"] = relacao.grupoId;

  const url = `${GLPI_BASE_URL}/Ticket`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({ input: inputPayload }),
  });

  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao criar Ticket no GLPI (${resp.status}): ${JSON.stringify(raw)}`
    );
  }

  const id =
    typeof raw === "object" && raw && "id" in raw
      ? Number((raw as any).id)
      : undefined;
  return { id, raw };
}

export async function linkTickets(
  username: string,
  password: string,
  tickets_id_1: number,
  tickets_id_2: number,
  link: number = 1
): Promise<any> {
  const sessionToken = await initSession(username, password);
  const url = `${GLPI_BASE_URL}/Ticket_Ticket`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({
      input: { tickets_id_1, tickets_id_2, link },
    }),
  });
  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao relacionar Tickets (${resp.status}): ${JSON.stringify(raw)}`
    );
  }
  return raw;
}

export type RelacaoHeader = {
  titulo?: string;
  localizacao?: string;
  tecnicoAtribuido?: string;
  grupo?: string;
  categoria?: string;
  requerente?: string;
};

// Define o requerente no ticket recém-criado (type=1)
export async function setTicketRequester(
  username: string,
  password: string,
  tickets_id: number,
  users_id: number,
  type: number = 1
): Promise<any> {
  const sessionToken = await initSession(username, password);
  const url = `${GLPI_BASE_URL}/Ticket_User`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({
      input: {
        tickets_id,
        users_id,
        type,
      },
    }),
  });

  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao definir requerente (${resp.status}): ${JSON.stringify(raw)}`
    );
  }
  return raw;
}

// Adicionar: atribuição (type=2) ao chamado
export async function setTicketAssigned(
  username: string,
  password: string,
  tickets_id: number,
  users_id: number,
  type: number = 2
): Promise<any> {
  const sessionToken = await initSession(username, password);
  const url = `${GLPI_BASE_URL}/Ticket_User`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "App-Token": GLPI_APP_TOKEN,
      "Session-Token": sessionToken,
    },
    body: JSON.stringify({
      input: {
        tickets_id,
        users_id,
        type, // 2 = atribuído
      },
    }),
  });

  const raw = await resp.json().catch(async () => await resp.text());
  if (!resp.ok) {
    throw new Error(
      `Falha ao atribuir usuário ao Ticket (${resp.status}): ${JSON.stringify(
        raw
      )}`
    );
  }
  return raw;
}
