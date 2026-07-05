import React from 'react';
import ScheduleGrid from './ScheduleGrid';
import {
  STATUS_COLOR,
  computeParticipantSummary,
  createEmptyAvailability,
} from '../utils/schedule';
import './CollapsibleSchedule.css';

function CollapsibleSchedule({ participant, availability, isOpen, onToggle }) {
  const data = availability[participant.id] || createEmptyAvailability();
  const summary = computeParticipantSummary(availability, participant.id);
  const regionId = `schedule-region-${participant.id}`;
  const headerId = `schedule-header-${participant.id}`;

  return (
    <div className={`collapsible ${isOpen ? 'open' : ''}`}>
      <h3 className="collapsible-heading">
        <button
          type="button"
          id={headerId}
          className="collapsible-trigger"
          aria-expanded={isOpen}
          aria-controls={regionId}
          onClick={() => onToggle(participant.id)}
        >
          <span className="collapsible-chevron" aria-hidden="true">
            ▶
          </span>
          <span className="collapsible-name">{participant.name}</span>
          <span className="collapsible-summary">
            <span className="summary-dot summary-available" />
            {summary.available}
            <span className="summary-dot summary-maybe" />
            {summary.maybe}
            <span className="summary-dot summary-unavailable" />
            {summary.unavailable}
          </span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        aria-labelledby={headerId}
        className="collapsible-panel"
        hidden={!isOpen}
      >
        <ScheduleGrid
          interactive={false}
          getCellColor={(day, slotIndex) => STATUS_COLOR[data[day][slotIndex]]}
        />
      </div>
    </div>
  );
}

export default CollapsibleSchedule;
