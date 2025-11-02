import { NextRequest, NextResponse } from 'next/server';

import { fetchLeadDetail, fetchRecentLeads } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const includeDetails = searchParams.get('details') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

    if (leadId) {
      const detail = await fetchLeadDetail(Number.parseInt(leadId, 10));
      if (!detail) {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
      }
      return NextResponse.json(detail);
    }

    const leads = await fetchRecentLeads(Number.isNaN(limit) ? 10 : limit);

    if (!includeDetails) {
      return NextResponse.json({ leads });
    }

    const details = await Promise.all(
      leads.map(async (lead) => (await fetchLeadDetail(lead.id)) ?? {
        lead,
        interactions: [],
        tasks: [],
        retentionEvents: [],
      }),
    );

    return NextResponse.json({ leads: details });
  } catch (error) {
    console.error('Failed to fetch leads', error);
    return NextResponse.json({ error: 'Unable to load leads.' }, { status: 500 });
  }
}
