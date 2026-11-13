import { EPISODES, isEpisodeUnlocked, loadCampaignProgress } from '../story/campaign-progress.js';

export function addCampaignNavigation(root, story) {
  const progress = loadCampaignProgress();
  const titleActions = root.querySelector('.m-title .m-actions');
  const picker = document.createElement('div');
  picker.className = 'campaign-picker';
  const heading = document.createElement('p');
  heading.textContent = '캠페인 · ACT 1';
  picker.appendChild(heading);
  const list = document.createElement('div');
  list.className = 'campaign-episodes';
  EPISODES.forEach(([id, name], index) => {
    const button = document.createElement('button');
    button.className = 'btn small';
    button.textContent = `${String(index + 1).padStart(2, '0')} · ${name}${progress.completed.includes(id) ? ' ✓' : ''}`;
    button.disabled = !isEpisodeUnlocked(index, progress);
    button.setAttribute('aria-current', String(story.id === id));
    button.addEventListener('click', () => navigate(id));
    list.appendChild(button);
  });
  picker.appendChild(list);
  if (story.id !== 'harbormaster') {
    const original = document.createElement('button');
    original.className = 'btn small';
    original.textContent = '기존 항만 작전';
    original.addEventListener('click', () => navigate('harbormaster'));
    picker.appendChild(original);
  }
  titleActions.after(picker);
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

