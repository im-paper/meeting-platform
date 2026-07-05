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

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// 겹쳐보기 히트맵: 가능한 인원이 많을수록 초록이 진해진다.
// 아무도 가능하지 않으면 흰색, 전원 가능하면 가장 진한 초록.
export function getAggregateColor({ available, maybe, unavailable, total }) {
  if (total === 0) return '#ffffff';
  const score = available + maybe * 0.5;
  const ratio = score / total;
  if (ratio <= 0) {
    // 아무도 가능하지 않음: 불가능 표시가 하나라도 있으면 옅은 빨강, 아니면 흰색
    return unavailable > 0 ? '#fdeaea' : '#ffffff';
  }
  const light = [200, 230, 201]; // #c8e6c9
  const dark = [27, 94, 32]; // #1b5e20
  const r = lerp(light[0], dark[0], ratio);
  const g = lerp(light[1], dark[1], ratio);
  const b = lerp(light[2], dark[2], ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export function computeParticipantSummary(availability, participantId) {
  const data = availability[participantId];
  const summary = { available: 0, maybe: 0, unavailable: 0 };
  if (!data) return summary;
  DAYS.forEach((day) => {
    (data[day] || []).forEach((status) => {
      if (status === STATUS.AVAILABLE) summary.available++;
      else if (status === STATUS.MAYBE) summary.maybe++;
      else if (status === STATUS.UNAVAILABLE) summary.unavailable++;
    });
  });
  return summary;
}

export function getAggregateTitle({ available, maybe, unavailable, total }) {
  return `가능 ${available}명 · 조건부 ${maybe}명 · 불가능 ${unavailable}명 (전체 ${total}명)`;
}
