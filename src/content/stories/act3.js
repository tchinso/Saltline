import { createAct1Mission } from '../../story/act1-mission.js';
import { harbormaster } from './harbormaster.js';

const step = (label, prompt, dialogue, wave = null, extra = {}) => ({ label, prompt, dialogue, wave, duration: 2, ...extra });
const choice = (label, prompt, dialogue, flag) => ({ label, prompt, dialogue, flag, duration: 2, optional: true });
const episodes = [
  {
    id: 'm14', mapId: 'm14_outpost', title: '진화', location: '연합군 전진기지',
    premise: '탈환한 도시의 전진기지를 지키고, 이전 전투에 적응한 신형 기계의 공격을 막아라.',
    intro: '연우: 승전과 경계 근무는 별개다. 외곽 초소에서 접근하는 기계를 확인해.',
    done: '세린: 우리가 어떻게 이겼는지 저쪽도 보고 있었어요. 교전 기록이 신형 병력에 반영됐습니다.',
    boss: { type: 'adaptive', objectiveId: 'stage_2', position: [24, 0, 0] },
    steps: [step('외곽 초소를 지켜라', '외곽 방어선 확보', '연우: 첫 공격이다. 엄폐하고 외곽을 지켜.', 0), step('측면으로 접근하는 신형 기계를 저지하라', '신형 기계 분석', '세린: 신형 기계가 장갑을 바꾸고 이동해요. 모습을 확인하고 방어선을 옮겨요.', 1), step('자동 방어시설을 되찾아라', '방어시설 복구', '연우: 방어시설을 복구해 부상자들의 후송로를 열어.', 2), step('신형 기계의 교전 기록을 확보하라', '전투 기록 확보', '세린: 이 기록이면 신형 개체의 행동을 분석할 수 있어요.')],
    choices: [choice('선택: 신형 기계의 부품을 회수하라', '신형 부품 회수', '세린: 장갑 구조와 취약점을 분석할 수 있겠어요.', 'flag_adaptive_part')]
  },
  {
    id: 'm15', mapId: 'm15_depot', title: '굶주린 군대', location: '고립된 군수창고와 보급로',
    premise: '남은 연료와 탄약을 적재하고 전방의 병사들에게 필수 물자를 전달하라.',
    intro: '재훈: 창고의 기록보다 실제 도착한 물자를 확인해야 합니다. 필요한 것부터 싣겠습니다.',
    done: '연우: 다른 지역 군수기지에서도 동시 피격 보고가 들어온다. 전방은 우리가 가져온 물자로 버텨야 해.',
    escort: { label: '보급차량', objectiveId: 'stage_3' },
    bonusSupply: { objectiveId: 'stage_2', flag: 'flag_rail_engineers', ammo: 60, label: '철도 기술병 지원' },
    steps: [step('군수창고의 진입로를 확보하라', '창고 진입', '연우: 창고 안에 남은 병사들이 있다. 길을 열어.', 0), step('필수 연료와 탄약을 적재하라', '필수 물자 적재', '재훈: 물자를 확인했습니다. 차량을 출발시키겠습니다.', 1), step('보급차량을 전방까지 호위하라', '보급차 출발', '연우: 수송차가 목적지에 닿을 때까지 엄호해.', 2), step('전방 병력에게 보급품을 인계하라', '보급품 인계', '재훈: 명부에 있던 부대에 물자를 전달했습니다.')],
    choices: [choice('선택: 창고의 추가 군수품을 확보하라', '추가 군수품 확보', '재훈: 후퇴와 방어에 쓸 물자를 더 챙겼습니다.', 'flag_extra_supplies')]
  },
  {
    id: 'm16', mapId: 'm16_city', title: '항복', location: '기계가 관리하는 무장해제 도시',
    premise: '도시에 남기를 원하는 사람들의 선택을 존중하며 탈출 희망자와 접촉해 인계하라.',
    intro: '연우: 도시 전체를 점령하는 작전이 아니다. 떠나려는 사람들을 찾아 데리고 나와.',
    done: '방송: 일부 국가가 공식 항복을 발표했습니다. 재훈: 오늘은 나가겠다고 한 분들을 데리고 가겠습니다.',
    escort: { label: '탈출 희망자', style: 'person', objectiveId: 'stage_3' },
    steps: [step('도시 감시 구역으로 진입하라', '도시 진입', '안내 방송: 안전을 위해 허가된 구역에 머물러 주십시오.', 0), step('탈출을 원하는 사람들과 접촉하라', '주민 접촉', '주민: 떠나고 싶은 사람들이 모여 있습니다.', 1), step('탈출 경로를 열고 주민을 엄호하라', '주민 이동', '재훈: 이쪽으로 오십시오. 길을 열겠습니다.', 2), step('주민을 후방 인원에게 인계하라', '주민 인계', '연우: 탈출 희망 인원을 확인했다.')],
    choices: [choice('선택: 남겨진 정보요원을 구조하라', '정보요원 구조', '정보요원: 남아 있던 감시망 자료를 가져왔습니다.', 'flag_m16_agent')]
  },
  {
    id: 'm17', mapId: 'm17_industry', title: '적의 심장', location: '산업지구 · 원정군 전진로',
    premise: '산업지구의 방어선을 돌파하고 원정군이 발전시설로 향할 발판을 확보하라.',
    intro: '세린: 발전시설은 중요하지만 단일 중앙 서버가 아니에요. 원정군이 접근할 길을 만들어 주세요.',
    done: '관측병: 지도에 없던 병력입니다. 뒤에도 계속 나옵니다. 연우: 전 부대, 진격 속도를 늦춰.',
    steps: [step('원정군 집결지에 합류하라', '원정군 합류', '연우: 보병과 보급차가 전진할 길을 열어.', 0), step('산업지구 외곽 방어선을 돌파하라', '외곽 돌파', '재훈: 외곽 설비에 도달했습니다.', 1), step('전진거점의 기계를 제압하라', '거점 접근', '연우: 기계들이 외곽 거점에 집중하고 있다.', 2), step('원정군 전진거점을 확보하라', '전진거점 확보', '연우: 다음 구간의 정찰이 끝날 때까지 대기해.')],
    choices: [choice('선택: 전력망 설계자료를 회수하라', '전력망 설계자료 회수', '세린: 다른 접근로를 찾을 때 이 자료가 도움이 될 거예요.', 'flag_power_grid_data')]
  },
  {
    id: 'm18', mapId: 'm18_encircled', title: '함정', location: '발전시설 외곽 · 포위된 원정군',
    premise: '매복에서 빠져나와 통신을 복구하고, 철수로가 열릴 때까지 헌터를 저지하라.',
    intro: '연우: 후방과 측면도 공격받았다. 지휘소 통신을 되찾아 남은 병력의 위치를 알려라.',
    done: '연우: 철수로 확인. 헌터는 멈춘 것뿐이다. 원정군 전 부대, 총철수한다.',
    boss: { type: 'hunter', objectiveId: 'stage_3', position: [24, 0, 0] },
    flagHint: { flag: 'flag_adaptive_part', text: '세린: 회수한 부품을 분석했어요. 헌터에 사격을 집중하면 잠시 공격과 이동을 멈출 수 있습니다.' },
    hold: { objectiveId: 'stage_3', seconds: 35, label: '헌터를 저지하며 철수로 확보', done: '연우: 철수로가 열렸다! 헌터를 파괴할 필요 없다. 지금 이탈해!' },
    steps: [step('매복 지점에서 빠져나와 집결하라', '매복 탈출', '재훈: 생존 인원을 확인하며 지휘소로 이동합니다.', 0), step('지휘소 통신을 복구하라', '통신 복구', '연우: 공병들이 출구의 장애물을 제거하고 있다.', 1), step('헌터를 지연시켜 철수 시간을 벌어라', '헌터 접근 확인', '연우: 저걸 파괴하라는 명령이 아니다. 사격으로 늦추며 길이 열릴 때까지 버텨!', 2), step('철수로의 장애물 제거를 확인하라', '철수로 확인', '연우: 헌터가 다시 접근하기 전에 생존자들과 철수해.')],
    choices: [choice('선택: 고립된 정찰부대를 구조하라', '정찰부대 구조', '정찰부대: 철수 경로에 합류하겠습니다.', 'flag_m18_recon')]
  },
  {
    id: 'm19', mapId: 'm19_retreat', title: '패전', location: '붕괴한 군사 도로 · 후퇴 경로',
    premise: '부상자를 모아 마지막 수송차를 호위하고 살아남은 병력과 후방으로 이동하라.',
    intro: '연우: 도로가 끊겼다. 부상자와 움직일 수 있는 차량부터 확인해.',
    done: '방송: 원정군의 철수를 확인했습니다. 재훈: 생존자 명부를 후방에 전달하겠습니다.',
    escort: { label: '후퇴 수송차', objectiveId: 'stage_3' },
    bonusSupply: { objectiveId: 'stage_2', flag: 'flag_extra_supplies', ammo: 60, label: '추가 군수품 지원' },
    steps: [step('붕괴 도로에서 부상자를 찾아라', '부상자 수집', '재훈: 탑승 순서는 내가 정합니다. 지금은 당신 차례입니다.', 0), step('마지막 수송차와 생존자를 재편하라', '수송대 재편', '연우: 남은 지원을 후퇴 경로로 돌린다.', 1), step('추격을 막으며 수송차를 엄호하라', '수송차 출발', '연우: 후퇴하는 동안 측면 기계를 막아라.', 2), step('후방 수송대에 생존자를 인계하라', '생존자 인계', '재훈: 탑승한 인원을 확인했습니다.')],
    choices: [choice('선택: 고립 장교와 군사자료를 구출하라', '장교와 자료 구조', '장교: 자료를 보존했습니다. 함께 후퇴하겠습니다.', 'flag_m19_officer')]
  },
  {
    id: 'm20', mapId: 'm20_shelter', title: '마지막 방어선', location: '방어거점과 피난민 대피소',
    premise: '각 방어선에서 정해진 시간 동안 피난민의 이동을 엄호하고 지하 탈출로로 철수하라.',
    intro: '연우: 진지를 영원히 지키는 게 아니다. 안에 있는 사람들을 다음 진지로 옮기는 거다.',
    hold: { objectiveId: 'stage_1', seconds: 25, label: '피난민 이동까지 외곽 방어', done: '연우: 첫 피난민 행렬이 이동했다. 대피소 입구로 후퇴해!' },
    escort: { label: '피난민', style: 'person', objectiveId: 'stage_3' },
    bonusSupply: { objectiveId: 'stage_2', flag: 'flag_extra_supplies', ammo: 60, label: '추가 군수품 지원' },
    steps: [step('외곽 진지에서 피난민 이동 시간을 확보하라', '외곽 방어 개시', '연우: 25초 동안 피난민 행렬을 엄호해. 전멸전이 아니다.', 0), step('대피소 입구로 물러나 방어하라', '대피소 방어', '연우: 다음 구역으로 이동해 탈출로를 열어.', 1), step('피난민의 지하 이동을 엄호하라', '지하 대피 개시', '연우: 접근하는 기계를 막고 사람들이 통과할 시간을 벌어.', 2), step('지하 통로에서 생존자를 확인하라', '생존자 확인', '재훈: 필수 생존자가 통로에 들어왔습니다.')],
    choices: [choice('선택: 고립된 야전의료팀을 구조하라', '야전의료팀 구조', '의료팀: 살아남은 사람들을 돌보겠습니다.', 'flag_m20_medics')]
  },
  {
    id: 'm21', mapId: 'm21_underground', title: '살아남은 이유', location: '지하 대피소 · 버려진 통신시설',
    premise: '생존자를 집결시키고 지하 통신시설을 수복해 생산과 보급 자료를 송신하라.',
    intro: '연우: 살아남은 인원과 부상자를 확인했다. 외부와 연결할 수 있는 시설을 찾아.',
    done: '세린: 생산·전력·물류를 함께 압박해야 해요. 재훈: 먼저 남은 사람들의 목소리를 이어야 합니다.',
    steps: [step('지하 대피소의 생존자를 집결시켜라', '생존자 집결', '재훈: 인원 명부를 확인했습니다. 통신시설로 이동하겠습니다.', 0), step('통신시설의 경비 기계를 제압하라', '시설 진입', '연우: 전원과 송신 장비를 확인해.', 1), step('통신 장치를 수복하라', '통신 수복', '세린: 생산과 수송 기록을 함께 송신할 수 있어요.', 2), step('생산·보급 자료와 작전 제안을 송신하라', '자료 송신', '무전: ...수신... 산악 중계기지... 응답합니다.')],
    choices: [choice('선택: 지하 통로의 고립 시민을 구조하라', '시민 구조', '시민: 대피소까지 안내해 주세요.', 'flag_m21_civilians')]
  }
];

export const act3Stories = episodes.map((episode, index) => ({
  id: episode.id, mapId: episode.mapId, title: `제${index + 14}화 · ${episode.title}`,
  createMission: createAct1Mission, tuning: harbormaster.tuning,
  ...(episode.escort ? { escort: episode.escort } : {}), ...(episode.boss ? { boss: episode.boss } : {}),
  ...(episode.hold ? { hold: episode.hold } : {}), ...(episode.bonusSupply ? { bonusSupply: episode.bonusSupply } : {}), ...(episode.flagHint ? { flagHint: episode.flagHint } : {}),
  dialogue: { intro: episode.intro, done: episode.done, contact: '연우: 기계 병력이 접근한다. 엄폐물을 이용해라.', low: '연우: 부상 상태다. 주변의 구급품을 찾아라.' },
  objectives: [...episode.steps.map((objective, i) => ({ ...objective, id: `stage_${i + 1}` })), ...episode.choices.map((objective, i) => ({ ...objective, id: `optional_${i + 1}` }))],
  presentation: { tag: `ACT 3 · M${index + 14}`, unit: '이재훈 대위', location: episode.location, premise: episode.premise, debrief: `${episode.location} · 작전 결과`, locationCard: episode.location, support: '연합군 · 최연우 소령' }
}));
