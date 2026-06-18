import React, { useState, useRef } from 'react';
import { CARD_TYPES, CARD_TYPE_KEYS } from '../utils/cards';
import { v4 as uuid } from 'uuid';

export default function AddCard({ personId, onAdd }) {
  const [type, setType] = useState('event');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagInput, setTagInput] = useState('');
  const [imageData, setImageData] = useState(null);
  const fileRef = useRef();

  const current = CARD_TYPES[type];

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageData(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!content.trim() && type !== 'photo') return;
    if (type === 'photo' && !imageData && !content.trim()) return;

    const tags = tagInput.split(/[,\s]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean);
    const card = {
      id: uuid(),
      personId,
      type,
      content: content.trim(),
      note: note.trim() || null,
      date: new Date(date).getTime(),
      tags,
      imageData: type === 'photo' ? imageData : null,
      createdAt: Date.now(),
    };
    onAdd(card);
    setContent('');
    setNote('');
    setTagInput('');
    setImageData(null);
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="add-card-bar">
      <div className="add-card-inner">
        {/* Type selector */}
        <div className="type-selector">
          {CARD_TYPE_KEYS.map(k => {
            const t = CARD_TYPES[k];
            return (
              <button
                key={k}
                className={`type-btn ${type === k ? 'selected' : ''}`}
                style={type === k ? { borderColor: t.color, color: t.color, background: t.bg } : {}}
                onClick={() => setType(k)}
              >
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        <div className="add-form">
          {type === 'photo' ? (
            <div>
              {imageData ? (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <img src={imageData} alt="" style={{ maxHeight: 160, borderRadius: 8, display: 'block' }} />
                  <button onClick={() => setImageData(null)}
                    style={{ position: 'absolute', top: 6, right: 6, padding: '3px 8px', background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: 5, color: 'white', fontSize: 11, cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ) : (
                <label className="photo-label" onClick={() => fileRef.current.click()}>
                  🖼 Choose photo
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleImageFile(e.target.files[0])} />
                </label>
              )}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Caption (optional)..."
                rows={1}
                style={{ marginTop: 8 }}
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={current.placeholder}
              rows={type === 'feeling' || type === 'observation' ? 3 : 2}
              onKeyDown={e => e.key === 'Enter' && e.metaKey && handleSubmit()}
              autoFocus
            />
          )}

          {current.notePlaceholder && (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={current.notePlaceholder}
              rows={1}
              style={{ fontSize: 12, color: 'var(--text-secondary)' }}
            />
          )}

          <div className="add-form-meta">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="date-input"
            />
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="tags (comma separated)"
              className="tag-input"
            />
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={type !== 'photo' ? !content.trim() : (!imageData && !content.trim())}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
