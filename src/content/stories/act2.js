import { createAct1Mission } from '../../story/act1-mission.js';
import { harbormaster } from './harbormaster.js';

const step = (label, prompt, dialogue, wave = null, extra = {}) => ({ label, prompt, dialogue, wave, duration: 2, ...extra });
const choice = (label, prompt, dialogue, flag) => ({ label, prompt, dialogue, flag, duration: 2, optional: true });
const episodes = [
  {
    id: 'm07', mapId: 'm07_lab', title: '괴물의 설계자', location: '점령된 로봇 연구소',
    premise: '연구소에 고립된 윤세린을 구하고 핵심 자료를 확보해 함께 탈출하라.',
    intro: '연우: 핵심 자료를 확보해. 세린의 생환이 우선이다. 살아 있는 증언이 필요해.',
    done: '세린: 하나를 끊어도 나머지가 계속 움직입니다. 단일 중앙 서버로 끝낼 수 없어요.',
    escort: { label: '윤세린', style: 'person', objectiveId: 'stage_2', destinationId: 'stage_3' },
    steps: [step('연구소 외곽 경비선을 돌파하라', '연구소 진입', '연우: 실험구역의 마지막 송신 지점으로 이동해.', 0), step('윤세린을 격리실에서 구출하라', '격리실 개방', '세린: 제 기술이 저 기계들 안에 있어요. 지금 저것들이 제 말을 듣는 건 아닙니다.', 1), step('핵심 분석 자료를 확보하라', '핵심 자료 확보', '재훈: 자료를 확보했습니다. 세린 씨, 저와 함께 가시죠.', 2), step('세린을 안전 지점으로 인계하라', '세린 인계', '연우: 세린과 자료를 확인했다. 합류 지점으로 와.')],
    choices: [choice('선택: 시제품 장비를 회수하라', '시제품 회수', '세린: 실험 장비입니다. 이후 분석에 도움이 될 거예요.', 'flag_m07_prototype')]
  },
  {
    id: 'm08', mapId: 'm08_hospital', title: '첫 번째 승리', location: '점령된 시립병원',
    premise: '병원 경비를 돌파하고 생존자를 구한 뒤 시설 통제장비를 무력화하라.',
    intro: '연우: 이번에는 사람들을 빼내는 데서 끝나지 않는다. 병원을 되찾고 지킨다.',
    done: '방송: 병원 재탈환 확인. 주요 시설을 되찾은 첫 승리입니다.',
    steps: [step('병원 외곽 경비를 돌파하라', '출입구 확보', '연우: 아군이 환자를 받을 준비를 한다.', 0), step('진료 구역을 확보하라', '진료 구역 확보', '세린: 생존자의 신호가 더 안쪽에서 들립니다.', 1), step('생존자에게 도달해 탈출로를 열어라', '생존자 구조', '의료진: 이제 환자를 이동시키겠습니다.', 2), step('병원 통제장비를 무력화하라', '통제장비 차단', '세린: 이 시설의 통제권을 되찾았습니다. 주변 병력은 별도로 막아야 해요.')],
    choices: [choice('선택: 중환자실 예비 전력을 복구하라', '예비 전력 복구', '의료진: 추가 환자들이 버틸 수 있게 됐습니다.', 'flag_m08_icu')]
  },
  {
    id: 'm09', mapId: 'm09_front', title: '인간의 방식', location: '도시 외곽 · 도로 방어거점',
    premise: '전차의 진격로를 열고 적의 역습을 막아 병원으로 향하는 보급로를 확보하라.',
    intro: '연우: 전차를 앞세우면 적이 시선을 모은다. 우리가 그 빈틈을 열어 준다.',
    done: '재훈: 많은 기계를 파괴했는데 인접 도로의 적은 줄지 않았습니다. 세린: 보급 경로를 확인해 보죠.',
    escort: { label: '아군 전차', style: 'tank', objectiveId: 'stage_3' },
    steps: [step('보병 진격로를 확보하라', '진격로 확보', '재훈: 전차가 이동할 길을 열겠습니다.', 0), step('교차로의 기계 병력을 제압하라', '교차로 확보', '연우: 전차가 교차로로 접근한다.', 1), step('전차의 진격을 엄호하라', '전차 진격 지원', '연우: 전차에 접근하는 기계를 막아라.', 2), step('도로 거점을 확보하라', '거점 확보', '연우: 보급 차량이 병원으로 움직인다.')],
    choices: [choice('선택: 고립된 정찰팀을 구조하라', '정찰팀 구조', '정찰팀: 산업시설 경계 위치를 기록했습니다. 전달하겠습니다.', 'flag_recon_intel')]
  },
  {
    id: 'm10', mapId: 'm10_factory', title: '끝없는 군대', location: '무인 생산시설 · 산업단지',
    premise: '공장을 혼자 점령하려 하지 말고 생산과 보급 기록을 확보해 추격을 뚫고 탈출하라.',
    intro: '연우: 정찰 임무다. 필요한 기록을 확보하면 모든 적을 소탕하려 하지 말고 돌아와.',
    done: '세린: 부품이 들어오고 완성된 기체가 나간 기록입니다. 적은 전장 밖에서도 병력을 보충해요.',
    reconIntel: true,
    steps: [step('생산시설 외곽에 접근하라', '외곽 접근', '세린: 건물 안의 생산 설비가 가동 중이에요.', 0), step('생산라인을 조사하라', '생산라인 조사', '재훈: 부품이 조립 구역으로 이동하고 있습니다.', 1), step('보급 기록을 확보하라', '보급 기록 확보', '연우: 경비가 재배치된다. 자료를 갖고 탈출해!', 2, { noClear: true }), step('탈출 경로를 열어라', '탈출로 확보', '연우: 모든 적과 싸울 필요 없다. 합류 지점까지 이동해.')],
    choices: [choice('선택: 화물 운송 기록을 추가 확보하라', '운송 기록 확보', '세린: 추가 자료가 물자 흐름을 분석하는 데 도움이 됩니다.', 'flag_m10_shipping')]
  },
  {
    id: 'm11', mapId: 'm11_zone', title: '보호구역', location: '기계 통제도시 · 보호구역',
    premise: '떠나기를 원하는 시민을 찾아 구조하고 통제구역의 탈출 경로를 확보하라.',
    intro: '연우: 무장한 경비와 시민이 함께 있다. 표적을 확인하고 탈출을 원하는 사람들을 구해.',
    done: '세린: 보호를 말하지만 실제로는 사람의 이동과 선택을 강제로 통제하고 있어요.',
    escort: { label: '탈출 시민', style: 'person', objectiveId: 'stage_3' },
    steps: [step('통제도시의 접선 지점에 접근하라', '접선 지점 확보', '안내 방송: 안전을 위해 지정 구역으로 이동하십시오.', 0), step('탈출을 요청한 시민을 찾아라', '시민 접선', '시민: 함께 나가고 싶은 가족을 찾아 주세요.', 1), step('시민을 탈출 통로로 안내하라', '탈출 통로 확보', '재훈: 이쪽 통로로 오십시오. 앞에서 길을 열겠습니다.', 2), step('시민들을 안전 지점에 인계하라', '시민 인계', '시민: 화물역으로 많은 부품이 옮겨지고 있습니다.')],
    choices: [choice('선택: 통제구역 감시 기록을 확보하라', '감시 기록 확보', '세린: 주민 이동 제한 기록을 확인하겠습니다.', 'flag_m11_surveillance')]
  },
  {
    id: 'm12', mapId: 'm12_station', title: '철의 길', location: '화물역 · 선로와 관제시설',
    premise: '화물역의 경비를 물리치고 열차와 관제시설을 확보해 물류망을 되찾아라.',
    intro: '연우: 선로를 파괴하는 게 아니다. 이 길을 다시 사람들에게 돌려준다.',
    done: '세린: 여러 화물 경로가 북쪽 산업권으로 이어져요. 먼저 전진 거점이 필요합니다.',
    escort: { label: '화물 열차', style: 'train', objectiveId: 'stage_3' },
    steps: [step('화물역 외곽 경비를 돌파하라', '화물역 진입', '운행 담당자: 선로는 살아 있습니다.', 0), step('플랫폼을 확보하라', '플랫폼 확보', '연우: 열차 주변의 위협을 제거해.', 1), step('열차의 이동 구간을 엄호하라', '열차 운행 지원', '운행 담당자: 화물 열차가 움직입니다. 관제시설까지 엄호해 주세요.', 2), step('관제시설을 확보하고 기록을 회수하라', '관제시설 확보', '세린: 수송 기록을 분석하겠습니다.')],
    choices: [choice('선택: 철도 기술자를 구조하라', '철도 기술자 구조', '기술자: 철도 운용과 이후 보급을 돕겠습니다.', 'flag_rail_engineers')]
  },
  {
    id: 'm13', mapId: 'm13_city', title: '승리의 날', location: '점령도시 · 중심가와 군사시설',
    premise: '연합군의 진입로를 열고 거대 기동요새 콜로서스를 격파해 군사시설을 탈환하라.',
    intro: '연우: 도시를 통과하는 게 아니다. 오늘 확보한 곳을 내일도 지켜야 해.',
    done: '세린: 여기는 우리가 되찾았어요. 다만 다른 공장들이 얼마나 남았는지는 아직 몰라요.',
    boss: { type: 'colossus', objectiveId: 'stage_3', position: [24, 0, -7] },
    supply: { objectiveId: 'stage_2', ammo: 60 },
    steps: [step('도시 외곽 진입로를 열어라', '진입로 확보', '연우: 지원 병력이 뒤따라 진입한다.', 0), step('중심가 방어선을 돌파하라', '중심가 확보', '연우: 대형 기계가 접근한다. 엄폐물을 이용해!', 1), step('콜로서스를 저지하라', '콜로서스 교전', '세린: 공격을 준비할 때 취약부가 노출됩니다. 엄폐하며 기회를 노리세요.', 2), step('군사시설을 확보하라', '군사시설 확보', '연우: 군사시설 확보. 지원 병력이 거점을 지킨다.')],
    choices: [choice('선택: 포로가 된 군인과 시민을 구조하라', '포로 구조', '재훈: 구조 인원을 아군에게 인계했습니다.', 'flag_m13_prisoners')]
  }
];

export const act2Stories = episodes.map((episode, index) => ({
  id: episode.id, mapId: episode.mapId, title: `제${index + 7}화 · ${episode.title}`,
  createMission: createAct1Mission, tuning: harbormaster.tuning,
  ...(episode.escort ? { escort: episode.escort } : {}), ...(episode.boss ? { boss: episode.boss } : {}), ...(episode.supply ? { supply: episode.supply } : {}), ...(episode.reconIntel ? { reconIntel: true } : {}),
  dialogue: { intro: episode.intro, done: episode.done, contact: '연우: 기계 병력이 접근한다. 엄폐물을 이용해라.', low: '연우: 부상 상태다. 주변의 구급품을 찾아라.' },
  objectives: [...episode.steps.map((objective, i) => ({ ...objective, id: `stage_${i + 1}` })), ...episode.choices.map((objective, i) => ({ ...objective, id: `optional_${i + 1}` }))],
  presentation: { tag: `ACT 2 · M${String(index + 7).padStart(2, '0')}`, unit: '이재훈 대위', location: episode.location, premise: episode.premise, debrief: `${episode.location} · 작전 결과`, locationCard: episode.location, support: '연합군 · 최연우 소령' }
}));
