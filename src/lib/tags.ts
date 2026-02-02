/** Tag theme descriptions (200–400 chars). Used on /tag/[tag] pages. */
export const TAG_DESCRIPTIONS: Record<string, string> = {
  'attention-management':
    'Attention is your scarcest resource. These articles explore how to protect it, direct it deliberately, and design your environment and habits so that focus becomes sustainable rather than a constant struggle.',
  'deep-work':
    'Deep work demands uninterrupted focus on cognitively demanding tasks. Here we examine why it feels impossible for many knowledge workers, what gets in the way, and how to create conditions that support it.',
  'distraction':
    'Distraction is often a symptom rather than the cause. These pieces look at what underlies the urge to scatter attention—anxiety, fatigue, unclear priorities—and what actually helps.',
  'decision-fatigue':
    'Every choice costs cognitive resources. These articles explore how decision fatigue shapes focus, productivity, and financial behavior, and how to reduce unnecessary decisions.',
  'essentialism':
    'Doing less, better. Essentialism is about clarity on what matters and courage to say no. These pieces examine how it applies to work, habits, and intentional living.',
  'burnout':
    'Burnout is exhaustion that rest alone doesn\'t fix. These articles explore the patterns that lead to burnout—especially among high performers—and what sustainable work looks like instead.',
  'procrastination':
    'Procrastination is rarely laziness. It often masks fear, overwhelm, or unclear next steps. These pieces dig into why we avoid and what actually helps us move.',
  'overwhelm':
    'Too much to do, too little clarity. Overwhelm undermines focus and decision-making. These articles explore its causes and how to reduce cognitive load.',
  'remote-work':
    'Remote work changes how we structure our days, protect focus, and stay motivated. These pieces examine the specific challenges and opportunities of working from anywhere.',
  'knowledge-worker':
    'Knowledge work demands sustained attention, judgment, and creativity. These articles address the particular challenges of focusing when your output is thinking.',
  'time-blocking':
    'Time blocking can protect focus—or become another layer of pressure. These pieces explore when it helps, when it doesn\'t, and how to use it well.',
  'automation':
    'Automation can reduce cognitive load or add hidden complexity. These articles examine when to automate, when not to, and how to keep systems simple.',
  'adhd':
    'ADHD affects how attention and motivation work. These articles explore focus, habits, and productivity through that lens—practical and non-judgmental.',
  'freelance':
    'Freelancers face irregular income, blurred boundaries, and no built-in structure. These pieces address the specific challenges of working for yourself.',
  startup:
    'Startups demand high output under uncertainty. These articles explore focus, sustainability, and decision-making in fast-moving environments.',
};

/** Format a tag slug for display (e.g. "deep-work" → "Deep Work"). */
export function formatTagSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Get the theme description for a tag. Falls back to a generic message if none is defined. */
export function getTagDescription(tag: string): string {
  return (
    TAG_DESCRIPTIONS[tag] ??
    `Articles exploring ${formatTagSlug(tag)}—focus, attention, and intentional living.`
  );
}
