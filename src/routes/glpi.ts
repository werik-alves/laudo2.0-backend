import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { createTicketFollowup, LaudoInfoForGlpi } from "../services/glpi";

const router = Router();

/**
 * POST /glpi/followup
 * Body: {
 *   numeroChamado: number | string,
 *   glpiPassword: string,
 *   laudo: LaudoInfoForGlpi
 * }
 * Usa o username do usuário autenticado (JWT) e a senha informada para abrir sessão no GLPI e registrar o acompanhamento.
 */
router.post("/followup", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { username: string };
    const numeroChamadoRaw = (req.body?.numeroChamado ?? "").toString();
    const glpiPassword = (req.body?.glpiPassword ?? "").toString();
    const laudo = (req.body?.laudo ?? {}) as LaudoInfoForGlpi;

    const tickets_id = Number(numeroChamadoRaw);
    if (!tickets_id || Number.isNaN(tickets_id)) {
      return res.status(400).json({ error: "numeroChamado inválido" });
    }
    if (!glpiPassword) {
      return res.status(400).json({ error: "glpiPassword é obrigatório" });
    }
    if (!user?.username) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const result = await createTicketFollowup(
      user.username,
      glpiPassword,
      tickets_id,
      laudo
    );

    return res
      .status(200)
      .json({ success: true, followupId: result.id, raw: result.raw });
  } catch (err: any) {
    console.error("Erro GLPI followup:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao integrar com GLPI" });
  }
});

// Nova rota para relacionar dados e registrar follow-up com cabeçalho
router.post("/relacionar", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { username: string };
    const numeroChamadoRaw = (req.body?.numeroChamado ?? "").toString();
    const glpiPassword = (req.body?.glpiPassword ?? "").toString();
    const laudo = (req.body?.laudo ?? {}) as LaudoInfoForGlpi;
    const relacao = (req.body?.relacao ?? {}) as {
      titulo?: string;
      localizacao?: string;
      tecnicoAtribuido?: string;
      grupo?: string;
      categoria?: string;
      requerente?: string;
    };

    const tickets_id = Number(numeroChamadoRaw);
    if (!tickets_id || Number.isNaN(tickets_id)) {
      return res.status(400).json({ error: "numeroChamado inválido" });
    }
    if (!glpiPassword) {
      return res.status(400).json({ error: "glpiPassword é obrigatório" });
    }
    if (!user?.username) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { createTicketFollowupWithHeader } = await import("../services/glpi");
    const result = await createTicketFollowupWithHeader(
      user.username,
      glpiPassword,
      tickets_id,
      laudo,
      relacao
    );

    return res
      .status(200)
      .json({ success: true, followupId: result.id, raw: result.raw });
  } catch (err: any) {
    console.error("Erro GLPI relacionar:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao integrar com GLPI" });
  }
});
// Nova rota: listar categorias diretamente do DB do GLPI
router.get("/lookup/categories-db", requireAuth, async (_req, res) => {
  try {
    const { listItilCategories } = await import("../services/glpiDb");
    const categorias = await listItilCategories();
    return res.status(200).json(categorias);
  } catch (err: any) {
    console.error("Erro ao listar categorias GLPI via DB:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao consultar DB GLPI" });
  }
});

// Nova rota: listar localizações diretamente do DB do GLPI
router.get("/lookup/locations-db", requireAuth, async (_req, res) => {
  try {
    const { listLocations } = await import("../services/glpiDb");
    const locais = await listLocations();
    return res.status(200).json(locais);
  } catch (err: any) {
    console.error("Erro ao listar localizações GLPI via DB:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao consultar DB GLPI" });
  }
});

// Nova rota: listar grupos diretamente do DB do GLPI
router.get("/lookup/groups-db", requireAuth, async (_req, res) => {
  try {
    const { listGroups } = await import("../services/glpiDb");
    const grupos = await listGroups();
    return res.status(200).json(grupos);
  } catch (err: any) {
    console.error("Erro ao listar grupos GLPI via DB:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao consultar DB GLPI" });
  }
});

// Criar Ticket no GLPI com dados do modal de relação
router.post("/ticket/create", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { username: string };
    const glpiPassword = (req.body?.glpiPassword ?? "").toString();
    const laudo = (req.body?.laudo ?? {}) as LaudoInfoForGlpi;
    const relacao = (req.body?.relacao ?? {}) as {
      titulo?: string;
      categoriaId?: number | null;
      localizacaoId?: number | null;
      grupoId?: number | null;
    };

    if (!glpiPassword) {
      return res.status(400).json({ error: "glpiPassword é obrigatório" });
    }
    if (!user?.username) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { createTicket, setTicketRequester } = await import(
      "../services/glpi"
    );
    const { findGlpiUserByLogin } = await import("../services/glpiDb");

    // 1) Cria o ticket com base no laudo (sem cabeçalho extra)
    const result = await createTicket(
      user.username,
      glpiPassword,
      laudo,
      relacao
    );
    const ticketId = result.id;

    // 2) Obtém o users_id do criador (via glpi_users.name = login)
    let requesterSet: boolean | undefined = undefined;
    let requesterUserId: number | undefined = undefined;

    if (ticketId) {
      const userRow = await findGlpiUserByLogin(user.username).catch(
        () => null
      );
      if (userRow?.id) {
        requesterUserId = userRow.id;
        // 3) Define o requerente do ticket
        await setTicketRequester(
          user.username,
          glpiPassword,
          ticketId,
          requesterUserId,
          1
        );
        requesterSet = true;
      } else {
        requesterSet = false;
      }
    }

    return res.status(200).json({
      success: true,
      ticketId,
      requesterSet,
      requesterUserId,
      raw: result.raw,
    });
  } catch (err: any) {
    console.error("Erro GLPI criar ticket:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao criar Ticket no GLPI" });
  }
});
router.post("/ticket/link", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { username: string };
    const glpiPassword = (req.body?.glpiPassword ?? "").toString();
    const t1 = Number(req.body?.tickets_id_1);
    const t2 = Number(req.body?.tickets_id_2);
    const linkType = Number(req.body?.link ?? 1);

    if (!glpiPassword) {
      return res.status(400).json({ error: "glpiPassword é obrigatório" });
    }
    if (!user?.username) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    if (!t1 || Number.isNaN(t1) || !t2 || Number.isNaN(t2)) {
      return res.status(400).json({ error: "IDs de tickets inválidos" });
    }

    const { linkTickets } = await import("../services/glpi");
    const raw = await linkTickets(
      user.username,
      glpiPassword,
      t1,
      t2,
      linkType
    );
    return res.status(200).json({ success: true, raw });
  } catch (err: any) {
    console.error("Erro GLPI relacionar tickets:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao relacionar Tickets" });
  }
});
// Nova rota: atribuir usuário ao ticket (type=2)
router.post("/ticket/assign", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { username: string };
    const glpiPassword = (req.body?.glpiPassword ?? "").toString();
    const tickets_id = Number(req.body?.tickets_id);

    if (!glpiPassword) {
      return res.status(400).json({ error: "glpiPassword é obrigatório" });
    }
    if (!user?.username) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    if (!tickets_id || Number.isNaN(tickets_id)) {
      return res.status(400).json({ error: "tickets_id inválido" });
    }

    const { setTicketAssigned } = await import("../services/glpi");
    const { findGlpiUserByLogin } = await import("../services/glpiDb");

    const userRow = await findGlpiUserByLogin(user.username).catch(() => null);
    if (!userRow?.id) {
      return res
        .status(404)
        .json({ error: "Usuário não encontrado em glpi_users" });
    }

    const raw = await setTicketAssigned(
      user.username,
      glpiPassword,
      tickets_id,
      userRow.id,
      2
    );

    return res.status(200).json({
      success: true,
      tickets_id,
      users_id: userRow.id,
      raw,
    });
  } catch (err: any) {
    console.error("Erro GLPI atribuir usuário:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Erro interno ao atribuir usuário" });
  }
});
export default router;
