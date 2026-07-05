import { useEffect, useState } from 'react';
import './App.css';
import ParticipantManager from './components/ParticipantManager';
import BrushSelector from './components/BrushSelector';
import ScheduleGrid from './components/ScheduleGrid';
import CollapsibleSchedule from './components/CollapsibleSchedule';
import {
  STATUS,
  STATUS_COLOR,
  createDefaultParticipants,
  createEmptyAvailability,
  computeAggregate,
  getAggregateColor,
  getAggregateTitle,
} from './utils/schedule';

const STORAGE_KEY = 'meeting-platform-data-v1';

function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.participants?.length && parsed.availability) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore corrupted storage and fall back to defaults
  }
  const participants = createDefaultParticipants();
  const availability = {};
  participants.forEach((p) => {
    availability[p.id] = createEmptyAvailability();
  });
  return { participants, availability };
}

function App() {
  const [participants, setParticipants] = useState(() => loadInitialState().participants);
  const [availability, setAvailability] = useState(() => loadInitialState().availability);
  const [activeParticipantId, setActiveParticipantId] = useState(
    () => loadInitialState().participants[0]?.id
  );
  const [brush, setBrush] = useState(STATUS.AVAILABLE);
  const [mode, setMode] = useState('input'); // 'input' | 'compare' | 'result'
  const [openPanels, setOpenPanels] = useState(() => new Set());

  const togglePanel = (id) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenPanels(new Set(participants.map((p) => p.id)));
  const collapseAll = () => setOpenPanels(new Set());

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ participants, availability })
    );
  }, [participants, availability]);

  const handleAddParticipant = () => {
    const newId = `p-${Date.now()}`;
    const newParticipant = { id: newId, name: `참여자 ${participants.length + 1}` };
    setParticipants((prev) => [...prev, newParticipant]);
    setAvailability((prev) => ({ ...prev, [newId]: createEmptyAvailability() }));
    setActiveParticipantId(newId);
  };

  const handleRemoveParticipant = (id) => {
    setParticipants((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeParticipantId === id && next.length) {
        setActiveParticipantId(next[0].id);
      }
      return next;
    });
    setAvailability((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleRenameParticipant = (id, name) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const paintCell = (day, slotIndex, forcedStatus) => {
    let resultStatus = forcedStatus;
    setAvailability((prev) => {
      const participantData = prev[activeParticipantId];
      if (!participantData) return prev;
      const current = participantData[day][slotIndex];
      const nextStatus =
        forcedStatus !== null ? forcedStatus : current === brush ? STATUS.UNSET : brush;
      resultStatus = nextStatus;
      const nextDay = [...participantData[day]];
      nextDay[slotIndex] = nextStatus;
      return {
        ...prev,
        [activeParticipantId]: { ...participantData, [day]: nextDay },
      };
    });
    return resultStatus;
  };

  const activeAvailability = availability[activeParticipantId] || createEmptyAvailability();

  return (
    <div className="App">
      <header className="app-header">
        <h1>미팅 시간 조율</h1>
        <p className="app-subtitle">
          요일별 시간대를 색칠해서 참여자들의 가능한 시간을 한눈에 확인하세요.
        </p>
      </header>

      <section className="panel">
        <h2>참여자 ({participants.length}명)</h2>
        <ParticipantManager
          participants={participants}
          activeParticipantId={activeParticipantId}
          onSelect={setActiveParticipantId}
          onRename={handleRenameParticipant}
          onAdd={handleAddParticipant}
          onRemove={handleRemoveParticipant}
        />
      </section>

      <section className="panel mode-panel">
        <div className="mode-tabs">
          <button
            type="button"
            className={`mode-tab ${mode === 'input' ? 'active' : ''}`}
            onClick={() => setMode('input')}
          >
            내 일정 입력
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === 'compare' ? 'active' : ''}`}
            onClick={() => setMode('compare')}
          >
            개별 비교
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === 'result' ? 'active' : ''}`}
            onClick={() => setMode('result')}
          >
            전체 겹쳐보기
          </button>
        </div>

        {mode === 'input' && (
          <>
            <div className="input-toolbar">
              <span className="active-participant-label">
                <strong>
                  {participants.find((p) => p.id === activeParticipantId)?.name}
                </strong>
                님의 일정 입력 중
              </span>
              <BrushSelector brush={brush} onSelect={setBrush} />
            </div>
            <p className="hint-text">
              칸을 클릭하거나 드래그해서 칠하세요. 같은 색을 다시 클릭하면 지워집니다.
            </p>
            <ScheduleGrid
              interactive
              getCellColor={(day, slotIndex) => STATUS_COLOR[activeAvailability[day][slotIndex]]}
              onPaintCell={paintCell}
            />
          </>
        )}

        {mode === 'compare' && (
          <>
            <div className="compare-toolbar">
              <p className="hint-text">
                참여자 이름을 눌러 스케줄을 펼치거나 접어서 비교하세요.
              </p>
              <div className="compare-actions">
                <button type="button" className="ghost-btn" onClick={expandAll}>
                  모두 펼치기
                </button>
                <button type="button" className="ghost-btn" onClick={collapseAll}>
                  모두 접기
                </button>
              </div>
            </div>
            {participants.map((p) => (
              <CollapsibleSchedule
                key={p.id}
                participant={p}
                availability={availability}
                isOpen={openPanels.has(p.id)}
                onToggle={togglePanel}
              />
            ))}
          </>
        )}

        {mode === 'result' && (
          <>
            <p className="hint-text">
              모두의 일정을 겹쳤을 때 가능한 인원이 많을수록 초록색이 진해집니다. 칸에
              마우스를 올리면 인원별 상세를 볼 수 있어요.
            </p>
            <div className="legend">
              <span className="legend-gradient" aria-hidden="true" />
              <span className="legend-scale">
                <span>0명 가능</span>
                <span>전원 가능</span>
              </span>
            </div>
            <ScheduleGrid
              interactive={false}
              getCellColor={(day, slotIndex) =>
                getAggregateColor(computeAggregate(participants, availability, day, slotIndex))
              }
              getCellTitle={(day, slotIndex) =>
                getAggregateTitle(computeAggregate(participants, availability, day, slotIndex))
              }
            />
          </>
        )}
      </section>
    </div>
  );
}

export default App;
