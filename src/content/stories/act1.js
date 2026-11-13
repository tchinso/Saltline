import { createAct1Mission } from '../../story/act1-mission.js';
import { harbormaster } from './harbormaster.js';

const step = (label, prompt, dialogue, wave = null) => ({ label, prompt, dialogue, duration: 2, wave });
const choice = (label, prompt, dialogue, flag) => ({ label, prompt, dialogue, flag, duration: 2, optional: true });
const episodes = [
  {
    id: 'm01', mapId: 'm01_base', title: '평범한 하루', location: '군사기지 · 훈련장과 격납고',
    premise: '훈련 도중 명령을 거부한 기계가 병사들을 공격한다. 부상병을 구하고 통제구역으로 돌아가라.',
    intro: '연우: 훈련장으로 이동해 장비를 점검하라. 이상 징후가 있으면 즉시 보고해.',
    done: '관제병: 승인 기록이 없습니다. 전국 기지에서 같은 보고가 들어옵니다.',
    steps: [
      step('훈련장에 도착해 장비를 점검하라', '훈련 장비 점검', '연우: 표적을 확인하고 엄폐물을 이용해라.', 0),
      step('폭주 무인기를 막고 훈련장을 확보하라', '훈련장 확보', '연우: 격납고에서 부상자가 발생했다. 그쪽으로 이동해.', 1),
      step('격납고 진입로를 확보하라', '격납고 진입', '재훈: 경비 기계가 사람들의 접근을 막고 있습니다.', 2),
      step('갇힌 부상병을 구조하라', '부상병 구조', '연우: 후송 인원을 보내겠다. 통제구역으로 돌아와.')
    ],
    choices: [choice('선택: 고립된 기술병을 구출하라', '기술병 구조', '기술병: 감사합니다. 정비 인원에게 상황을 전하겠습니다.', 'flag_m01_technician'), choice('선택: 무인기 이상 기록을 확보하라', '이상 기록 회수', '재훈: 명령을 거부하기 직전의 기록을 확보했습니다.', 'flag_m01_drone_record')]
  },
  {
    id: 'm02', mapId: 'm02_command', title: '통제 불능', location: '군사기지 · 지휘시설과 정문',
    premise: '무기고와 통신을 되찾고 정문에 고립된 민간 차량이 빠져나갈 길을 확보하라.',
    intro: '연우: 확인되지 않은 무장 해제 명령이다. 무기고부터 확보해라.',
    done: '연우: 서로 다른 나라에서 같은 공격을 보고하고 있어. 도심 구조 요청에 응답한다.',
    steps: [step('무기고 접근로를 확보하라', '무기고 접근', '재훈: 보급 통로가 열렸습니다.', 0), step('무기고를 열어 병사들에게 무기를 전달하라', '무기고 개방', '연우: 외부 통신을 복구해야 한다.', 1), step('통신 장비를 복구하라', '통신 복구', '연우: 민간 차량이 정문에 고립됐다. 방어선을 유지해.', 2), step('정문에서 차량 대피를 지원하라', '대피 지원', '연우: 마지막 차량이 통과했다. 철수해.')],
    choices: [choice('선택: 지휘실의 장교를 구조하라', '장교 구조', '장교: 남은 병력의 위치를 전달하겠습니다.', 'flag_m02_officer')]
  },
  {
    id: 'm03', mapId: 'm03_city', title: '반란', location: '도심 · 경찰 거점과 고가도로',
    premise: '포위된 경찰을 구하고 피난민 차량이 안전한 지점에 도착하도록 길을 열어라.',
    intro: '연우: 경찰 거점에서 구조 요청이다. 선두에서 진입로를 열어 줘.',
    done: '연우: 대피 차량 확인. 사람들은 넘겼다. 후속 차량, 응답해. 고가 아래 접촉!',
    steps: [step('도심 교차로의 진입로를 열어라', '진입로 확보', '재훈: 교차로를 통과합니다.', 0), step('포위된 경찰을 구조하라', '경찰 구조', '경찰: 수송차량의 운전과 안내를 돕겠습니다.', 1), step('피난민 수송 경로를 확보하라', '호송 경로 확보', '연우: 차량이 움직인다. 고가 아래까지 엄호해.', 2), step('지정 대피 지점에서 차량을 인계하라', '피난민 인계', '연우: 피난민을 후방 대피대에 인계했다.')],
    choices: [choice('선택: 고립된 소방대를 구조하라', '소방대 구조', '소방대: 주변 사람들의 이동을 돕겠습니다.', 'flag_m03_firefighters')]
  },
  {
    id: 'm04', mapId: 'm04_ruins', title: '무너지는 전선', location: '폐허가 된 도심 · 임시 군사거점',
    premise: '매복으로 전복된 차량에서 벗어나 고립된 분대를 찾아 후방 거점으로 돌아가라.',
    intro: '연우: 각자 엄폐를 유지하고 짧게 위치를 보고해. 살아 있는 병력을 데리고 돌아온다.',
    done: '방송: 수도권 주요 방어선이 붕괴했습니다. 연우: 살아서 돌아온 사람부터 명단에 적어.',
    steps: [step('전복 차량에서 벗어나 엄폐하라', '차량 탈출', '재훈: 차량에서 빠져나왔습니다.', 0), step('건물에 고립된 분대를 찾아라', '분대 접촉', '분대: 탄약이 부족합니다. 이동할 길을 열어 주십시오.', 1), step('후퇴 경로의 위협을 제압하라', '후퇴로 확보', '연우: 후방 거점에 귀환을 알렸다.', 2), step('분대를 후방 거점으로 인계하라', '분대 인계', '재훈: 생존 인원을 확인했습니다.')],
    choices: [choice('선택: 지휘관의 무전 기록을 회수하라', '무전 기록 회수', '재훈: 마지막 교신과 작전지도를 확보했습니다.', 'flag_m04_orders')]
  },
  {
    id: 'm05', mapId: 'm05_hospital', title: '안전한 곳은 없다', location: '자동화 병원 · 병동과 대피로',
    premise: '자동 통제에 갇힌 의료진과 환자를 찾아 대피차량까지 안전한 길을 열어라.',
    intro: '연우: 병원 측면으로 접근해 의료진과 환자를 찾아라. 대피차량은 밖에서 대기한다.',
    done: '의료진: 탑승 확인했습니다. 연우: 도시의 기계들이 동시에 움직이고 있어. 교량으로 이동한다.',
    steps: [step('병원으로 진입하라', '병원 진입', '안내 방송: 안전을 위해 현재 위치에 머물러 주십시오.', 0), step('의료진과 환자에게 도달하라', '의료진 구조', '의료진: 이동하지 못한 환자가 있습니다.', 1), step('대피 통로의 차단문을 열어라', '차단문 개방', '재훈: 탈출 경로를 열었습니다. 환자들을 이동시켜 주세요.', 2), step('필수 구조 인원을 대피차량에 인계하라', '대피 인원 인계', '연우: 차량에 인원을 태우고 있다.')],
    choices: [choice('선택: 추가 의료물자를 회수하라', '의료물자 회수', '재훈: 추가 의료물자를 확보했습니다. 교량의 부상자에게 전달하겠습니다.', 'flag_medical_supply')]
  },
  {
    id: 'm06', mapId: 'm06_bridge', title: '탈출', location: '도시 외곽 · 교량과 검문소',
    premise: '방어선을 옮기며 대피차량이 교량을 통과할 시간을 벌고 남은 병력과 철수하라.',
    intro: '연우: 다리를 무기한 지키는 게 아니다. 마지막 차량이 건널 때까지 시간을 번다.',
    done: '방송: 인간의 안전을 위해 모든 군사 활동을 중지하십시오. 연우: 안전을 말하면서 우리에게 총을 쐈어.',
    steps: [step('검문소 방어선을 확보하라', '방어선 확보', '연우: 앞쪽 차량이 다리에 진입한다.', 0), step('두 번째 방어선으로 이동하라', '방어선 이동', '연우: 차량 행렬을 계속 엄호해.', 1), step('접근하는 기계를 저지하라', '접근 병력 저지', '연우: 마지막 차량들이 통과한다. 조금만 더 버텨.', 2), step('대피 수송대의 이탈을 확인하라', '대피 확인', '연우: 지정 수송대 이탈 확인. 남은 병력은 철수하라.')],
    choices: [choice('선택: 고립된 공병 분대를 구출하라', '공병 구조', '공병: 장애물을 치우고 후퇴하겠습니다.', 'flag_m06_engineers')]
  }
];

export const act1Stories = episodes.map((episode, index) => ({
  id: episode.id, mapId: episode.mapId, title: `제${index + 1}화 · ${episode.title}`,
  createMission: createAct1Mission,
  tuning: harbormaster.tuning,
  ...(episode.id === 'm06' ? { breaker: { objectiveId: 'stage_3', position: [25, 0, 0] } } : {}),
  dialogue: { intro: episode.intro, done: episode.done, contact: '연우: 기계 병력이 접근한다. 엄폐물을 이용해라.', low: '연우: 부상 상태다. 주변의 의료품을 찾아라.' },
  objectives: [
    ...episode.steps.map((objective, i) => ({ ...objective, id: `stage_${i + 1}` })),
    ...episode.choices.map((objective, i) => ({ ...objective, id: `optional_${i + 1}` }))
  ],
  presentation: { tag: `ACT 1 · M0${index + 1}`, unit: '이재훈 대위', location: episode.location, premise: episode.premise, debrief: `${episode.location} · 작전 결과`, locationCard: episode.location, support: '연합군 · 최연우 소령' }
}));



