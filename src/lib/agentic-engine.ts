export type PreferredChannel = 'SMS' | 'Email';

export type LeadProfile = {
  name: string;
  company: string;
  source: string;
  preferredChannel: PreferredChannel;
  personaTone: string;
  lifeEvent: string;
  insurer: string;
  renewalMonth: string;
  painPoint: string;
};

export type StepBlueprint = {
  id: string;
  title: string;
  description: string;
  logMessage: string;
};

export type OutreachPreview = {
  sms: string;
  reasoning?: string;
  emailSubject: string;
  emailBody: string;
  calendar: {
    label: string;
    link: string;
  };
};

export type FollowUpAction = {
  channel: 'SMS' | 'Email' | 'Call' | 'Task';
  title: string;
  body: string;
  intent: 'nurture' | 'objection' | 'close';
};

export type RetentionPlay = {
  trigger: string;
  action: string;
  scoreDelta: number;
  channel: 'SMS' | 'Email' | 'Call';
};

export const communicationChannels: PreferredChannel[] = ['SMS', 'Email'];

export const lifeEvents = [
  'New baby',
  'New home purchase',
  'Teen driver added',
  'Job change',
  'New car lease',
] as const;

export const insurers = ['State Farm', 'Geico', 'Progressive', 'Allstate', 'Liberty Mutual'] as const;

export const painPoints = [
  'Premiums spiked 18% at renewal',
  'Agent never follows up',
  'Coverage gaps for new assets',
  'Claims experience was slow',
  'Bundle discounts not applied',
] as const;

export const personaTones = ['Warm & concise', 'Direct & data-backed', 'Playful & upbeat', 'Executive brief'] as const;

export const DEFAULT_LEAD: LeadProfile = {
  name: 'Alex Johnson',
  company: 'Solisa Prospects',
  source: 'Website form',
  preferredChannel: 'SMS',
  personaTone: 'Warm & concise',
  lifeEvent: 'New baby',
  insurer: 'State Farm',
  renewalMonth: '2025-02',
  painPoint: 'Premiums spiked 18% at renewal',
};

export const formatRenewal = (renewalMonth: string) => {
  if (!renewalMonth) return 'their next renewal window';
  const [year, month] = renewalMonth.split('-').map((part) => parseInt(part, 10));
  if (!year || !month) return 'their next renewal window';
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const createLeadBlueprints = (lead: LeadProfile): StepBlueprint[] => [
  {
    id: 'capture',
    title: 'Lead captured in <2 seconds',
    description: `Form submission from ${lead.name} (${lead.source}) syncs to the Agentic Engine instantly.`,
    logMessage: `Lead intake completed for ${lead.name}. Profile seeded with website, referral, and UTM context.`,
  },
  {
    id: 'enrich',
    title: 'Clay + Apollo enrichment',
    description: `Clay flags ${lead.lifeEvent.toLowerCase()} and Apollo confirms ${lead.insurer} policy renewing in ${formatRenewal(lead.renewalMonth)}. Pain point: ${lead.painPoint}.`,
    logMessage: `Clay appended life-stage signal "${lead.lifeEvent}". Apollo matched ${lead.insurer} policy with renewal ${formatRenewal(lead.renewalMonth)}.`,
  },
  {
    id: 'profile',
    title: 'Contextual dossier assembled',
    description: `Reviews, LinkedIn, and CRM history build a living brief and preferred tone: ${lead.personaTone}.`,
    logMessage: `Prospect tone calibrated to "${lead.personaTone}". CRM notes and public reviews summarized for objections.`,
  },
  {
    id: 'outreach',
    title: `${lead.preferredChannel} outreach dispatched`,
    description: `${lead.preferredChannel} message references ${lead.lifeEvent.toLowerCase()} and quantifies savings vs. ${lead.insurer}.`,
    logMessage: `${lead.preferredChannel} message sent with ROI proof tailored to ${lead.insurer}.`,
  },
  {
    id: 'response',
    title: 'Prospect signals intent',
    description: 'AI parses reply "Yes, this week works" and scores readiness to switch.',
    logMessage: 'Reply intent scored as "Hot". Objection tracking updated (cost sensitivity).',
  },
  {
    id: 'booked',
    title: 'Calendly slot secured',
    description: 'Meeting confirmed for Tuesday 10:30 AM; CRM + Slack updated automatically.',
    logMessage: 'Calendly confirmation posted to Slack #pipeline and CRM task opened for licensed agent.',
  },
];

export const createInitialLog = (lead: LeadProfile) =>
  `New ${lead.source.toLowerCase()} lead captured for ${lead.name}.`;

const ROI_BY_PAIN_POINT: Record<LeadProfile['painPoint'], {
  hook: string;
  sms: string;
  email: string;
}> = {
  'Premiums spiked 18% at renewal': {
    hook: 'we can reverse the 18% hike',
    sms: 'Families in your stage are averaging a $412/yr reduction when they switch to Solisa.',
    email:
      'We see households in the same stage land $412 in annual savings by letting us re-rate the policy before renewal hits.',
  },
  'Agent never follows up': {
    hook: 'here’s how responsive coverage feels',
    sms: 'You’ll have an always-on agentic pod + a named advisor — no more waiting 5 days for a reply.',
    email:
      'Our clients move to a blended AI + licensed advisor model — every request gets an answer in <15 minutes, not days.',
  },
  'Coverage gaps for new assets': {
    hook: 'we close the gaps on day one',
    sms: 'We automatically surface add-ons the moment new assets appear so nothing slips through.',
    email:
      'The engine inspects new dependents, renovations, and vehicles, so your coverage always matches real life.',
  },
  'Claims experience was slow': {
    hook: 'let’s rebuild the claims experience',
    sms: 'Our concierge team handles adjusters while the AI preps documentation before the first call.',
    email:
      'When issues pop up, we pre-fill claims packets and escalate directly to senior adjusters to cut the cycle time.',
  },
  'Bundle discounts not applied': {
    hook: 'unlock the bundle discounts you were promised',
    sms: 'We rebalance the portfolio across home + auto to surface the missing discounts automatically.',
    email:
      'Expect a full repricing that blends home, auto, and umbrella so every eligible discount hits your renewal.',
  },
};

const CALENDAR_LINK_BASE = 'https://calendly.com/solisa/intro';

export const buildCalendarLink = (lead: LeadProfile) => {
  const params = new URLSearchParams({
    name: lead.name,
    topic: `${lead.lifeEvent} · ${lead.insurer} renewal`,
  });

  return `${CALENDAR_LINK_BASE}?${params.toString()}`;
};

const DEFAULT_CALENDAR_SLOT = {
  label: 'Tuesday · 10:30 AM ET · 15 min strategy session',
  link: `${CALENDAR_LINK_BASE}?utm_campaign=agentic-demo`,
} as const;

const FALLBACK_ROI_COPY = {
  hook: 'let’s build the better policy',
  sms: 'Let’s unpack the renewal math together and make sure coverage matches your next chapter.',
  email:
    'We’ll review the renewal math, coverage gaps, and put proactive automations around every life event that hits.',
};

const buildFallbackSms = (lead: LeadProfile, roiCopy: { sms: string }) => {
  const firstName = lead.name.split(' ')[0] || lead.name;
  const roiCopy = ROI_BY_PAIN_POINT[lead.painPoint] ?? FALLBACK_ROI_COPY;
  const renewalLabel = formatRenewal(lead.renewalMonth);
  const renewalText = renewalLabel === 'their next renewal window' ? 'coming up soon' : `in ${renewalLabel}`;
  const calendar = {
    label: DEFAULT_CALENDAR_SLOT.label,
    link: buildCalendarLink(lead),
  };

  return `Hey ${firstName} — saw the ${lead.lifeEvent.toLowerCase()} update and your ${lead.insurer} renewal ${renewalText}. ${
    roiCopy.sms
  } Free for a ${lead.preferredChannel === 'SMS' ? 'quick text thread' : '15-min consult'} this week? Reply YES and I’ll lock a slot.`;
};

export const createOutreachPreview = (lead: LeadProfile, overrides?: { sms?: string; reasoning?: string }): OutreachPreview => {
  const firstName = lead.name.split(' ')[0] || lead.name;
  const roiCopy = ROI_BY_PAIN_POINT[lead.painPoint] ?? FALLBACK_ROI_COPY;
  const renewalLabel = formatRenewal(lead.renewalMonth);
  const renewalText = renewalLabel === 'their next renewal window' ? 'coming up soon' : `in ${renewalLabel}`;
  const calendar = {
    label: DEFAULT_CALENDAR_SLOT.label,
    link: buildCalendarLink(lead),
  };

  const sms = overrides?.sms ?? buildFallbackSms(lead, roiCopy);

  const emailSubject = `${firstName}, ${roiCopy.hook}`;

  const emailBody = `Hi ${firstName},\n\nAppreciate you flagging that ${lead.painPoint.toLowerCase()}. ${roiCopy.email}\n\nClay already highlighted the ${lead.lifeEvent.toLowerCase()} and Apollo confirms your ${lead.insurer} policy is ${renewalText}. I held a ${
    lead.preferredChannel === 'SMS' ? 'text-first recap' : '15-min Zoom'
  } for you (${calendar.label}). Feel free to reschedule here: ${calendar.link}\n\nTalk soon,\nSolisa AI SDR`;

  return {
    sms,
    reasoning: overrides?.reasoning,
    emailSubject,
    emailBody,
    calendar,
  };
};

export const createLeadInsights = (lead: LeadProfile) => [
  `Life event detected: ${lead.lifeEvent}.`,
  `Current carrier: ${lead.insurer}; renewal ${
    formatRenewal(lead.renewalMonth) === 'their next renewal window'
      ? 'window approaching'
      : `set for ${formatRenewal(lead.renewalMonth)}`
  }.`,
  `Primary pain point: ${lead.painPoint}.`,
];

export const sanitizeRenewalMonth = (value: string) => {
  if (!value) {
    return DEFAULT_LEAD.renewalMonth;
  }
  const [year, month] = value.split('-');
  if (!year || !month) {
    return DEFAULT_LEAD.renewalMonth;
  }
  const numericYear = Number(year);
  const numericMonth = Number(month);
  if (!Number.isInteger(numericYear) || !Number.isInteger(numericMonth)) {
    return DEFAULT_LEAD.renewalMonth;
  }
  if (numericMonth < 1 || numericMonth > 12) {
    return DEFAULT_LEAD.renewalMonth;
  }
  return `${numericYear.toString().padStart(4, '0')}-${numericMonth.toString().padStart(2, '0')}`;
};

export const FASTMCP_ENDPOINT = process.env.FASTMCP_API_URL ?? 'https://api.fastmcp.com/v1/compose';

export const generateFastMcpSms = async (lead: LeadProfile) => {
  const apiKey = process.env.FASTMCP_API_KEY ?? '<enter api>';
  if (!apiKey || apiKey.includes('<enter')) {
    return {
      sms: buildFallbackSms(lead, ROI_BY_PAIN_POINT[lead.painPoint] ?? FALLBACK_ROI_COPY),
      reasoning: 'FASTMCP API key missing. Using heuristic fallback copy.',
    };
  }

  try {
    const response = await fetch(FASTMCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        persona: lead.personaTone,
        goal: 'Craft an insurance SDR SMS with a YES/NO CTA for Calendly booking.',
        context: {
          name: lead.name,
          lifeEvent: lead.lifeEvent,
          insurer: lead.insurer,
          renewalMonth: lead.renewalMonth,
          painPoint: lead.painPoint,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`FastMCP responded with status ${response.status}`);
    }

    const data = (await response.json()) as { message?: string; reasoning?: string };
    return {
      sms: data.message ?? buildFallbackSms(lead, ROI_BY_PAIN_POINT[lead.painPoint] ?? FALLBACK_ROI_COPY),
      reasoning: data.reasoning ?? 'FastMCP composed this outreach message.',
    };
  } catch (error) {
    console.error('Failed to reach FastMCP', error);
    return {
      sms: buildFallbackSms(lead, ROI_BY_PAIN_POINT[lead.painPoint] ?? FALLBACK_ROI_COPY),
      reasoning: 'FastMCP call failed. Falling back to static template.',
    };
  }
};

const OPENAI_ENDPOINT = process.env.OPENAI_API_URL ?? 'https://api.openai.com/v1/chat/completions';

export const generateFollowUpEmail = async (lead: LeadProfile, objection: string) => {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.CHATGPT_API_KEY ?? '<enter api>';
  const subject = `${lead.name.split(' ')[0] || lead.name}, here’s the ROI proof you asked for`;
  const fallback = `Hi ${lead.name.split(' ')[0] || lead.name},\n\nYou mentioned "${objection}". Here’s the 2-minute breakdown on how Solisa addresses it for families navigating ${lead.lifeEvent.toLowerCase()}.\n\n• Renewal math: we’ve projected a ${lead.painPoint.toLowerCase()} reversal\n• Life-event coverage: proactive guardrails as your ${lead.lifeEvent.toLowerCase()} unfolds\n• Next step: the Calendly slot we held (${DEFAULT_CALENDAR_SLOT.label})\n\nTalk soon,\nSolisa AI SDR`;

  if (!apiKey || apiKey.includes('<enter')) {
    return { subject, body: fallback, reasoning: 'ChatGPT API key missing. Using scripted follow-up.' };
  }

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an SDR for Solisa Insurance. Write empathetic, data-backed follow-ups that cite renewal savings and next steps.',
          },
          {
            role: 'user',
            content: `Prospect details: ${JSON.stringify(lead)}. They objected with: ${objection}. Compose an email that closes the objection and reinforces the Calendly CTA.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI responded with status ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
    const body = data.choices?.[0]?.message?.content?.trim() ?? fallback;
    return {
      subject,
      body,
      reasoning: data.usage?.total_tokens ? `Generated via ChatGPT (${data.usage.total_tokens} tokens).` : 'Generated via ChatGPT.',
    };
  } catch (error) {
    console.error('Failed to reach OpenAI', error);
    return { subject, body: fallback, reasoning: 'ChatGPT call failed. Using scripted follow-up.' };
  }
};

export const buildFollowUpPlan = (lead: LeadProfile, objection: string): FollowUpAction[] => {
  const sms = `Alex here — appreciate the candor on "${objection}". Sending the ROI recap + life-event safety net we launched for families hitting ${lead.lifeEvent.toLowerCase()}. Want me to hold the ${DEFAULT_CALENDAR_SLOT.label} slot?`;
  return [
    {
      channel: 'SMS',
      title: 'Immediate objection defuse',
      body: sms,
      intent: 'objection',
    },
    {
      channel: 'Email',
      title: 'ROI proof pack',
      body: 'Summarise savings, attach renewal comparison, re-share Calendly link.',
      intent: 'nurture',
    },
    {
      channel: 'Task',
      title: 'Licensed agent callback',
      body: 'Schedule licensed agent to call with case study referencing objection.',
      intent: 'close',
    },
  ];
};

export const buildRetentionPlays = (lead: LeadProfile, lifeEvent: string): RetentionPlay[] => [
  {
    trigger: lifeEvent,
    action: `Send congrats SMS with bundled umbrella quote tailored to ${lead.lifeEvent.toLowerCase()}.`,
    scoreDelta: -12,
    channel: 'SMS',
  },
  {
    trigger: 'Policy health monitor',
    action: 'Auto-open task for advisor to audit coverage limits and dependent protections.',
    scoreDelta: -5,
    channel: 'Call',
  },
  {
    trigger: 'Upsell opportunity',
    action: 'Email pay-per-mile or umbrella upsell path with projected annual savings.',
    scoreDelta: -8,
    channel: 'Email',
  },
];
