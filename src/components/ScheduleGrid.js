import React, { useRef, useEffect, useCallback } from 'react';
import { DAYS, SLOTS_PER_DAY, formatTime } from '../utils/schedule';
import './ScheduleGrid.css';

function ScheduleGrid({ interactive, getCellColor, getCellTitle, onPaintCell }) {
  const draggingRef = useRef(false);
  const dragStatusRef = useRef(null);

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    dragStatusRef.current = null;
  }, []);

  useEffect(() => {
    if (!interactive) return undefined;
    window.addEventListener('mouseup', stopDragging);
    return () => window.removeEventListener('mouseup', stopDragging);
  }, [interactive, stopDragging]);

  const handleMouseDown = (day, slotIndex) => {
    if (!interactive) return;
    const nextStatus = onPaintCell(day, slotIndex, null);
    draggingRef.current = true;
    dragStatusRef.current = nextStatus;
  };

  const handleMouseEnter = (day, slotIndex) => {
    if (!interactive || !draggingRef.current) return;
    onPaintCell(day, slotIndex, dragStatusRef.current);
  };

  return (
    <div className="schedule-grid-wrapper">
      <div
        className={`schedule-grid ${interactive ? 'interactive' : ''}`}
        style={{ gridTemplateColumns: `56px repeat(${DAYS.length}, 1fr)` }}
      >
        <div className="grid-corner" />
        {DAYS.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        {Array.from({ length: SLOTS_PER_DAY }).map((_, slotIndex) => (
          <React.Fragment key={slotIndex}>
            <div className={`time-label ${slotIndex % 2 === 0 ? 'hour' : ''}`}>
              {slotIndex % 2 === 0 ? formatTime(slotIndex) : ''}
            </div>
            {DAYS.map((day) => (
              <div
                key={`${day}-${slotIndex}`}
                className={`slot-cell ${interactive ? 'interactive' : ''} ${
                  slotIndex % 2 === 1 ? 'half-hour' : ''
                }`}
                style={{ backgroundColor: getCellColor(day, slotIndex) }}
                title={getCellTitle ? getCellTitle(day, slotIndex) : undefined}
                onMouseDown={() => handleMouseDown(day, slotIndex)}
                onMouseEnter={() => handleMouseEnter(day, slotIndex)}
                onDragStart={(e) => e.preventDefault()}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ScheduleGrid;
