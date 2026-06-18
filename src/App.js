import React, { useState, useEffect, useCallback } from 'react';
import { getPeople, savePerson, getSetting, setSetting } from './utils/db';
import { v4 as uuid } from 'uuid';
import PersonView from './components/PersonView';
import './App.css';

function SettingsModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);
  const handleSave = async () => {
    await onSave(key.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Settings</div>
        <div className="modal-sub">Your API key is stored locally in your browser and never sent anywhere except Anthropic directly.</div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Anthropic API Key</label>
          <input type="password" value={key} onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..." onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus />
        </div>
        <div className="privacy-note">
          🔒 All entries stored in IndexedDB (local browser storage). The AI feature calls Anthropic directly from your browser — no server in between.
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>{saved ? '✓ Saved' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function NewPersonModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: uuid(), name: name.trim(), context: context.trim(), createdAt: Date.now(), updatedAt: Date.now(), cardCount: 0 });
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">New person</div>
        <div className="modal-sub">Start a new memoir. You can add entries right away — no setup needed beyond a name.</div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Name or nickname *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex, 区块链哥, The One from Tokyo..."
              onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">One-line context (optional)</label>
            <input type="text" value={context} onChange={e => setContext(e.target.value)}
              placeholder="Met at a startup event, old friend, app match..." />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>Create</button>
        </div>
      </div>
    </div>
  );
}

function Welcome({ onOpenSettings, apiKey }) {
  return (
    <div className="welcome-view">
      <div className="welcome-inner">
        <div className="welcome-title">
          Your private<br /><span>memory keeper.</span>
        </div>
        <p className="welcome-sub">
          Memoir is a personal archive for the people who matter —
          the ones you can't stop thinking about, or the ones you don't want to forget.
          Log what happened, how it felt, what they said. Come back and remember.
        </p>
        <div className="welcome-hints">
          {[
            ['📅', 'Events — what happened, when'],
            ['💭', 'Feelings — how you felt in the moment'],
            ['💬', 'Quotes — things they said that stuck'],
            ['🔍', 'Observations — things you noticed about them'],
            ['⭐', 'Milestones — turning points in the story'],
            ['🖼', 'Photos — moments worth keeping'],
          ].map(([icon, text]) => (
            <div key={text} className="welcome-hint">
              <span className="hint-icon">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
            ← Create a new person to start.<br />
            {!apiKey && 'Set an API key in Settings to use the AI feature.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [people, setPeople] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const [ps, key] = await Promise.all([getPeople(), getSetting('apiKey')]);
      setPeople(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      if (key) setApiKey(key);
      setLoaded(true);
    }
    init();
  }, []);

  const refresh = useCallback(async () => {
    const ps = await getPeople();
    setPeople(ps.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, []);

  const handleSaveApiKey = async (key) => { await setSetting('apiKey', key); setApiKey(key); };

  const handleAddPerson = async (person) => {
    await savePerson(person);
    refresh();
    setActiveId(person.id);
    setShowNew(false);
  };

  const activePerson = people.find(p => p.id === activeId);

  if (!loaded) return <div className="app-loading"><div className="spinner" /></div>;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="app-wordmark">Memoir</div>
          <button className="btn-new-person" onClick={() => setShowNew(true)}>+ New person</button>
        </div>

        <div className="sidebar-list">
          {people.length === 0 && (
            <div style={{ padding: '18px 10px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              No one here yet.<br />Add someone to start.
            </div>
          )}
          {people.map(p => (
            <div key={p.id} className={`person-item ${activeId === p.id ? 'active' : ''}`}
              onClick={() => setActiveId(p.id)}>
              <div className="person-name">{p.name}</div>
              <div className="person-meta">
                {p.cardCount || 0} entries
                {p.updatedAt ? ` · ${new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="api-row">
            <div className={`api-dot ${apiKey ? 'on' : ''}`} />
            {apiKey ? 'AI ready' : 'No API key'}
          </div>
          <button className="btn-settings" onClick={() => setShowSettings(true)}>⚙ Settings</button>
        </div>
      </aside>

      {/* Main */}
      {activePerson ? (
        <PersonView
          key={activeId}
          person={activePerson}
          apiKey={apiKey}
          onRefresh={refresh}
          onDelete={() => { setActiveId(null); refresh(); }}
        />
      ) : (
        <Welcome apiKey={apiKey} onOpenSettings={() => setShowSettings(true)} />
      )}

      {showSettings && <SettingsModal apiKey={apiKey} onSave={handleSaveApiKey} onClose={() => setShowSettings(false)} />}
      {showNew && <NewPersonModal onSave={handleAddPerson} onClose={() => setShowNew(false)} />}
    </div>
  );
}
