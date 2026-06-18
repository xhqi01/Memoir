import React, { useState, useRef, useEffect } from 'react';
import { summarizeRelationship, askAboutRelationship } from '../utils/ai';

const SUGGESTIONS = [
  'Summarize our story so far',
  'What patterns do you notice?',
  'What has changed over time?',
  'What stands out to you?',
];

export default function AIPanel({ open, onClose, person, cards, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (open && messages.length === 0) {
      // Auto-load summary when first opened
      handleAsk('Summarize our story so far', true);
    }
  }, [open]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = async (question, isAuto = false) => {
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Please set your API key in Settings first.' }]);
      return;
    }
    if (cards.length < 2) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Add at least 2 entries before asking — I need something to read.' }]);
      return;
    }

    if (!isAuto) {
      setMessages(prev => [...prev, { role: 'user', text: question }]);
    }
    setLoading(true);
    setInput('');

    try {
      let response;
      if (question.toLowerCase().includes('summarize') || question.toLowerCase().includes('summary') || question.toLowerCase().includes('story')) {
        response = await summarizeRelationship(apiKey, person, cards);
      } else {
        response = await askAboutRelationship(apiKey, person, cards, question);
      }
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    handleAsk(input.trim());
  };

  return (
    <div className={`ai-panel ${open ? 'open' : ''}`}>
      <div className="ai-panel-header">
        <div className="ai-panel-title">Ask about {person?.name}</div>
        <button className="ai-close" onClick={onClose}>✕</button>
      </div>

      <div className="ai-body">
        {messages.length === 0 && !loading && (
          <div className="ai-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="ai-suggestion" onClick={() => handleAsk(s)}>{s}</button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ${msg.role}`}>
            <div className="ai-message-label">{msg.role === 'user' ? 'You' : 'Memoir'}</div>
            <div className="ai-message-text">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="ai-loading">
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Reading your entries</span>
            <div className="ai-loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-footer">
        {messages.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {SUGGESTIONS.filter(s => !messages.some(m => m.text === s)).slice(0, 2).map((s, i) => (
              <button key={i} className="ai-suggestion" onClick={() => handleAsk(s)} style={{ marginBottom: 5 }}>{s}</button>
            ))}
          </div>
        )}
        <div className="ai-input-row">
          <input
            className="ai-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className="ai-send" onClick={handleSend} disabled={!input.trim() || loading}>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
