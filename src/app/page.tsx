'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import { useTheme } from '@/contexts/ThemeContext';

type StepStatus = 'pending' | 'active' | 'done';

type LeadFormState = {
  name: string;
  company: string;
  source: string;
  preferredChannel: 'SMS' | 'Email';
  personaTone: string;
  lifeEvent: string;
  insurer: string;
  renewalMonth: string;
  painPoint: string;
};

type StepBlueprint = {
  id: string;
  title: string;
  description: string;
  logMessage: string;
};

type SimulationStep = StepBlueprint & {
  status: StepStatus;
};

const defaultLead: LeadFormState = {
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

const lifeEvents = [
  'New baby',
  'New home purchase',
  'Teen driver added',
  'Job change',
  'New car lease',
];

const insurers = [
  'State Farm',
  'Geico',
  'Progressive',
  'Allstate',
  'Liberty Mutual',
];

const painPoints = [
  'Premiums spiked 18% at renewal',
  'Agent never follows up',
  'Coverage gaps for new assets',
  'Claims experience was slow',
  'Bundle discounts not applied',
];

const personaTones = [
  'Warm & concise',
  'Direct & data-backed',
  'Playful & upbeat',
  'Executive brief',
];

const communicationChannels: LeadFormState['preferredChannel'][] = ['SMS', 'Email'];

const formatRenewal = (renewalMonth: string) => {
  if (!renewalMonth) return 'their next renewal window';
  const [year, month] = renewalMonth.split('-').map((part) => parseInt(part, 10));
  if (!year || !month) return 'their next renewal window';
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const buildLeadBlueprints = (lead: LeadFormState): StepBlueprint[] => [
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

const enrichmentVendors = [
  {
    name: 'Clay',
    focus: 'Life-stage & employment intelligence',
    bullets: [
      'Surface mortgages, relocations, and family updates from public records',
      'Auto-sync enriched fields back into HubSpot or Salesforce',
      'Trigger workflows the moment a life event hits Clay feeds',
    ],
  },
  {
    name: 'Apollo.io',
    focus: 'Intent + insurer graph',
    bullets: [
      'Map current carrier and renewal cadence from verified contact graph',
      'Monitor insurance intent keywords across G2, Reddit, and review sites',
      'Score urgency using Apollo’s buying-stage signals',
    ],
  },
  {
    name: 'Clearbit',
    focus: 'Firmographics & spend signals',
    bullets: [
      'Append revenue, HQ location, and fleet counts for commercial policies',
      'Detect budget expansion or cost-cut programs from spend models',
      'Keep email and phone records verified before outreach fires',
    ],
  },
];

const followUpPlaybook = [
  {
    channel: 'SMS',
    outcome: 'Cost objection surfaced',
    copy: '“Hey Alex — understood on pricing. Sending you the pay-per-mile case study showing how families with newborns saved $412/yr. Free to review before Thursday?”',
  },
  {
    channel: 'Email',
    outcome: 'Share ROI proof',
    copy: 'Subject: “Alex, 3 min recap + real renewal math”\n\nKey bullets, forecasted savings, and embedded Calendly with the exact slot they mentioned.',
  },
  {
    channel: 'Agent handoff',
    outcome: 'Escalate with full brief',
    copy: '“They said ‘too expensive’ twice. Here’s the ROI calculator, loss-run summary, and call script with empathy-led opener.”',
  },
];

const retentionMoments = [
  {
    trigger: 'New baby detected in household',
    actions: [
      'Send congrats SMS with bundled umbrella + life quote',
      'Re-score risk and adjust policy health score to 42 → escalate',
      'Open task for agent to review additional dependent coverage',
    ],
  },
  {
    trigger: 'Policy anniversary at 24 months',
    actions: [
      'Deliver loyalty email with $50 renewal credit',
      'Upsell renters → homeowners upgrade playbook',
      'Invite to refer-a-friend program via text',
    ],
  },
  {
    trigger: 'Driving drops 40% (telematics)',
    actions: [
      'Offer pay-per-mile option with projected $340 savings',
      'Schedule proactive policy review call',
      'Update churn prediction model and notify success team',
    ],
  },
];

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState<LeadFormState>(defaultLead);
  const [blueprints, setBlueprints] = useState<StepBlueprint[]>(() => buildLeadBlueprints(defaultLead));
  const [steps, setSteps] = useState<SimulationStep[]>(() =>
    buildLeadBlueprints(defaultLead).map((step, index) => ({
      ...step,
      status: index === 0 ? 'active' : 'pending',
    }))
  );
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;
    const timeout = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timeout);
  }, [isAnimating]);

  useEffect(() => {
    if (!isRunning || blueprints.length === 0) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    blueprints.forEach((blueprint, index) => {
      timers.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((step, stepIndex) => {
              if (stepIndex < index) {
                return { ...step, status: 'done' };
              }
              if (stepIndex === index) {
                return { ...step, status: 'active' };
              }
              return { ...step, status: 'pending' };
            })
          );

          setLogEntries((prev) => [...prev, blueprint.logMessage]);
        }, index * 900)
      );
    });

    timers.push(
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === prev.length - 1 ? 'done' : step.status,
          }))
        );
        setIsRunning(false);
      }, blueprints.length * 900 + 400)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isRunning, blueprints, runId]);

  const handleInputChange = (field: keyof LeadFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      field === 'preferredChannel'
        ? (event.target.value as LeadFormState['preferredChannel'])
        : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const leadSnapshot = { ...formData };
    const newBlueprints = buildLeadBlueprints(leadSnapshot);
    setBlueprints(newBlueprints);
    setSteps(
      newBlueprints.map((step, index) => ({
        ...step,
        status: index === 0 ? 'active' : 'pending',
      }))
    );
    setLogEntries([
      `New ${leadSnapshot.source.toLowerCase()} lead captured for ${leadSnapshot.name}.`,
    ]);
    setIsRunning(true);
    setRunId((prev) => prev + 1);
  };

  const getGradientStyle = (progress: number) => {
    const darkColor = 'rgba(24, 24, 27, 1)';
    const lightColor = 'rgba(255, 255, 255, 1)';
    const transparentColor = 'rgba(0, 0, 0, 0)';

    const fromColor = isDarkMode ? lightColor : darkColor;
    const toColor = isDarkMode ? darkColor : lightColor;

    return `radial-gradient(circle at ${animationOrigin.x}px ${animationOrigin.y}px,
      ${fromColor} 0%,
      ${fromColor} ${progress * 100}%,
      ${transparentColor} ${progress * 100}%,
      ${transparentColor} 100%)`;
  };

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key="theme-overlay"
            initial={{ background: getGradientStyle(0) }}
            animate={{ background: getGradientStyle(1) }}
            exit={{ background: getGradientStyle(0) }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onAnimationComplete={() => setIsAnimating(false)}
            className="pointer-events-none fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      <div className="aurora-blur" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-12">
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-[0.3em] text-sky-500">Solisa Agentic Engine</span>
            <span className="text-sm text-slate-500 dark:text-slate-300">Every lead, every moment, automatically handled.</span>
          </div>
          <ThemeSwitch
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            setIsAnimating={setIsAnimating}
            setAnimationOrigin={setAnimationOrigin}
          />
        </header>

        <main className="flex flex-col gap-20">
          <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Insurance shouldn’t be annual shopping. It should be a living relationship.
              </motion.h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Build the Agentic Engine that turns every lead into a customer and every customer into an advocate. Watch Phase 1 auto-enrich a lead, fire hyper-personalised outreach, and book the meeting — all in under two minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
                  Phase 1 · AI Lead Gen + SDR
                </span>
                <span className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
                  Phase 2 · Follow-up Brain
                </span>
                <span className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
                  Phase 3 · Lifeline Retention
                </span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-zinc-900/70"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Demo Goal</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Visitor fills the form → AI sends personalised SMS → prospect replies “yes” → meeting booked in Calendly.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">1</span>
                  <span>Auto-enrich with Clay, Apollo, Clearbit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">2</span>
                  <span>Generate tone-perfect outreach in seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">3</span>
                  <span>Book the calendar automatically</span>
                </div>
              </div>
            </motion.div>
          </section>

          <section id="phase-one" className="space-y-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Phase 1 · AI Lead Gen + SDR Agent</h2>
                <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                  Feed any inbound signal and watch the Agentic Engine enrich the record, compose a personalised sequence, and confirm the meeting before a human ever touches the lead.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData(defaultLead);
                  setBlueprints(buildLeadBlueprints(defaultLead));
                  setSteps(
                    buildLeadBlueprints(defaultLead).map((step, index) => ({
                      ...step,
                      status: index === 0 ? 'active' : 'pending',
                    }))
                  );
                  setLogEntries([]);
                  setIsRunning(false);
                }}
                className="h-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:text-slate-200"
              >
                Reset demo inputs
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-zinc-900/70"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Lead capture</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Hyper-personalise in seconds</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Name</span>
                    <input
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Company</span>
                    <input
                      value={formData.company}
                      onChange={handleInputChange('company')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Lead source</span>
                    <input
                      value={formData.source}
                      onChange={handleInputChange('source')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Preferred channel</span>
                    <select
                      value={formData.preferredChannel}
                      onChange={handleInputChange('preferredChannel')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
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
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Preferred tone</span>
                    <select
                      value={formData.personaTone}
                      onChange={handleInputChange('personaTone')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    >
                      {personaTones.map((tone) => (
                        <option key={tone} value={tone}>
                          {tone}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Life event</span>
                    <select
                      value={formData.lifeEvent}
                      onChange={handleInputChange('lifeEvent')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    >
                      {lifeEvents.map((event) => (
                        <option key={event} value={event}>
                          {event}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Current insurer</span>
                    <select
                      value={formData.insurer}
                      onChange={handleInputChange('insurer')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    >
                      {insurers.map((carrier) => (
                        <option key={carrier} value={carrier}>
                          {carrier}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Renewal month</span>
                    <input
                      type="month"
                      value={formData.renewalMonth}
                      onChange={handleInputChange('renewalMonth')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Top pain point</span>
                  <select
                    value={formData.painPoint}
                    onChange={handleInputChange('painPoint')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-zinc-900 dark:text-slate-100 dark:focus:ring-sky-500/30"
                  >
                    {painPoints.map((pain) => (
                      <option key={pain} value={pain}>
                        {pain}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus:ring-sky-500/40 dark:focus:ring-offset-zinc-900"
                  disabled={isRunning}
                >
                  {isRunning ? 'Running playbook…' : 'Run auto-enrichment & outreach'}
                </button>
              </form>

              <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-zinc-900/70">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Automation timeline</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRunning
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isRunning ? 'In progress' : 'Live'}
                  </span>
                </div>
                <div className="space-y-5">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 transition ${
                        step.status === 'active'
                          ? 'border-sky-500 bg-sky-500/10'
                          : step.status === 'done'
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                        <span
                          className={`text-xs uppercase tracking-wide ${
                            step.status === 'active'
                              ? 'text-sky-600 dark:text-sky-400'
                              : step.status === 'done'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.status === 'active' ? 'Now' : step.status === 'done' ? 'Completed' : 'Queued'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-inner dark:border-slate-700 dark:bg-zinc-950/40 dark:text-slate-300">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Agent console feed</h4>
                  <div className="mt-3 space-y-2">
                    {logEntries.length === 0 ? (
                      <p>No events yet. Launch the playbook to see live updates.</p>
                    ) : (
                      logEntries.map((entry, index) => (
                        <div key={`${entry}-${index}`} className="flex gap-2">
                          <span className="text-slate-400">{index + 1}.</span>
                          <span>{entry}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Auto-enrich with best-in-class data partners</h2>
                <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
                  Plug Clay, Apollo, and Clearbit into the Agentic Engine to fill every contextual gap automatically. No spreadsheets, no manual research.
                </p>
              </div>
              <span className="rounded-full border border-slate-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-slate-600"><strong>Clay</strong> · <strong>Apollo.io</strong> · <strong>Clearbit</strong></span>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {enrichmentVendors.map((vendor) => (
                <div
                  key={vendor.name}
                  className="h-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl dark:border-slate-700 dark:bg-zinc-900/70"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{vendor.name}</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Data feed</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{vendor.focus}</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {vendor.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-[6px] size-1.5 rounded-full bg-sky-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Phase 2 · Agentic Follow-up Brain</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Never lose context across 10+ touchpoints. Every call transcript, text, and email flows into the brain to surface the next best action instantly.
                </p>
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-zinc-900/70">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Next best actions</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {followUpPlaybook.map((play) => (
                      <li key={play.channel} className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-sm dark:border-slate-600/60 dark:bg-zinc-950/40">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                          <span>{play.channel}</span>
                          <span>{play.outcome}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{play.copy}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-500/15 via-transparent to-purple-500/15 p-6 shadow-xl dark:border-slate-700 dark:from-sky-500/20 dark:to-purple-500/20">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Messy call → orchestrated follow-up</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Upload a 7-minute call recording. The engine extracts objections, intent shifts, and sentiment in seconds, then autowrites two SMS + an email before booking the second call.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-600/70 dark:bg-zinc-950/40">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Intent shift detected</p>
                    <p className="mt-1">“Just browsing” → “Ready to switch if pricing lands under $220/mo.”</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-600/70 dark:bg-zinc-950/40">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Escalation brief</p>
                    <p className="mt-1">Agent receives context pack: objection timeline, ROI calculator link, empathy-driven script, and recommended closing question.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Phase 3 · Lifeline Retention Agent</h2>
                <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
                  Predict churn 90 days out and trigger proactive touches that feel human. Policy health scores, life events, and special occasions become revenue moments.
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">Policy health score · Occasion engine · Upsell path</span>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {retentionMoments.map((moment) => (
                <div
                  key={moment.trigger}
                  className="h-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl dark:border-slate-700 dark:bg-zinc-900/70"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trigger</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{moment.trigger}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {moment.actions.map((action) => (
                      <li key={action} className="flex items-start gap-2">
                        <span className="mt-[6px] size-1.5 rounded-full bg-emerald-400" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-xl backdrop-blur dark:border-slate-700 dark:bg-zinc-900/70">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Ready to see it against your book?</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Connect your CRM, drop in Clay and Apollo keys, and let the Agentic Engine orchestrate lead gen, follow-up, and retention without manual work.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus:ring-sky-500/40 dark:focus:ring-offset-zinc-900">
                Launch full workflow demo
              </button>
              <button className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:text-slate-200">
                Download solution brief
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
