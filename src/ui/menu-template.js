import { QUALITY_NAMES } from './settings.js';
var $C = `
  <dl class="keys">
    <div><dt>이동</dt><dd><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dd></div>
    <div><dt>시점 이동</dt><dd>마우스</dd></div>
    <div><dt>사격</dt><dd>마우스 왼쪽 버튼</dd></div>
    <div><dt>조준</dt><dd>마우스 오른쪽 버튼</dd></div>
    <div><dt>재장전</dt><dd><kbd>R</kbd></dd></div>
    <div><dt>중계기 차단</dt><dd><kbd>E</kbd> 길게 누르기</dd></div>
    <div><dt>점프</dt><dd><kbd>Space</kbd></dd></div>
    <div><dt>달리기</dt><dd><kbd>Shift</kbd></dd></div>
    <div><dt>앉기</dt><dd><kbd>C</kbd> 또는 <kbd>Ctrl</kbd></dd></div>
    <div><dt>근접 공격</dt><dd><kbd>F</kbd></dd></div>
    <div><dt>일시정지</dt><dd><kbd>Esc</kbd> 또는 <kbd>P</kbd></dd></div>
  </dl>`;
var ZC = `
  <dl class="keys">
    <div><dt>이동</dt><dd>왼쪽 화면을 손가락으로 밀기</dd></div>
    <div><dt>시점 이동</dt><dd>오른쪽 화면을 손가락으로 밀기</dd></div>
    <div><dt>사격</dt><dd>사격 버튼을 누른 채 움직여 조준</dd></div>
    <div><dt>조준</dt><dd>조준 버튼으로 켜기·끄기</dd></div>
    <div><dt>재장전</dt><dd>재장전 버튼</dd></div>
    <div><dt>점프</dt><dd>점프 버튼</dd></div>
    <div><dt>중계기 차단</dt><dd>중계기 앞에서 사용 버튼 길게 누르기</dd></div>
    <div><dt>달리기</dt><dd>이동 스틱을 앞쪽 끝까지 밀기</dd></div>
  </dl>`;
export const menuTemplate = `
    <div class="m-veil"></div>
    <div class="m-bars"><i></i><i></i></div>

    <section class="m-screen m-title" data-s="title" aria-label="솔트라인">
      <div class="m-title-main">
        <div class="m-eyebrow"><span class="m-tag" data-story="tag"></span><span data-story="unit"></span><span class="m-dim" data-story="location"></span></div>
        <h1 class="m-word" data-story-title></h1>
        <p class="m-premise" data-story="premise"></p>
        <div class="m-actions">
          <button class="btn primary" data-act="deploy">작전 시작</button>
          <button class="btn" data-act="settings">설정</button>
          <button class="btn m-only-narrow" data-act="controls">조작법</button>
        </div>
        <p class="m-note">항구의 풍경과 기계, 소리는 브라우저에서 실시간으로 만들어진다.</p>
      </div>
      <aside class="m-legend" aria-label="조작법 요약">
        <div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 이동</span><span><kbd>마우스</kbd> 시점</span><span><kbd>왼쪽 클릭</kbd> 사격</span><span><kbd>오른쪽 클릭</kbd> 조준</span><span><kbd>R</kbd> 재장전</span></div>
        <div><span><kbd>E</kbd> 중계기 차단</span><span><kbd>Space</kbd> 점프</span><span><kbd>Shift</kbd> 달리기</span><span><kbd>C</kbd> 앉기</span><span><kbd>Esc</kbd> 일시정지</span></div>
        <div class="lg-touch"><em>터치</em><span>왼쪽 손가락으로 이동</span><span>오른쪽 손가락으로 시점 이동</span><span>화면의 버튼으로 사격 · 조준 · 재장전 · 점프</span></div>
      </aside>
    </section>

    <section class="m-screen m-card" data-s="paused" aria-label="일시정지">
      <div class="m-k">작전 일시 중지</div>
      <h2 class="m-h">일시정지</h2>
      <p class="m-line" data-f="lookmode"></p>
      <div class="m-actions col">
        <button class="btn primary" data-act="resume">계속하기</button>
        <button class="btn" data-act="settings">설정</button>
        <button class="btn" data-act="controls">조작법</button>
        <button class="btn" data-act="restart">작전 다시 시작</button>
      </div>
    </section>

    <section class="m-screen m-card m-dead" data-s="dead" aria-label="신호 끊김">
      <div class="m-k">돌입 대원 전투 불능</div>
      <h2 class="m-h">신호 끊김</h2>
      <dl class="m-stats"><div><dt>생존 시간</dt><dd data-f="dead-time">00:00</dd></div><div><dt>차단한 중계기</dt><dd data-f="dead-relays">0/3</dd></div></dl>
      <div class="m-actions col"><button class="btn primary" data-act="retry">다시 도전</button></div>
    </section>

    <section class="m-screen m-card m-debrief" data-s="complete" aria-label="작전 결과">
      <div class="m-k" data-story="debrief"></div>
      <h2 class="m-h">솔트라인 무력화</h2>
      <div class="m-rating"><span>평가</span><b data-f="rating">깔끔</b></div>
      <dl class="m-stats">
        <div><dt>소요 시간</dt><dd data-f="time">00:00</dd></div>
        <div><dt>명중률</dt><dd data-f="acc">0%</dd></div>
        <div><dt>파괴한 기계</dt><dd data-f="kills">0</dd></div>
        <div><dt>재도전 횟수</dt><dd data-f="retries">0</dd></div>
      </dl>
      <div class="m-actions col"><button class="btn primary" data-act="redeploy">다시 출동</button></div>
    </section>

    <div class="panel" role="dialog" aria-modal="true" aria-label="설정 및 조작법" tabindex="-1" hidden>
      <header class="panel-h">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-tab="settings" aria-selected="true">설정</button>
          <button class="tab" role="tab" data-tab="controls" aria-selected="false">조작법</button>
        </div>
        <button class="btn small" data-act="close-panel">닫기</button>
      </header>
      <div class="panel-b" data-pane="settings">
        <div class="row"><label id="l-q">그래픽 품질</label>
          <div class="seg" role="group" aria-labelledby="l-q">${QUALITY_NAMES.map(U => `<button data-q="${U}" aria-pressed="false">${{
  low: "낮음",
  medium: "보통",
  high: "높음",
  ultra: "최고"
}[U]}</button>`).join("")}</div></div>
        <div class="row"><label for="s-sens">마우스 감도</label><div class="slider"><input id="s-sens" type="range" min="0.2" max="3" step="0.05"><output data-o="sens"></output></div></div>
        <div class="row"><label id="l-inv">상하 반전</label><button class="toggle" data-act="invert" aria-labelledby="l-inv" aria-pressed="false"><i></i><span>꺼짐</span></button></div>
        <div class="row"><label for="s-vol">전체 음량</label><div class="slider"><input id="s-vol" type="range" min="0" max="100" step="1"><output data-o="vol"></output></div></div>
        <div class="row"><label for="s-fov">시야각</label><div class="slider"><input id="s-fov" type="range" min="60" max="95" step="1"><output data-o="fov"></output></div></div>
        <div class="row" data-row="fs"><label id="l-fs">화면</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">전체 화면으로 전환</span></button></div>
        <p class="panel-note" data-f="qnote"></p>
      </div>
      <div class="panel-b" data-pane="controls" hidden>
        <h3>키보드 · 마우스</h3>${$C}
        <p class="panel-note">브라우저가 마우스를 캡처하지 못하면 마우스 버튼을 누른 채 드래그해 시점을 움직일 수 있다. 왼쪽 버튼은 사격, 오른쪽 버튼은 조준도 함께 한다. 방향키 또는 <kbd>I</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd>로 시점을 돌리고 <kbd>Enter</kbd>로 사격할 수도 있다.</p>
        <h3>터치</h3>${ZC}
        <h3>게임패드</h3>
        <p class="panel-note">스틱: 이동 및 시점 · RT: 사격 · LT: 조준 · A: 점프 · B: 앉기 · X: 재장전 · Y: 중계기 차단 · L3: 달리기 · Start: 일시정지</p>
      </div>
    </div>

    <div class="loc-card" aria-hidden="true"><i></i><b data-story="locationCard"></b><span data-story="support"></span></div>
  `;
