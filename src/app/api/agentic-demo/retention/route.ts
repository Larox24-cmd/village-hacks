import { NextRequest, NextResponse } from 'next/server';

import { buildRetentionPlays, type LeadProfile, DEFAULT_LEAD } from '@/lib/agentic-engine';
import {
  fetchLeadDetail,
  recordInteraction,
  recordRetentionEvent,
  type InteractionPhase,
} from '@/lib/db';

const toLeadProfile = (stored: {
  name: string;
  company: string;
  source: string;
  persona_tone: string;
  life_event: string;
  insurer: string;
  renewal_month: string;
  pain_point: string;
  preferred_channel: string;
}): LeadProfile => ({
  name: stored.name,
  company: stored.company,
  source: stored.source,
  personaTone: stored.persona_tone,
  lifeEvent: stored.life_event,
  insurer: stored.insurer,
  renewalMonth: stored.renewal_month,
  painPoint: stored.pain_point,
  preferredChannel:
    stored.preferred_channel === 'SMS' || stored.preferred_channel === 'Email'
      ? stored.preferred_channel
      : DEFAULT_LEAD.preferredChannel,
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      leadId?: number;
      lifeEvent?: string;
    } | null;

    if (!body?.leadId || !body.lifeEvent) {
      return NextResponse.json({ error: 'leadId and lifeEvent are required.' }, { status: 400 });
    }

    const detail = await fetchLeadDetail(body.leadId);
    if (!detail) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const leadProfile = toLeadProfile(detail.lead);
    const plays = buildRetentionPlays(leadProfile, body.lifeEvent);

    const phase: InteractionPhase = 'PHASE3';
    await recordRetentionEvent({
      leadId: body.leadId,
      eventType: body.lifeEvent,
      detectedAt: new Date().toISOString(),
      message: plays[0]?.action ?? 'Life event detected.',
    });

    await recordInteraction({
      leadId: body.leadId,
      phase,
      channel: plays[0]?.channel ?? 'SMS',
      summary: `Life event detected: ${body.lifeEvent}. Triggering retention plays.`,
      payload: { plays },
    });

    return NextResponse.json({ plays });
  } catch (error) {
    console.error('Failed to register life event', error);
    return NextResponse.json({ error: 'Unable to run retention automation.' }, { status: 500 });
  }
}
