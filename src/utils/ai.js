const API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

async function call(apiKey, system, user, maxTokens = 1500) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// Summarize the full relationship arc
export async function summarizeRelationship(apiKey, person, cards) {
  const log = cards
    .slice(0, 80)
    .reverse()
    .map(c => {
      const date = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const typeLabel = c.type.toUpperCase();
      let content = c.content || '';
      if (c.type === 'quote') content = `"${c.content}"`;
      if (c.type === 'milestone') content = `[MILESTONE] ${c.content}`;
      return `${date} · ${typeLabel}: ${content}${c.note ? ` (note: ${c.note})` : ''}`;
    })
    .join('\n');

  const system = `You are a warm, perceptive friend reading through someone's personal journal about a relationship.
Write in a warm, direct, human voice — like a trusted friend summarizing what they've been reading.
No bullet points. Write flowing prose paragraphs. Be honest, kind, and specific.`;

  const prompt = `Here are journal entries about ${person.name}:
${person.context ? `Context: ${person.context}` : ''}

${log}

Write a summary of this relationship's story so far — the arc, the key moments, what seems to have shifted over time, and what stands out. 3-4 paragraphs. Be specific and reference actual things from the entries.`;

  return call(apiKey, system, prompt, 1000);
}

// Answer a freeform question about this relationship
export async function askAboutRelationship(apiKey, person, cards, question) {
  const log = cards
    .slice(0, 60)
    .reverse()
    .map(c => {
      const date = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${date} · ${c.type}: ${c.content}${c.note ? ` (${c.note})` : ''}`;
    })
    .join('\n');

  const system = `You are reading someone's private journal about a person they care about.
Answer their question thoughtfully, based on what's in the entries.
Be honest, warm, and specific. Never generic. If the entries don't have enough info to answer, say so directly.`;

  const prompt = `Journal entries about ${person.name}:
${person.context ? `Context: ${person.context}` : ''}

${log}

Question: ${question}`;

  return call(apiKey, system, prompt, 800);
}
