var MISSION_TUNING = {
  introSeconds: 3.5,
  retryIntroSeconds: 1.3,
  interactRange: 2.2,
  interactFacing: .45,
  cutSeconds: 2.4,
  patrol: {
    gull: 2,
    hound: 1
  },
  waves: [{
    gull: 3,
    hound: 1
  }, {
    gull: 3,
    hound: 2
  }, {
    gull: 4,
    hound: 3
  }],
  maxAlive: 9,
  spawnStagger: .85,
  spawnFar: 18,
  pursuitEvery: 7,
  pursuitMinAlive: 4,
  pursuitExtra: 5,
  titleSpeed: 1.15,
  titleFov: 50
};
var DIALOGUE = {
  intro: "돌입 대원, 여기는 관제소. 하버마스터가 선석을 장악했다. 야적장, 창고, 부두의 중계기 세 개를 차단하라.",
  contact: "발각됐다. 걸은 공중에, 하운드는 지상에 있다. 모두 처리하라.",
  cut: ["중계기 하나 차단. 적이 눈치챘다 — 기계들이 접근 중이다.", "둘째 중계기 차단. 남은 병력을 모두 투입하고 있다."],
  all: "중계기 세 개 모두 차단. 보트가 남쪽 부두 사다리에서 대기 중이다. 달려라.",
  low: "부상이 심하다. 철제 엄폐물 뒤로 피해서 숨을 돌려라.",
  done: "대원 탑승 확인. 솔트라인 무력화 완료. 수고했다."
};
export const harbormaster = {
  id: 'harbormaster',
  mapId: 'harbor',
  title: '솔트라인',
  createMission: createRelayMission,
  tuning: MISSION_TUNING,
  dialogue: DIALOGUE,
  presentation: {
    tag: 'B4',
    unit: '항만청 돌입 부대',
    location: '솔트라인 터미널 · 05:42',
    premise: '항만 보안망이 통제 불능 상태다. 중계기 세 개를 차단하고 보트에 도착하라.',
    debrief: '4번 선석 · 작전 결과',
    locationCard: '솔트라인 터미널 · 4번 선석 · 05:42',
    support: '항만청 돌입 부대 — 대원 1명, 지원 없음'
  },
  objectiveText(remaining, total) {
    if (!remaining) return '보트에 도착하라';
    if (remaining === total && total === 3) return '중계기 세 개를 차단하라';
    return remaining === 1 ? '마지막 중계기를 차단하라' : '남은 중계기 ' + remaining + '개를 차단하라';
  }
};
import { createRelayMission } from '../../story/relay-mission.js';
