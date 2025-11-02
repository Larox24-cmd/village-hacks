'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DEFAULT_LEAD,
  communicationChannels,
  createLeadBlueprints,
  createLeadInsights,
  createOutreachPreview,
  buildRetentionPlays,
  lifeEvents,
  insurers,
  painPoints,
  personaTones,
  type LeadProfile,
  type OutreachPreview,
  type StepBlueprint,
  type FollowUpAction,
  type RetentionPlay,
} from '@/lib/agentic-engine';

const initialBlueprints = createLeadBlueprints(DEFAULT_LEAD);
const initialInsights = createLeadInsights(DEFAULT_LEAD);
const initialOutreach = createOutreachPreview(DEFAULT_LEAD);
const initialRetention = buildRetentionPlays(DEFAULT_LEAD, DEFAULT_LEAD.lifeEvent);

type PhaseView = 'customer' | 'owner';

type ApiTimeline = StepBlueprint;

type DashboardLead = {
  lead: {
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
    status: string;
    created_at: string;
    updated_at: string;
  };
  interactions: Array<{
    id: number;
    phase: string;
    channel: string;
    summary: string;
    created_at: string;
    payload?: Record<string, unknown> | null;
  }>;
  tasks: Array<{
    id: number;
    action_type: string;
    status: string;
    summary: string;
    due_at: string | null;
    created_at: string;
  }>;
  retentionEvents: Array<{
    id: number;
    event_type: string;
    detected_at: string;
    message: string;
    created_at: string;
  }>;
};

type PhaseOneResult = {
  leadId?: number | null;
  timeline: ApiTimeline[];
  outreach: OutreachPreview;
  insights: string[];
  followUpPlan: FollowUpAction[];
  followUpEmail: { subject: string; body: string; reasoning?: string };
  retention: RetentionPlay[];
};

type PhaseTwoResult = {
  email?: { subject: string; body: string; reasoning?: string };
  plan?: FollowUpAction[];
};

type PhaseThreeResult = {
  plays?: RetentionPlay[];
};

const fieldClasses =
  'w-full rounded-md border border-slate-700/20 bg-slate-900/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700/40 dark:bg-slate-900/60';

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200/40 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
    {children}
  </div>
);

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [viewPhaseOne, setViewPhaseOne] = useState<PhaseView>('customer');
  const [viewPhaseTwo, setViewPhaseTwo] = useState<PhaseView>('owner');
  const [viewPhaseThree, setViewPhaseThree] = useState<PhaseView>('owner');

  const [leadForm, setLeadForm] = useState<LeadProfile>({ ...DEFAULT_LEAD });
  const [phaseOneState, setPhaseOneState] = useState<PhaseOneResult>({
    leadId: null,
    timeline: initialBlueprints,
    outreach: initialOutreach,
    insights: initialInsights,
    followUpPlan: [],
    followUpEmail: { subject: '', body: '' },
    retention: initialRetention,
  });
  const [phaseTwoState, setPhaseTwoState] = useState<PhaseTwoResult>({});
  const [phaseThreeState, setPhaseThreeState] = useState<PhaseThreeResult>({});

  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFollowUpSubmitting, setIsFollowUpSubmitting] = useState(false);
  const [isRetentionSubmitting, setIsRetentionSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLead = useMemo(
    () => leads.find((entry) => entry.lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const refreshLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/agentic-demo/leads?details=true&limit=20', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load leads');
      }
      const data = (await response.json()) as { leads: DashboardLead[] };
      setLeads(data.leads ?? []);
      if (!selectedLeadId && data.leads?.length) {
        setSelectedLeadId(data.leads[0].lead.id);
      }
    } catch (loadError) {
      console.error(loadError);
    }
  }, [selectedLeadId]);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  const handleLeadFieldChange = <K extends keyof LeadProfile>(field: K, value: LeadProfile[K]) => {
    setLeadForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitPhaseOne = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmittingLead(true);
    try {
      const response = await fetch('/api/agentic-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors?.[0] ?? data.error ?? 'Failed to run simulation');
      }
      const result: PhaseOneResult = {
        leadId: data.leadId ?? null,
        timeline: data.timeline,
        outreach: data.outreach,
        insights: data.insights,
        followUpPlan: data.followUpPlan,
        followUpEmail: data.followUpEmail,
        retention: data.retention,
      };
      setPhaseOneState(result);
      await refreshLeads();
      if (data.leadId) {
        setSelectedLeadId(data.leadId);
      }
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit lead');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const confirmYes = async () => {
    if (!phaseOneState.leadId) return;
    setIsConfirming(true);
    setError(null);
    try {
      const response = await fetch('/api/agentic-demo/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: phaseOneState.leadId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to confirm response');
      }
      await refreshLeads();
      alert(`Calendly link ready: ${data.calendarLink}`);
    } catch (confirmError) {
      console.error(confirmError);
      setError(confirmError instanceof Error ? confirmError.message : 'Unable to confirm response');
    } finally {
      setIsConfirming(false);
    }
  };

  const runFollowUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLeadId) {
      setError('Please select a lead first.');
      return;
    }
    const formData = new FormData(event.currentTarget);
    const objection = String(formData.get('objection') ?? phaseOneState.followUpPlan[0]?.body ?? '');
    const channel = String(formData.get('channel') ?? 'SMS') as 'SMS' | 'Email' | 'Call' | 'Task';
    const note = String(formData.get('note') ?? '');
    const dueAt = String(formData.get('dueAt') ?? '') || null;

    setIsFollowUpSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/agentic-demo/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId, channel, objection, note, dueAt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to run follow-up');
      }
      setPhaseTwoState({ email: data.email, plan: data.plan });
      await refreshLeads();
    } catch (followError) {
      console.error(followError);
      setError(followError instanceof Error ? followError.message : 'Unable to run follow-up');
    } finally {
      setIsFollowUpSubmitting(false);
    }
  };

  const runRetention = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLeadId) {
      setError('Please select a lead first.');
      return;
    }
    const formData = new FormData(event.currentTarget);
    const eventType = String(formData.get('lifeEvent') ?? '');
    if (!eventType) {
      setError('Choose a life event to trigger.');
      return;
    }

    setIsRetentionSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/agentic-demo/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId, lifeEvent: eventType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to trigger retention play');
      }
      setPhaseThreeState({ plays: data.plays });
      await refreshLeads();
    } catch (retentionError) {
      console.error(retentionError);
      setError(retentionError instanceof Error ? retentionError.message : 'Unable to run retention play');
    } finally {
      setIsRetentionSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <header className="border-b border-slate-200/40 bg-white/60 py-8 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Solisa Agentic Engine</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Turn every insurance lead into a booked, retained customer. Phase-aware automation captures context, orchestrates
              follow-ups, and proactively protects renewals.
            </p>
          </div>
          <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div className="mx-auto mt-10 max-w-6xl space-y-12 px-6">
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-100/40 p-4 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Phase 1 · AI Lead Gen + SDR</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Capture a lead, enrich via Clay/Apollo, compose a FastMCP-powered SMS, and auto-book Calendly when they reply YES.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewPhaseOne('customer')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseOne === 'customer' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Customer view
              </button>
              <button
                type="button"
                onClick={() => setViewPhaseOne('owner')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseOne === 'owner' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Owner console
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <SectionCard>
              <form onSubmit={submitPhaseOne} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Full name
                    <input
                      value={leadForm.name}
                      onChange={(event) => handleLeadFieldChange('name', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                      placeholder="Alex Johnson"
                      required
                    />
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Company
                    <input
                      value={leadForm.company}
                      onChange={(event) => handleLeadFieldChange('company', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                      placeholder="Household or business"
                    />
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Source
                    <input
                      value={leadForm.source}
                      onChange={(event) => handleLeadFieldChange('source', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                      placeholder="Website form"
                      required
                    />
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Preferred Channel
                    <select
                      value={leadForm.preferredChannel}
                      onChange={(event) => handleLeadFieldChange('preferredChannel', event.target.value as LeadProfile['preferredChannel'])}
                      className={`${fieldClasses} mt-1`}
                      required
                    >
                      {communicationChannels.map((channel) => (
                        <option key={channel} value={channel}>
                          {channel}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Persona tone
                    <select
                      value={leadForm.personaTone}
                      onChange={(event) => handleLeadFieldChange('personaTone', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                    >
                      {personaTones.map((tone) => (
                        <option key={tone} value={tone}>
                          {tone}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Life event
                    <select
                      value={leadForm.lifeEvent}
                      onChange={(event) => handleLeadFieldChange('lifeEvent', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                      required
                    >
                      {lifeEvents.map((event) => (
                        <option key={event} value={event}>
                          {event}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Current insurer
                    <select
                      value={leadForm.insurer}
                      onChange={(event) => handleLeadFieldChange('insurer', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                    >
                      {insurers.map((insurer) => (
                        <option key={insurer} value={insurer}>
                          {insurer}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Renewal month
                    <input
                      type="month"
                      value={leadForm.renewalMonth}
                      onChange={(event) => handleLeadFieldChange('renewalMonth', event.target.value)}
                      className={`${fieldClasses} mt-1`}
                      required
                    />
                  </label>
                </div>

                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Pain point
                  <select
                    value={leadForm.painPoint}
                    onChange={(event) => handleLeadFieldChange('painPoint', event.target.value)}
                    className={`${fieldClasses} mt-1`}
                    required
                  >
                    {painPoints.map((pain) => (
                      <option key={pain} value={pain}>
                        {pain}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    FastMCP + ChatGPT keys are read from environment variables (set FASTMCP_API_KEY, OPENAI_API_KEY). Leave as
                    &quot;&lt;enter api&gt;&quot; to use fallback copy.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingLead ? 'Running agentic flow…' : 'Run Phase 1 demo'}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard>
              {viewPhaseOne === 'customer' ? (
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">SMS to prospect</h3>
                    <p className="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-50/60 p-3 text-indigo-900 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-100">
                      {phaseOneState.outreach.sms || 'Submit the form to generate personalized outreach.'}
                    </p>
                    {phaseOneState.outreach.reasoning && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{phaseOneState.outreach.reasoning}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email preview</h3>
                    <div className="mt-2 rounded-lg border border-slate-200/40 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-900 dark:text-white">{phaseOneState.outreach.emailSubject}</p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {phaseOneState.outreach.emailBody || 'Email copy will appear here once the lead is submitted.'}
                      </pre>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Calendly slot</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{phaseOneState.outreach.calendar.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={confirmYes}
                      disabled={!phaseOneState.leadId || isConfirming}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isConfirming ? 'Booking…' : 'Prospect replied “YES”'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Automation timeline</h3>
                    <ul className="mt-3 space-y-2">
                      {phaseOneState.timeline.map((step) => (
                        <li key={step.id} className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                          <p className="font-medium text-slate-900 dark:text-white">{step.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{step.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Insights captured</h3>
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300">
                      {phaseOneState.insights.map((insight) => (
                        <li key={insight}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Next steps</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300">
                      {phaseOneState.followUpPlan.map((step) => (
                        <li key={`${step.channel}-${step.title}`}>
                          <span className="font-semibold">{step.channel}:</span> {step.title} · {step.body}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI email draft</h3>
                    <div className="mt-2 rounded-lg border border-slate-200/40 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-900 dark:text-white">{phaseOneState.followUpEmail.subject}</p>
                      <pre className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {phaseOneState.followUpEmail.body || 'Follow-up email will be generated during the SDR workflow.'}
                      </pre>
                      {phaseOneState.followUpEmail.reasoning && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{phaseOneState.followUpEmail.reasoning}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Phase 2 · Agentic Follow-Up Brain</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Keep every touchpoint in context, defuse objections, and spin up SMS, email, call scripts, and tasks automatically.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewPhaseTwo('customer')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseTwo === 'customer' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Customer view
              </button>
              <button
                type="button"
                onClick={() => setViewPhaseTwo('owner')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseTwo === 'owner' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Owner console
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <SectionCard>
              <form onSubmit={runFollowUp} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Lead
                    <select
                      value={selectedLeadId ?? ''}
                      onChange={(event) => {
                        const { value } = event.target;
                        setSelectedLeadId(value ? Number(value) : null);
                      }}
                      className={`${fieldClasses} mt-1`}
                    >
                      <option value="" disabled>
                        Select lead
                      </option>
                      {leads.map((entry) => (
                        <option key={entry.lead.id} value={entry.lead.id}>
                          {entry.lead.name} · {entry.lead.life_event}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Channel
                    <select name="channel" className={`${fieldClasses} mt-1`} defaultValue="SMS">
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                      <option value="Call">Call</option>
                      <option value="Task">Task</option>
                    </select>
                  </label>
                </div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Objection captured
                  <input name="objection" placeholder="Too expensive" className={`${fieldClasses} mt-1`} />
                </label>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Note to log
                  <textarea name="note" rows={3} className={`${fieldClasses} mt-1`} placeholder="Summarize the call insight" />
                </label>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Due date (for tasks)
                  <input type="datetime-local" name="dueAt" className={`${fieldClasses} mt-1`} />
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isFollowUpSubmitting}
                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFollowUpSubmitting ? 'Generating…' : 'Create next best action'}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard>
              {viewPhaseTwo === 'customer' ? (
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">SMS response</h3>
                    <p className="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-50/60 p-3 text-indigo-900 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-100">
                      {phaseTwoState.plan?.find((action) => action.channel === 'SMS')?.body ??
                        'Generate a follow-up to preview the customer-facing copy.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email follow-up</h3>
                    <div className="mt-2 rounded-lg border border-slate-200/40 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-900 dark:text-white">{phaseTwoState.email?.subject}</p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {phaseTwoState.email?.body ?? 'Email copy will appear here after generating a follow-up.'}
                      </pre>
                      {phaseTwoState.email?.reasoning && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{phaseTwoState.email.reasoning}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Interaction log</h3>
                    <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2">
                      {selectedLead?.interactions?.length ? (
                        selectedLead.interactions.map((interaction) => (
                          <li
                            key={interaction.id}
                            className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/60"
                          >
                            <p className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>
                                {interaction.phase} · {interaction.channel}
                              </span>
                              <span>{formatDateTime(interaction.created_at)}</span>
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{interaction.summary}</p>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-500 dark:text-slate-400">No interactions logged yet.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Open tasks</h3>
                    <ul className="mt-3 space-y-2">
                      {selectedLead?.tasks?.length ? (
                        selectedLead.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="rounded-lg border border-amber-400/40 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-300/40 dark:bg-amber-500/10 dark:text-amber-100"
                          >
                            <p className="font-medium">{task.summary}</p>
                            <p className="text-xs">Due: {formatDateTime(task.due_at)}</p>
                            <p className="text-xs uppercase tracking-wide">Status: {task.status}</p>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-500 dark:text-slate-400">No tasks queued.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Phase 3 · Lifeline Retention Agent</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Detect life events, trigger proactive outreach, and guard renewals with health scoring + upsell plays.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewPhaseThree('customer')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseThree === 'customer' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Customer view
              </button>
              <button
                type="button"
                onClick={() => setViewPhaseThree('owner')}
                className={`rounded-full px-4 py-2 text-sm ${viewPhaseThree === 'owner' ? 'bg-indigo-600 text-white' : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                Owner console
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <SectionCard>
              <form onSubmit={runRetention} className="space-y-4">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Lead
                  <select
                    value={selectedLeadId ?? ''}
                    onChange={(event) => {
                      const { value } = event.target;
                      setSelectedLeadId(value ? Number(value) : null);
                    }}
                    className={`${fieldClasses} mt-1`}
                  >
                    <option value="" disabled>
                      Select lead
                    </option>
                    {leads.map((entry) => (
                      <option key={entry.lead.id} value={entry.lead.id}>
                        {entry.lead.name} · {entry.lead.life_event}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Trigger life event
                  <select name="lifeEvent" className={`${fieldClasses} mt-1`} defaultValue="New baby">
                    {lifeEvents.map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isRetentionSubmitting}
                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRetentionSubmitting ? 'Evaluating…' : 'Trigger life-event play'}
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard>
              {viewPhaseThree === 'customer' ? (
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Latest SMS</h3>
                    <p className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-50/60 p-3 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100">
                      {phaseThreeState.plays?.find((play) => play.channel === 'SMS')?.action ??
                        'Trigger a life event to preview the proactive retention SMS.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Upsell suggestion</h3>
                    <p className="mt-2 rounded-lg border border-slate-200/40 bg-white/70 p-3 text-xs text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300">
                      {phaseThreeState.plays?.find((play) => play.channel === 'Email')?.action ??
                        'Email playbooks for upsell will appear once a life event is triggered.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Retention plays</h3>
                    <ul className="mt-3 space-y-2">
                      {(phaseThreeState.plays ?? phaseOneState.retention).map((play) => (
                        <li key={`${play.channel}-${play.action}`} className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/60">
                          <p className="font-medium text-slate-900 dark:text-white">{play.channel} · {play.trigger}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{play.action}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-300">Health score shift: {play.scoreDelta}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Retention log</h3>
                    <ul className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-2">
                      {selectedLead?.retentionEvents?.length ? (
                        selectedLead.retentionEvents.map((event) => (
                          <li
                            key={event.id}
                            className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/60"
                          >
                            <p className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{event.event_type}</span>
                              <span>{formatDateTime(event.detected_at)}</span>
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{event.message}</p>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-500 dark:text-slate-400">No retention events yet.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Agent dashboard · All phases</h2>
          <SectionCard>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-3 py-2">Lead</th>
                    <th className="px-3 py-2">Life event</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Preferred channel</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Interactions</th>
                    <th className="px-3 py-2">Open tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((entry) => (
                    <tr
                      key={entry.lead.id}
                      className={`cursor-pointer border-t border-slate-200/40 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:bg-indigo-500/10 ${
                        selectedLeadId === entry.lead.id ? 'bg-indigo-100/40 dark:bg-indigo-500/10' : ''
                      }`}
                      onClick={() => setSelectedLeadId(entry.lead.id)}
                    >
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{entry.lead.name}</td>
                      <td className="px-3 py-2">{entry.lead.life_event}</td>
                      <td className="px-3 py-2">{entry.lead.status}</td>
                      <td className="px-3 py-2">{entry.lead.preferred_channel}</td>
                      <td className="px-3 py-2">{formatDateTime(entry.lead.created_at)}</td>
                      <td className="px-3 py-2">{entry.interactions.length}</td>
                      <td className="px-3 py-2">{entry.tasks.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
