import { NextRequest, NextResponse } from 'next/server';

import { buildCalendarLink, DEFAULT_LEAD, type LeadProfile } from '@/lib/agentic-engine';
import {
  fetchLeadDetail,
  recordInteraction,
  recordTask,
  updateLeadStatus,
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
    const body = (await request.json()) as { leadId?: number } | null;
    if (!body?.leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    const detail = await fetchLeadDetail(body.leadId);
    if (!detail) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const leadProfile = toLeadProfile(detail.lead);
    const calendarLink = buildCalendarLink(leadProfile);
    const meetingTitle = `${leadProfile.name.split(' ')[0] ?? leadProfile.name} · Insurance review`;

    await updateLeadStatus(body.leadId, 'qualified');

    const phase: InteractionPhase = 'PHASE1';
    await recordInteraction({
      leadId: body.leadId,
      phase,
      channel: 'SMS',
      summary: 'Prospect replied YES. Calendly invite generated automatically.',
      payload: { calendarLink, meetingTitle },
    });

    await recordTask({
      leadId: body.leadId,
      phase,
      actionType: 'email',
      summary: 'Send meeting prep email with agenda + ROI recap.',
    });

    return NextResponse.json({ calendarLink, meetingTitle });
  } catch (error) {
    console.error('Failed to confirm prospect reply', error);
    return NextResponse.json({ error: 'Unable to confirm the lead.' }, { status: 500 });
  }
}
