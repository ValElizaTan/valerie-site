const GITHUB_USER = 'ValElizaTan';
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`;

document.getElementById('year').textContent = new Date().getFullYear();

const themeToggle = document.getElementById('theme-toggle');
const themeLabel = themeToggle.querySelector('.theme-label');

// The button names the theme it switches to: "[ dark ]" in light mode, "[ light ]" in dark mode.
function syncThemeToggle() {
  const dark = document.body.classList.contains('dark');
  themeLabel.textContent = dark ? 'light' : 'dark';
}

themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  try {
    sessionStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch (err) {
    // Storage can be blocked (e.g. private mode); the toggle still works for this page view.
  }
  syncThemeToggle();
});

syncThemeToggle();

function showMessage(container, text) {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  container.replaceChildren(p);
}

function repoRow(repo) {
  const item = document.createElement('li');

  const link = document.createElement('a');
  link.className = 'repo-row';
  link.href = repo.html_url;
  link.rel = 'noopener';

  const name = document.createElement('span');
  name.className = 'repo-name';
  name.textContent = repo.name;

  const meta = document.createElement('span');
  meta.className = 'repo-meta';
  meta.textContent = `${repo.language || 'no language'} · ★ ${repo.stargazers_count}`;

  link.append(name, meta);
  item.append(link);
  return item;
}

async function loadRepos() {
  const container = document.getElementById('repo-list');
  try {
    const res = await fetch(REPOS_URL, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
    const data = await res.json();
    // Skip the profile README repo, which shares the username.
    const repos = Array.isArray(data)
      ? data.filter((repo) => repo.name.toLowerCase() !== GITHUB_USER.toLowerCase())
      : [];
    if (repos.length === 0) {
      showMessage(container, 'No public repositories to show yet.');
      return;
    }
    const list = document.createElement('ul');
    list.className = 'repo-rows';
    list.append(...repos.map(repoRow));
    container.replaceChildren(list);
  } catch (err) {
    console.error(err);
    showMessage(container, 'Could not load repositories right now. See them on GitHub instead.');
  }
}

loadRepos();

// Highlight the nav link for the section currently in view.
const navLinks = new Map(
  [...document.querySelectorAll('.pill-nav a')].map((a) => [a.getAttribute('href').slice(1), a])
);

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const [id, a] of navLinks) {
      if (id === entry.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-40% 0px -55% 0px' });

for (const id of navLinks.keys()) {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
}

const backToTop = document.getElementById('back-to-top');
const hero = document.getElementById('hero');

// Show the button only once the hero has scrolled up out of view.
new IntersectionObserver(([entry]) => {
  const pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
  backToTop.classList.toggle('is-visible', pastHero);
}).observe(hero);

backToTop.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
