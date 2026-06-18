import React, { useState, useEffect, useCallback } from 'react';
import { getCards, saveCard, deleteCard, savePerson, deletePerson, deleteCardsByPerson } from '../utils/db';
import { CARD_TYPES, CARD_TYPE_KEYS, groupCardsByMonth } from '../utils/cards';
import Card from './Card';
import AddCard from './AddCard';
import AIPanel from './AIPanel';

export default function PersonView({ person, apiKey, onRefresh, onDelete }) {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [aiOpen, setAiOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCards(person.id).then(setCards);
  }, [person.id]);

  const handleAddCard = useCallback(async (card) => {
    await saveCard(card);
    const updated = { ...person, cardCount: (person.cardCount || 0) + 1, updatedAt: Date.now() };
    await savePerson(updated);
    setCards(prev => [card, ...prev].sort((a, b) => b.date - a.date));
    onRefresh();
  }, [person, onRefresh]);

  const handleDeleteCard = useCallback(async (id) => {
    await deleteCard(id);
    setCards(prev => prev.filter(c => c.id !== id));
    const updated = { ...person, cardCount: Math.max(0, (person.cardCount || 1) - 1), updatedAt: Date.now() };
    await savePerson(updated);
    onRefresh();
  }, [person, onRefresh]);

  const handleDeletePerson = async () => {
    if (!window.confirm(`Delete everything about "${person.name}"? This cannot be undone.`)) return;
    await deleteCardsByPerson(person.id);
    await deletePerson(person.id);
    onDelete();
  };

  // Filter + search
  const filtered = cards.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.content?.toLowerCase().includes(q) ||
        c.note?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const grouped = groupCardsByMonth(filtered);

  const firstDate = cards.length > 0
    ? new Date(Math.min(...cards.map(c => c.date))).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      <div className="person-view" style={{ marginRight: aiOpen ? 380 : 0, transition: 'margin-right .25s ease' }}>
        {/* Topbar */}
        <div className="person-topbar">
          <div className="person-topbar-left">
            <h1>{person.name}</h1>
            <div className="person-topbar-meta">
              {cards.length} entries
              {firstDate && ` · since ${firstDate}`}
              {person.context && ` · ${person.context}`}
            </div>
          </div>
          <div className="topbar-right">
            <input
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
            />
            <button
              className={`btn-icon ${aiOpen ? 'active' : ''}`}
              onClick={() => setAiOpen(o => !o)}
            >
              ✦ Ask AI
            </button>
            <button className="btn-icon" onClick={handleDeletePerson} title="Delete person"
              style={{ color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>
        </div>

        {error && <div className="error-bar">⚠ {error}</div>}

        {/* Filter bar */}
        <div className="filter-bar">
          <button className={`filter-chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
            All
          </button>
          {CARD_TYPE_KEYS.map(k => (
            <button
              key={k}
              className={`filter-chip ${filterType === k ? 'active' : ''}`}
              onClick={() => setFilterType(filterType === k ? 'all' : k)}
            >
              {CARD_TYPES[k].icon} {CARD_TYPES[k].label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="timeline-wrap">
          <div className="timeline-inner">
            {filtered.length === 0 ? (
              <div className="empty-timeline">
                {cards.length === 0 ? (
                  <>
                    <div className="empty-title">Nothing here yet.</div>
                    <div className="empty-sub">
                      Start by logging your first memory, feeling, or moment below.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="empty-title">No matches.</div>
                    <div className="empty-sub">Try a different search or filter.</div>
                  </>
                )}
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.label} className="month-group">
                  <div className="month-label">{group.label}</div>
                  {group.cards.map(card => (
                    <Card key={card.id} card={card} onDelete={handleDeleteCard} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add card */}
        <AddCard personId={person.id} onAdd={handleAddCard} />
      </div>

      {/* AI Panel */}
      <AIPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        person={person}
        cards={cards}
        apiKey={apiKey}
      />
    </>
  );
}
