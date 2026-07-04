export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES; // 48

export function formatTime(slotIndex) {
  const totalMinutes = slotIndex * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const STATUS = {
  UNSET: 'unset',
  AVAILABLE: 'available',
  MAYBE: 'maybe',
  UNAVAILABLE: 'unavailable',
};

export const STATUS_LIST = [STATUS.AVAILABLE, STATUS.MAYBE, STATUS.UNAVAILABLE];

export const STATUS_LABEL = {
  [STATUS.AVAILABLE]: '가능',
  [STATUS.MAYBE]: '조건부 가능',
  [STATUS.UNAVAILABLE]: '불가능',
};

export const STATUS_COLOR = {
  [STATUS.UNSET]: '#ffffff',
  [STATUS.AVAILABLE]: '#4caf50',
  [STATUS.MAYBE]: '#ffc107',
  [STATUS.UNAVAILABLE]: '#f44336',
};

export const DEFAULT_PARTICIPANT_COUNT = 6;

export function createDefaultParticipants() {
  return Array.from({ length: DEFAULT_PARTICIPANT_COUNT }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `참여자 ${i + 1}`,
  }));
}

export function createEmptyDayAvailability() {
  return Array(SLOTS_PER_DAY).fill(STATUS.UNSET);
}

export function createEmptyAvailability() {
  const obj = {};
  DAYS.forEach((day) => {
    obj[day] = createEmptyDayAvailability();
  });
  return obj;
}

export function computeAggregate(participants, availability, day, slotIndex) {
  let available = 0;
  let maybe = 0;
  let unavailable = 0;
  participants.forEach((p) => {
    const status = availability[p.id]?.[day]?.[slotIndex] ?? STATUS.UNSET;
    if (status === STATUS.AVAILABLE) available++;
    else if (status === STATUS.MAYBE) maybe++;
    else if (status === STATUS.UNAVAILABLE) unavailable++;
  });
  return { available, maybe, unavailable, total: participants.length };
}

// 3단계 색상 시각화: 옅음(적음) / 보통 / 진함(많음)
export function getAggregateColor({ available, maybe, total }) {
  if (total === 0) return '#ffffff';
  const score = available + maybe * 0.5;
  const ratio = score / total;
  if (ratio <= 0) return '#ffffff';
  if (ratio <= 0.34) return '#c8e6c9';
  if (ratio <= 0.67) return '#66bb6a';
  return '#1b5e20';
}

export function getAggregateTitle({ available, maybe, unavailable, total }) {
  return `가능 ${available}명 · 조건부 ${maybe}명 · 불가능 ${unavailable}명 (전체 ${total}명)`;
}
