// Card types — each has a color, icon, label
export const CARD_TYPES = {
  event: {
    label: 'Event',
    icon: '📅',
    color: '#5b7fa6',
    bg: 'rgba(91,127,166,0.08)',
    border: 'rgba(91,127,166,0.22)',
    placeholder: 'What happened?',
    notePlaceholder: 'Any context or details...',
  },
  feeling: {
    label: 'Feeling',
    icon: '💭',
    color: '#a0789e',
    bg: 'rgba(160,120,158,0.08)',
    border: 'rgba(160,120,158,0.22)',
    placeholder: 'How did you feel?',
    notePlaceholder: 'What triggered this?',
  },
  quote: {
    label: 'Quote',
    icon: '💬',
    color: '#7a9e7e',
    bg: 'rgba(122,158,126,0.08)',
    border: 'rgba(122,158,126,0.22)',
    placeholder: 'Something they said...',
    notePlaceholder: 'Why this stood out...',
  },
  observation: {
    label: 'Observation',
    icon: '🔍',
    color: '#c4975a',
    bg: 'rgba(196,151,90,0.08)',
    border: 'rgba(196,151,90,0.22)',
    placeholder: 'Something you noticed about them...',
    notePlaceholder: 'What this tells you...',
  },
  milestone: {
    label: 'Milestone',
    icon: '⭐',
    color: '#c4705a',
    bg: 'rgba(196,112,90,0.09)',
    border: 'rgba(196,112,90,0.28)',
    placeholder: 'A turning point or important moment...',
    notePlaceholder: 'Why this mattered...',
  },
  photo: {
    label: 'Photo',
    icon: '🖼',
    color: '#888',
    bg: 'rgba(130,130,130,0.07)',
    border: 'rgba(130,130,130,0.2)',
    placeholder: 'Caption or description...',
    notePlaceholder: '',
  },
};

export const CARD_TYPE_KEYS = Object.keys(CARD_TYPES);

export function formatCardDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function groupCardsByMonth(cards) {
  const groups = {};
  cards.forEach(card => {
    const d = new Date(card.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { label, cards: [] };
    groups[key].cards.push(card);
  });
  return Object.values(groups).sort((a, b) => {
    const da = new Date(a.cards[0].date);
    const db = new Date(b.cards[0].date);
    return db - da;
  });
}
