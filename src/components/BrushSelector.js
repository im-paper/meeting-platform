import React from 'react';
import { STATUS_LIST, STATUS_LABEL, STATUS_COLOR } from '../utils/schedule';
import './BrushSelector.css';

function BrushSelector({ brush, onSelect }) {
  return (
    <div className="brush-selector">
      {STATUS_LIST.map((status) => (
        <button
          key={status}
          type="button"
          className={`brush-btn ${brush === status ? 'active' : ''}`}
          style={{ '--brush-color': STATUS_COLOR[status] }}
          onClick={() => onSelect(status)}
        >
          <span className="brush-swatch" />
          {STATUS_LABEL[status]}
        </button>
      ))}
    </div>
  );
}

export default BrushSelector;
