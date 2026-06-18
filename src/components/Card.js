import React, { useState } from 'react';
import { CARD_TYPES, formatCardDate } from '../utils/cards';

export default function Card({ card, onDelete, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const type = CARD_TYPES[card.type] || CARD_TYPES.event;

  const handleDelete = () => {
    if (confirmDelete) { onDelete(card.id); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); }
  };

  return (
    <div className={`card-item ${card.type === 'milestone' ? 'milestone-card' : ''}`}>
      <div className="card-line-wrap">
        <div className="card-dot" style={{ background: type.color }} />
        <div className="card-line" />
      </div>
      <div className="card-body">
        <div className="card-header">
          <div className="card-type-row">
            <span className="card-icon">{type.icon}</span>
            <span className="card-type-label" style={{ color: type.color }}>{type.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="card-date">{formatCardDate(card.date)}</span>
            <div className="card-actions">
              <button className="card-action-btn del" onClick={handleDelete}>
                {confirmDelete ? 'sure?' : '✕'}
              </button>
            </div>
          </div>
        </div>

        {card.type === 'photo' && card.imageData && (
          <img src={card.imageData} alt={card.content || ''} className="card-image" />
        )}

        <div className="card-content">
          <div className={`card-text ${card.type === 'quote' ? 'quote' : card.type === 'milestone' ? 'milestone' : ''}`}>
            {card.type === 'quote' ? `"${card.content}"` : card.content}
          </div>
          {card.note && (
            <div className="card-note">{card.note}</div>
          )}
        </div>

        {card.tags?.length > 0 && (
          <div className="card-tags">
            {card.tags.map((tag, i) => (
              <span key={i} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
