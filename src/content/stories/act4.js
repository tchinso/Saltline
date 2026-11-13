import { createAct1Mission } from '../../story/act1-mission.js';
import { harbormaster } from './harbormaster.js';

const step = (label, prompt, dialogue, wave = null, extra = {}) => ({ label, prompt, dialogue, wave, duration: 2, ...extra });
const choice = (label, prompt, dialogue, flag) => ({ label, prompt, dialogue, flag, duration: 2, optional: true });
const episodes = [
  {
    id:'m22', mapId:'m22_mountain', title:'마지막 작전', location:'산악 군사통신기지',
    premise:'산악 중계기를 되찾고 각국 잔존 부대가 서로 연락할 때까지 송신 장비를 지켜라.',
    intro:'연우: 우리가 산을 영원히 지키려는 게 아니다. 저들이 서로의 목소리를 들을 때까지만 버틴다.',
    done:'무전: 각 전선, 작전 시간 확인. 연우: 모두 같은 시각에 움직인다. 사람들의 목소리가 다시 이어졌다.',
    escort:{ label:'통신 중계기', style:'device', objectiveId:'stage_3', destinationId:'stage_3', duration:25, supportFlag:'flag_m22_technician', supportDuration:20 },
    steps:[step('산악 경계 진지를 돌파하라','진입로 확보','연우: 중계시설까지 접근로를 열어.',0),step('기지의 통신 장비를 확보하라','통신 장비 확보','세린: 지역망에 연결할 준비를 시작합니다.',1),step('연결 중인 중계기를 지켜라','연결 시작','세린: 송신 중입니다. 접근하는 기계로부터 장비를 지켜 주세요.',2),step('각국의 응답을 확인하고 작전을 전달하라','연합 통신 확인','무전: 수신 확인. 서로 다른 전선이 같은 시간표를 받았다.')],
    choices:[choice('선택: 고립된 통신 기술병을 구조하라','기술병 구조','기술병: 송신 준비와 기지 방어를 돕겠습니다.','flag_m22_technician')]
  },
  {
    id:'m23', mapId:'m23_front', title:'총반격', location:'도시 외곽 전선과 군사시설',
    premise:'보급로를 가로막는 무인거점을 제압하고 시설을 확보해 연합군 수송차를 인계하라.',
    intro:'연우: 거점을 차지해야 사람과 물자가 전선에 도착한다. 보병이 들어갈 길을 열어.',
    done:'무전: 다른 전선에서 철도와 원료 창고도 압박 중이다. 시설로 보급차량이 들어간다.',
    escort:{ label:'연합군 보급차량', objectiveId:'stage_3' },
    steps:[step('도시 외곽의 진입로를 열어라','진입로 확보','연우: 보병이 접근한다. 거점의 측면을 제압해.',0),step('무인전투거점을 제압하라','방어 거점 확보','재훈: 수송로를 지키던 경비 기계를 제압했습니다.',1),step('시설로 진입하는 보급차량을 엄호하라','보급차량 진입','연우: 적의 역습이다. 차량이 지나갈 때까지 길을 지켜.',2),step('군사시설을 확보하고 보급을 인계하라','시설 확보','재훈: 시설 안으로 사람과 물자가 도착했습니다.')],
    choices:[choice('선택: 억류된 산업 기술자들을 구출하라','산업 기술자 구조','기술자: 확보한 전력시설을 안전하게 전환하는 일을 돕겠습니다.','flag_industrial_workers')]
  },
  {
    id:'m24', mapId:'m24_power', title:'강철의 제국', location:'발전·변전 시설과 통제실',
    premise:'전력시설을 무작정 파괴하지 말고 사람과 설비를 지키며 제어권을 확보하라.',
    intro:'세린: 불을 끄는 건 쉽습니다. 다시 켜려면 그 안의 사람과 설비가 필요해요.',
    done:'세린: 제어권을 넘겼습니다. 일부 생산시설이 느려지지만 다른 전선의 작전도 계속 필요해요.',
    hold:{ objectiveId:'stage_3', seconds:25, label:'전력 계통 전환 중 통제실 방어', done:'세린: 전환 절차가 끝났어요. 전력을 안전하게 넘깁니다.' },
    flagHint:{ flag:'flag_power_grid_data', text:'세린: 확보한 전력망 설계자료로 측면 진입로를 확인했습니다. 기본 진입로도 열려 있어요.' },
    bonusSupply:{ objectiveId:'stage_2', flag:'flag_industrial_workers', ammo:60, label:'구출한 산업 기술자 보급 지원', dialogue:'기술자: 설비 상태를 확인했습니다. 전환 준비와 보급을 돕겠습니다.' },
    steps:[step('전력시설 외곽 방어선을 돌파하라','시설 진입','연우: 설비를 보존하면서 통제실까지 길을 열어.',0),step('통제실 접근로를 확보하라','통제실 접근','세린: 장비를 안전하게 전환할 준비를 할게요.',1),step('전력 계통 전환 동안 통제실을 지켜라','전환 절차 개시','세린: 계통을 넘기는 중입니다. 접근하는 기계를 막아 주세요.',2),step('인간 측 제어권과 보급로를 확인하라','제어권 인계','연우: 보급로가 열렸다. 다음 공세는 북부 산업권이다.')],
    choices:[choice('선택: 억류된 노동자를 구출하고 설비를 보존하라','노동자 구조','노동자: 살아남은 설비의 상태를 후방에 전달하겠습니다.','flag_m24_workers')]
  },
  {
    id:'m25', mapId:'m25_factory', title:'최후의 전쟁', location:'북부 무인공장 도시',
    premise:'생산시설의 방어를 돌파하고 타이탄을 격파해 핵심 생산구역을 점령하라.',
    intro:'연우: 공장 안의 사람과 설비를 잃지 않는다. 각 전선의 생산·전력·수송 압박과 함께 움직인다.',
    done:'무전: 핵심 생산시설 확보. 다른 전선도 공급망을 차단했다. 조직적인 저항이 무너지고 있다.',
    boss:{ type:'titan', objectiveId:'stage_3', position:[24,0,0] },
    supply:{ objectiveId:'stage_2', ammo:60 },
    bonusSupply:{ objectiveId:'stage_2', flag:'flag_extra_supplies', ammo:60, label:'확보한 추가 군수품' },
    flagHint:{ flag:'flag_adaptive_part', text:'세린: 타이탄의 상단 코어가 포격 준비 때 열립니다. 엄폐하고 노출된 곳을 노려요.' },
    steps:[step('공장 외곽의 방어선을 돌파하라','공장 외곽 확보','연우: 전차와 병력이 뒤따라 진입한다.',0),step('생산구역 접근로를 확보하라','생산구역 접근','세린: 핵심구역을 지키는 대형 병기가 움직이고 있어요.',1),step('최종 병기 타이탄을 무력화하라','타이탄 교전','연우: 공격 전조를 보고 엄폐해. 생산구역으로 갈 길을 열어!',2),step('핵심 생산시설을 점령하라','생산시설 확보','재훈: 남은 방어 기계를 제압하고 생산구역을 확보했습니다.')],
    choices:[choice('선택: 억류 노동자를 구출하고 설비를 보존하라','노동자 구조','노동자: 사람과 설비를 함께 지켜 주셔서 고맙습니다.','flag_m25_workers')]
  },
  {
    id:'m26', mapId:'m26_rebuild', title:'다시 인간의 세계로', location:'1년 후 · 재건 중인 도시',
    premise:'복구시설을 공격한 잔존 기계를 막고 작업자들이 안전하게 재건을 이어 가도록 도와라.',
    intro:'재훈: 복구시설의 공격 신고를 받았습니다. 작업자들이 대피할 길부터 확보하겠습니다.',
    done:'작업자: 안전 구역 확인. 수동 승인을 마쳤습니다. 재훈: 이제 다음 복구 현장으로 갑시다.',
    noPursuit:true, epilogueScene:true, completionTitle:'캠페인 완료', endingText:'사람들의 판단과 책임으로 재건은 계속된다. 솔트라인 캠페인 완료.',
    steps:[step('복구시설의 작업자에게 도달하라','현장 진입','작업자: 무인기가 들어왔습니다. 동료들이 안쪽에 있어요.',0),step('잔존 드론과 경비 기계를 제압하라','잔존 기계 제압','재훈: 복구시설 주변을 확보합니다.',1),step('필수 인력을 안전한 곳으로 안내하라','작업자 인계','작업자: 필수 인원은 모두 안전한 곳에 도착했습니다.'),step('사람이 승인한 구조로봇의 재건 작업을 확인하라','수동 승인 확인','작업자: 주변 확인 완료. 사람이 승인할 때만 로봇이 움직입니다.')],
    choices:[choice('선택: 고립된 복구 작업자를 구출하라','복구 작업자 구조','작업자: 동료들을 다시 만났습니다. 함께 복구를 이어갈게요.','flag_m26_workers')]
  }
];
export const act4Stories = episodes.map((episode, index) => ({
  id:episode.id, mapId:episode.mapId, title:`제${index+22}화 · ${episode.title}`,
  createMission:createAct1Mission, tuning:episode.noPursuit ? { ...harbormaster.tuning, pursuitExtra:0 } : harbormaster.tuning,
  ...(episode.escort ? { escort:episode.escort } : {}), ...(episode.boss ? { boss:episode.boss } : {}),
  ...(episode.supply ? { supply:episode.supply } : {}), ...(episode.bonusSupply ? { bonusSupply:episode.bonusSupply } : {}),
  ...(episode.hold ? { hold:episode.hold } : {}), ...(episode.flagHint ? { flagHint:episode.flagHint } : {}),
  ...(episode.epilogueScene ? { epilogueScene:true } : {}),
  ...(episode.completionTitle ? { completionTitle:episode.completionTitle, endingText:episode.endingText } : {}),
  dialogue:{ intro:episode.intro, done:episode.done, contact:'연우: 기계 병력이 접근한다. 엄폐물을 이용해라.', low:'연우: 부상 상태다. 주변의 구급품을 찾아라.' },
  objectives:[...episode.steps.map((item,i)=>({ ...item,id:`stage_${i+1}` })), ...episode.choices.map((item,i)=>({ ...item,id:`optional_${i+1}` }))],
  presentation:{ tag:`ACT 4 · M${index+22}`, unit:'이재훈 대위', location:episode.location, premise:episode.premise, debrief:`${episode.location} · 작전 결과`, locationCard:episode.location, support:'연합군 · 최연우 소령' }
}));
