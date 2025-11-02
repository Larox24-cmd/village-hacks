import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LEAD,
  communicationChannels,
  createInitialLog,
  createLeadBlueprints,
  createLeadInsights,
  createOutreachPreview,
  generateFastMcpSms,
  generateFollowUpEmail,
  buildFollowUpPlan,
  buildRetentionPlays,
  sanitizeRenewalMonth,
  type LeadProfile,
  type PreferredChannel,
} from '@/lib/agentic-engine';
import {
  recordLead,
  recordInteraction,
  recordTask,
  recordRetentionEvent,
  type InteractionPhase,
} from '@/lib/db';

const REQUIRED_FIELDS: Array<keyof LeadProfile> = [
  'name',
  'source',
  'preferredChannel',
  'personaTone',
  'lifeEvent',
  'insurer',
  'renewalMonth',
  'painPoint',
];

const isPreferredChannel = (value: unknown): value is PreferredChannel =>
  typeof value === 'string' && communicationChannels.includes(value as PreferredChannel);

const sanitizeString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const buildLeadFromPayload = (payload: Partial<LeadProfile>) => {
  const preferredChannelRaw = sanitizeString(payload.preferredChannel, '');
  const hasRenewalInput = typeof payload.renewalMonth === 'string' && payload.renewalMonth.trim().length > 0;

  const lead: LeadProfile = {
    name: sanitizeString(payload.name, ''),
    company: sanitizeString(payload.company, DEFAULT_LEAD.company),
    source: sanitizeString(payload.source, ''),
    preferredChannel: isPreferredChannel(preferredChannelRaw)
      ? (preferredChannelRaw as PreferredChannel)
      : DEFAULT_LEAD.preferredChannel,
    personaTone: sanitizeString(payload.personaTone, ''),
    lifeEvent: sanitizeString(payload.lifeEvent, ''),
    insurer: sanitizeString(payload.insurer, ''),
    renewalMonth: hasRenewalInput
      ? sanitizeRenewalMonth(payload.renewalMonth as string)
      : DEFAULT_LEAD.renewalMonth,
    painPoint: sanitizeString(payload.painPoint, ''),
  };

  const errors: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (field === 'preferredChannel') {
      if (!isPreferredChannel(preferredChannelRaw)) {
        errors.push('Preferred channel must be either SMS or Email.');
      }
      return;
    }

    if (field === 'renewalMonth') {
      if (!hasRenewalInput) {
        errors.push('Renewal month is required.');
      }
      return;
    }

    if (!lead[field] || (typeof lead[field] === 'string' && lead[field].trim().length === 0)) {
      const label = field.replace(/([A-Z])/g, ' $1').toLowerCase();
      errors.push(`Please provide a ${label}.`);
    }
  });

  return { lead, errors };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LeadProfile> | null;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ errors: ['Invalid request body.'] }, { status: 400 });
    }

    const { lead, errors } = buildLeadFromPayload(body);

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const timeline = createLeadBlueprints(lead);
    const fastSms = await generateFastMcpSms(lead);
    const outreach = createOutreachPreview(lead, fastSms);
    const initialLog = createInitialLog(lead);
    const insights = createLeadInsights(lead);

    const followUpEmail = await generateFollowUpEmail(lead, lead.painPoint);
    const followUpPlan = buildFollowUpPlan(lead, lead.painPoint);
    const retention = buildRetentionPlays(lead, lead.lifeEvent);

    const leadId = await recordLead({
      name: lead.name,
      company: lead.company,
      source: lead.source,
      personaTone: lead.personaTone,
      lifeEvent: lead.lifeEvent,
      insurer: lead.insurer,
      renewalMonth: lead.renewalMonth,
      painPoint: lead.painPoint,
      preferredChannel: lead.preferredChannel,
    });

    if (leadId) {
      const phase: InteractionPhase = 'PHASE1';
      await recordInteraction({
        leadId,
        phase,
        channel: 'System',
        summary: 'Lead captured and enriched via Clay + Apollo.',
        payload: { timeline },
      });
      await recordInteraction({
        leadId,
        phase,
        channel: lead.preferredChannel,
        summary: 'Personalized SMS dispatched via FastMCP.',
        payload: { sms: outreach.sms, reasoning: outreach.reasoning },
      });
      await recordTask({
        leadId,
        phase,
        actionType: 'sms',
        summary: 'Monitor SMS thread for YES confirmation and auto-book Calendly.',
      });
      await recordRetentionEvent({
        leadId,
        eventType: lead.lifeEvent,
        detectedAt: new Date().toISOString(),
        message: `Life event engine detected ${lead.lifeEvent}. Ready for Phase 3 plays.`,
      });
    }

    return NextResponse.json({
      leadId,
      timeline,
      outreach,
      initialLog,
      insights,
      personaTone: lead.personaTone,
      lead,
      followUpEmail,
      followUpPlan,
      retention,
    });
  } catch (error) {
    console.error('Agentic demo simulation failed', error);
    return NextResponse.json(
      { error: 'Unable to run the Agentic Engine simulation. Please try again.' },
      { status: 500 },
    );
  }
}
