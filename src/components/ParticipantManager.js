import React from 'react';
import './ParticipantManager.css';

function ParticipantManager({
  participants,
  activeParticipantId,
  onSelect,
  onRename,
  onAdd,
  onRemove,
}) {
  return (
    <div className="participant-manager">
      {participants.map((p) => (
        <div
          key={p.id}
          className={`participant-chip ${p.id === activeParticipantId ? 'active' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <input
            className="participant-name-input"
            value={p.name}
            onChange={(e) => onRename(p.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          {participants.length > 1 && (
            <button
              type="button"
              className="participant-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(p.id);
              }}
              aria-label={`${p.name} 삭제`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="participant-add-btn" onClick={onAdd}>
        + 참여자 추가
      </button>
    </div>
  );
}

export default ParticipantManager;
