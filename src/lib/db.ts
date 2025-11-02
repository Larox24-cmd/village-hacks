import type { Pool } from 'pg';

export type LeadStatus = 'new' | 'qualified' | 'nurture' | 'customer';
export type InteractionPhase = 'PHASE1' | 'PHASE2' | 'PHASE3';
export type InteractionChannel = 'SMS' | 'Email' | 'Call' | 'Task' | 'System';

export type StoredLead = {
  id: number;
  name: string;
  company: string;
  source: string;
  persona_tone: string;
  life_event: string;
  insurer: string;
  renewal_month: string;
  pain_point: string;
  preferred_channel: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

export type StoredInteraction = {
  id: number;
  lead_id: number;
  phase: InteractionPhase;
  channel: InteractionChannel;
  summary: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type StoredTask = {
  id: number;
  lead_id: number;
  phase: InteractionPhase;
  action_type: 'call' | 'sms' | 'email' | 'task' | 'wait';
  due_at: string | null;
  status: 'pending' | 'completed';
  summary: string;
  created_at: string;
};

export type StoredRetentionEvent = {
  id: number;
  lead_id: number;
  event_type: string;
  detected_at: string;
  message: string;
  created_at: string;
};

let poolPromise: Promise<Pool | null> | null = null;

const ensureSchema = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      source TEXT NOT NULL,
      persona_tone TEXT NOT NULL,
      life_event TEXT NOT NULL,
      insurer TEXT NOT NULL,
      renewal_month TEXT NOT NULL,
      pain_point TEXT NOT NULL,
      preferred_channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS interactions (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      phase TEXT NOT NULL,
      channel TEXT NOT NULL,
      summary TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      phase TEXT NOT NULL,
      action_type TEXT NOT NULL,
      due_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'pending',
      summary TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS retention_events (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      detected_at TIMESTAMPTZ NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const createPool = async (): Promise<Pool | null> => {
  try {
    const pg = (await import('pg')) as { Pool: new (config: Record<string, unknown>) => Pool };
    const connectionString =
      process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/agentic_engine';
    const pool = new pg.Pool({ connectionString });
    await pool.query('SELECT 1;');
    await ensureSchema(pool);
    return pool;
  } catch (error) {
    console.error('Failed to initialize Postgres pool. Ensure pg is installed and DATABASE_URL is set.', error);
    return null;
  }
};

export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = createPool();
  }
  return poolPromise;
};

export const recordLead = async (lead: {
  name: string;
  company: string;
  source: string;
  personaTone: string;
  lifeEvent: string;
  insurer: string;
  renewalMonth: string;
  painPoint: string;
  preferredChannel: string;
}): Promise<number | null> => {
  const pool = await getPool();
  if (!pool) {
    return null;
  }

  const result = await pool.query<{ id: number }>(
    `INSERT INTO leads (name, company, source, persona_tone, life_event, insurer, renewal_month, pain_point, preferred_channel)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id;`,
    [
      lead.name,
      lead.company,
      lead.source,
      lead.personaTone,
      lead.lifeEvent,
      lead.insurer,
      lead.renewalMonth,
      lead.painPoint,
      lead.preferredChannel,
    ],
  );

  return result.rows[0]?.id ?? null;
};

export const updateLeadStatus = async (leadId: number, status: LeadStatus) => {
  const pool = await getPool();
  if (!pool) return;

  await pool.query('UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2;', [status, leadId]);
};

export const recordInteraction = async (interaction: {
  leadId: number;
  phase: InteractionPhase;
  channel: InteractionChannel;
  summary: string;
  payload?: Record<string, unknown>;
}) => {
  const pool = await getPool();
  if (!pool) return;

  await pool.query(
    `INSERT INTO interactions (lead_id, phase, channel, summary, payload)
     VALUES ($1,$2,$3,$4,$5);`,
    [interaction.leadId, interaction.phase, interaction.channel, interaction.summary, interaction.payload ?? null],
  );
};

export const recordTask = async (task: {
  leadId: number;
  phase: InteractionPhase;
  actionType: StoredTask['action_type'];
  summary: string;
  dueAt?: string | null;
}) => {
  const pool = await getPool();
  if (!pool) return;

  await pool.query(
    `INSERT INTO tasks (lead_id, phase, action_type, summary, due_at)
     VALUES ($1,$2,$3,$4,$5);`,
    [task.leadId, task.phase, task.actionType, task.summary, task.dueAt ?? null],
  );
};

export const recordRetentionEvent = async (event: {
  leadId: number;
  eventType: string;
  detectedAt: string;
  message: string;
}) => {
  const pool = await getPool();
  if (!pool) return;

  await pool.query(
    `INSERT INTO retention_events (lead_id, event_type, detected_at, message)
     VALUES ($1,$2,$3,$4);`,
    [event.leadId, event.eventType, event.detectedAt, event.message],
  );
};

export const fetchLeadDetail = async (leadId: number) => {
  const pool = await getPool();
  if (!pool) return null;

  const [leadResult, interactionsResult, tasksResult, retentionResult] = await Promise.all([
    pool.query<StoredLead>('SELECT * FROM leads WHERE id = $1;', [leadId]),
    pool.query<StoredInteraction>('SELECT * FROM interactions WHERE lead_id = $1 ORDER BY created_at ASC;', [leadId]),
    pool.query<StoredTask>('SELECT * FROM tasks WHERE lead_id = $1 ORDER BY created_at ASC;', [leadId]),
    pool.query<StoredRetentionEvent>(
      'SELECT * FROM retention_events WHERE lead_id = $1 ORDER BY detected_at DESC;',
      [leadId],
    ),
  ]);

  const lead = leadResult.rows[0];
  if (!lead) return null;

  return {
    lead,
    interactions: interactionsResult.rows,
    tasks: tasksResult.rows,
    retentionEvents: retentionResult.rows,
  };
};

export const fetchRecentLeads = async (limit = 10) => {
  const pool = await getPool();
  if (!pool) return [];

  const leads = await pool.query<StoredLead>(
    'SELECT * FROM leads ORDER BY created_at DESC LIMIT $1;',
    [limit],
  );

  return leads.rows;
};
