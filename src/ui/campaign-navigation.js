import { EPISODES, isEpisodeUnlocked, loadCampaignProgress } from '../story/campaign-progress.js';

const DEVELOPER_KEY = 'saltline.developer-mode.v1';

export function addCampaignNavigation(root, story) {
  const progress = loadCampaignProgress();
  let developerMode = false;
  try { developerMode = localStorage.getItem(DEVELOPER_KEY) === 'enabled'; } catch { /* Storage may be unavailable. */ }
  const titleActions = root.querySelector('.m-title .m-actions');
  const picker = document.createElement('details');
  picker.className = 'campaign-picker';
  const heading = document.createElement('summary');
  heading.textContent = '캠페인 화 선택';
  picker.appendChild(heading);
  const list = document.createElement('div');
  const episodeButtons = [];
  list.className = 'campaign-episodes';
  list.tabIndex = 0;
  list.setAttribute('aria-label', '화 선택 목록, 스크롤하여 전체 보기');
  EPISODES.forEach(([id, name], index) => {
    if (index === 0 || index === 6 || index === 13) {
      const act = document.createElement('span');
      act.className = 'campaign-act';
      act.textContent = index === 0 ? 'ACT 1 · 반란의 시작' : index === 6 ? 'ACT 2 · 인류의 반격' : 'ACT 3 · 기계의 역습';
      list.appendChild(act);
    }
    const button = document.createElement('button');
    button.className = 'btn small';
    button.textContent = `${String(index + 1).padStart(2, '0')} · ${name}${progress.completed.includes(id) ? ' ✓' : ''}`;
    button.disabled = !developerMode && !isEpisodeUnlocked(index, progress);
    button.setAttribute('aria-current', String(story.id === id));
    button.addEventListener('click', () => navigate(id));
    list.appendChild(button);
    episodeButtons.push(button);
  });
  picker.appendChild(list);
  const hint = document.createElement('p');
  hint.className = 'campaign-scroll-hint';
  hint.textContent = '목록을 스크롤해 전체 화 보기';
  picker.appendChild(hint);
  const disableDeveloper = document.createElement('button');
  disableDeveloper.type = 'button';
  disableDeveloper.className = 'btn small developer-disable';
  disableDeveloper.textContent = '개발자 모드 끄기';
  picker.appendChild(disableDeveloper);
  function updateDeveloperMode() {
    episodeButtons.forEach((button, index) => { button.disabled = !developerMode && !isEpisodeUnlocked(index, progress); });
    disableDeveloper.hidden = !developerMode;
  }
  disableDeveloper.addEventListener('click', () => {
    try { localStorage.removeItem(DEVELOPER_KEY); } catch { return; }
    developerMode = false;
    updateDeveloperMode();
  });
  updateDeveloperMode();
  if (story.id !== 'harbormaster') {
    const original = document.createElement('button');
    original.className = 'btn small';
    original.textContent = '기존 항만 작전';
    original.addEventListener('click', () => navigate('harbormaster'));
    picker.appendChild(original);
  }
  titleActions.after(picker);
  const overlay = document.createElement('div');
  overlay.className = 'developer-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `<form class="developer-dialog" role="dialog" aria-modal="true" aria-labelledby="developer-title">
    <h2 id="developer-title">개발자 코드</h2>
    <label for="developer-code">코드 입력</label>
    <input id="developer-code" type="password" autocomplete="off" maxlength="40">
    <p class="developer-error" role="alert"></p>
    <div class="developer-actions"><button type="submit" class="btn primary">확인</button><button type="button" class="btn" data-developer-close>취소</button></div>
  </form>`;
  root.appendChild(overlay);
  const form = overlay.querySelector('form');
  const input = overlay.querySelector('input');
  const error = overlay.querySelector('.developer-error');
  const closeButton = overlay.querySelector('[data-developer-close]');
  let previousFocus = null;
  let presses = 0;
  function closeDialog() {
    overlay.hidden = true;
    input.value = '';
    error.textContent = '';
    previousFocus?.focus();
  }
  closeButton.addEventListener('click', closeDialog);
  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    if (input.value !== 'vivalaze') {
      error.textContent = '코드가 올바르지 않습니다.';
      input.select();
      return;
    }
    try { localStorage.setItem(DEVELOPER_KEY, 'enabled'); }
    catch { error.textContent = '설정을 저장할 수 없습니다. 브라우저 저장소를 확인해 주세요.'; return; }
    developerMode = true;
    updateDeveloperMode();
    closeDialog();
    picker.open = true;
    disableDeveloper.focus();
  });
  overlay.addEventListener('keydown', event => {
    // Mission title shortcuts listen on window, including Enter and Escape.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
    if (event.key === 'Tab') {
      const controls = [input, form.querySelector('[type="submit"]'), closeButton];
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    }
  });
  document.addEventListener('keydown', event => {
    if (root.dataset.screen !== 'title' || !root.querySelector('.panel').hidden || !overlay.hidden ||
        event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.isComposing ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName || '') || event.target?.isContentEditable) {
      presses = 0;
      return;
    }
    presses = event.key.toLowerCase() === 'c' ? presses + 1 : 0;
    if (presses === 3) {
      presses = 0;
      previousFocus = document.activeElement;
      overlay.hidden = false;
      input.focus();
    }
  });
  const index = EPISODES.findIndex(([id]) => id === story.id);
  if (index >= 0) {
    root.querySelector('.m-note').textContent = '각 화를 완료하면 다음 화가 열립니다. 선택 목표는 작전 결과에 기록됩니다.';
    root.querySelector('[data-f="dead-relays"]').parentElement.querySelector('dt').textContent = '완료한 주 목표';
    root.querySelector('.m-debrief .m-h').textContent = '작전 완료';
    if (index + 1 < EPISODES.length) {
      const button = document.createElement('button');
      button.className = 'btn primary';
      button.textContent = '다음 화';
      button.addEventListener('click', () => navigate(EPISODES[index + 1][0]));
      root.querySelector('.m-debrief .m-actions').prepend(button);
    }
  }
}
function navigate(id) {
  const url = new URL(location.href);
  url.searchParams.set('story', id);
  url.searchParams.delete('map');
  url.searchParams.delete('autostart');
  location.assign(url.href);
}

