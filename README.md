# 솔트라인

브라우저에서 실행하는 Three.js 게임입니다. 빌드 없이 ES 모듈로 실행하며, 게임 실행에 CDN이나 패키지 설치가 필요하지 않습니다.

## 실행 및 검증

Node.js 20 이상에서:

```sh
node scripts/serve.js
# http://127.0.0.1:4173

node --test
node scripts/check.js
```

ES 모듈을 사용하므로 HTML 파일을 직접 여는 대신 HTTP 서버로 실행합니다. 배포할 때는 `index.html`, `game.js`, `src/`, `styles/`, `vendor/`를 함께 올립니다.

브라우저 회귀 검증은 서버를 실행한 상태에서:

```sh
npm install
npx playwright install chromium
npm run test:browser
```

이미 설치된 브라우저는 `BROWSER_PATH`, 다른 서버는 `GAME_URL`로 지정할 수 있습니다. 테스트 결과 이미지는 `test-results/`에 저장됩니다. 브라우저 검증은 고정된 기존 항만 맵의 오브젝트 수와 임무 진행을 검사하므로, 맵을 의도적으로 수정하면 기대값도 검토합니다.

## 소스 구조

| 위치 | 책임 |
| --- | --- |
| `index.html` / `game.js` | 화면 기본 골격 / 실행 진입점 |
| `src/app/` | 시스템 생성 순서, 프레임 루프, 디버그 쇼케이스·벤치마크 |
| `src/content/` | 맵·스토리 등록, 콘텐츠 정의 |
| `src/content/maps/harbor/` | 기존 항만의 지형·건물·소품 배치·스폰·카메라 경로 |
| `src/content/stories/harbormaster.js` | 대사, 웨이브 설정, 임무 문구, 메뉴·장소 표시 |
| `src/story/` | 임무 상태 전환, 중계기 상호작용, 적 증원, 타이틀 카메라 |
| `src/world/` | 맵 공용 물리·내비게이션, 레벨 빌더, 소품 등록·생성 |
| `src/player/`, `src/combat/`, `src/weapon/`, `src/enemies/` | 입력·이동, 전투 집계, 무기, 적 |
| `src/render/`, `src/effects/`, `src/audio/`, `src/geometry/` | 렌더링, 효과, 합성 음향, 공용 형상 |
| `src/ui/` | HUD, 메뉴 제어, 메뉴 템플릿, 설정 저장 |
| `styles/` | 기본 화면, HUD, 터치, 메뉴, 반응형, 한국어 표시 스타일 |
| `vendor/` | 원본에 포함된 Three.js r180 및 MIT 라이선스 |

시스템은 `create…(game)` 팩토리로 생성합니다. `game`은 해당 실행의 서비스와 상태를 전달하는 컨텍스트입니다. 시스템 간 알림은 `game.events`를 사용하고, 프레임 업데이트 순서는 `src/app/loop.js` 한 곳에서 관리합니다. 메뉴 설정의 기존 localStorage 키는 유지합니다.

## 스토리 추가

1. `src/content/stories/`에 새 정의를 만들고 고유한 `id`, 연결할 `mapId`, `title`, `createMission`을 지정합니다.
2. 기존 중계기 임무를 재사용하려면 `createRelayMission`과 기존 스토리의 `tuning`, `dialogue`, `presentation`, `objectiveText` 형식을 사용합니다. 대사·웨이브 배열과 표시 문구는 새 스토리에 맞게 작성합니다.
3. `src/content/index.js`의 `stories`에 등록합니다. `?story=새-id`로 실행합니다.

다른 규칙의 임무는 별도 `createMission(game)`을 구현합니다. 반환 객체에는 `state`, `start(options)`, `update(dt)`가 필요합니다. `update`의 `false` 반환은 플레이어·무기·적 시뮬레이션을 멈춥니다. 기존 상태 이름은 `title`, `intro`, `playing`, `paused`, `dead`, `complete`입니다. 공용 메뉴는 `game.story.presentation`을 표시합니다. 기존 중계기 컨트롤러는 gull/hound 적과 중계기→탈출 규칙을 담당하며, 모든 장르의 임무를 해석하는 범용 스토리 엔진은 아닙니다.

## 맵 추가

1. `src/content/maps/새-맵/`에 `world`와 `createLevel`, `createBackdrop`, `createGround` 팩토리를 만듭니다. 항만 전용 바다·크레인·창고는 기존 항만 폴더 안에 있습니다.
2. `world`에는 `min`, `max`(Vector3), `groundY`, `seaY`, `quayX`, `navigation: { minX, maxX, minZ, maxZ, cellSize }`를 정의합니다. 현재 공용 물리는 평면 지면과 X축 기준 부두·수면 경계를 사용합니다. 복층 지형은 콜라이더로 추가하며, 다른 형태의 수면·지형은 물리 인터페이스를 확장해야 합니다.
3. `createLevel(game)`에서 `game.physics.addBox`로 콜라이더를 등록하고 씬에 오브젝트를 추가합니다. 기존 중계기 임무의 레벨 계약은 아래와 같습니다.

```js
{
  playerStart: { pos: Vector3, yaw: 0 },
  objectives: [{ id: 'relay_a', label: '중계기 A', pos: Vector3, object: relayMesh }],
  extraction: { pos: Vector3, radius: 2.5 },
  enemySpawns: [{ pos: Vector3, type: 'ground', zone: 'yard' }], // 또는 air
  cinematicPath: [{ pos: [0, 2, 0], look: [0, 2, -1] }],
  interiorBoxes: [], coverPoints: [], zones: [],
  groundSurfaceAt(x, z) { return 'concrete'; },
  update(dt) {}
}
```

`object.userData.setState('live' | 'cutting' | 'cut')`는 중계기 시각 상태를 갱신합니다. 스폰·엄폐물 Vector3는 매 생성 시 새 객체로 만듭니다. 경로 보정이 좌표를 수정할 수 있습니다. 새 맵과 스토리를 `src/content/index.js`에 함께 등록하면 `?map=새-id` 또는 `?story=새-id`로 실행할 수 있습니다. 잘못된 ID·중복 ID·맵/스토리 조합은 명시적으로 거부합니다.

## 유지보수 참고

원본은 Three.js와 게임 전체가 합쳐진 압축 번들뿐이었습니다. 게임 소스를 기능별 모듈로 복원하고 주요 팩토리·상태·의존성에 이름을 부여했습니다. 세부 절차적 모델·셰이더 생성 함수에는 원본의 짧은 내부 식별자가 일부 남아 있습니다. `vendor/three.js`는 보존된 외부 라이브러리이므로 게임 변경을 위해 편집하지 않습니다.

기존 `?show=level`, `?show=weapon`, `?show=enemies`, `?bench=1`, `?q=test`, `?noaudio=1` 옵션과 `window.__G`, `window.__stats()` 진단 인터페이스를 유지합니다. 쇼케이스는 기존 에셋을 확인하는 개발용 화면이며, 새 맵의 실제 실행 검증에는 `?map=…`를 사용합니다.

## 캠페인 ACT 1·2

기본 시작 화면은 1화입니다. **캠페인 화 선택**에서 완료한 화를 다시 선택할 수 있으며, 각 화를 완료하면 다음 화가 열립니다. 기존 항만 작전도 여기서 선택할 수 있습니다. 개발 중에는 `?story=m01`부터 `?story=m13`까지 직접 열 수 있습니다. 캠페인 진행과 선택 목표는 브라우저의 별도 로컬 저장소에 기록되므로 브라우저 데이터를 지우면 함께 삭제됩니다.

테스트할 때 타이틀 화면에서 C를 세 번 누르고 개발자 코드 `vivalaze`를 입력하면 완료하지 않은 화도 선택할 수 있습니다. 개발자 모드는 브라우저에 유지되며 화 선택 메뉴에서 끌 수 있습니다. 실제 임무 완료 기록이나 선택 결과는 바꾸지 않습니다.

최대 체력은 100이며 자동 회복은 없습니다. 맵에 놓인 구급품은 체력을 전부 회복하고 획득 후 60초가 지나면 다시 나타납니다. M05의 선택 의료물자를 회수하면 M06과 M07에서 추가 구급품이 제공됩니다. 탄약은 유한하며 일부 보스 전투 전에는 제한된 보급이 제공됩니다.

현재 ACT 1은 여섯 배경과 전투·목표·선택·해금이 연결된 초기 플레이 가능 버전입니다. 구조 대상은 상호작용과 무전으로 표현하며 동료 NPC는 구현하지 않았습니다. M02·M03·M05·M06에서는 이동하는 수송대를 호위합니다. M06 브레이커는 조준 전조와 약점이 있는 고정형 적입니다. 사망 시 최근 주 목표의 체크포인트부터 다시 시도할 수 있습니다. 맵과 난이도는 실제 플레이를 통한 추가 조정이 필요합니다.

ACT 2도 일곱 화의 맵·전투·선택 목표와 진행이 연결된 초기 버전입니다. 현재 M08 옥상과 M12 철도는 단층 구역으로 표현되며, 이동하는 열차 위에 탑승하는 물리는 없습니다. M13 콜로서스는 브레이커를 확장한 고정형 적입니다. 게임을 시작한 후 절차적 재질을 차례로 생성하므로 처음에는 일부 표면이 단순하게 표시되고 저사양 기기에서는 생성 중 일시적인 끊김이 있을 수 있습니다.
