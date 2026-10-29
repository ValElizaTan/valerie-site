const GITHUB_USER = 'ValElizaTan';
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`;

document.getElementById('year').textContent = new Date().getFullYear();

function showMessage(container, text) {
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;
  container.replaceChildren(p);
}

function repoCard(repo) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = repo.name;

  const desc = document.createElement('p');
  desc.textContent = repo.description || 'No description provided.';

  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  const lang = document.createElement('span');
  lang.textContent = repo.language || 'No language';
  const stars = document.createElement('span');
  stars.textContent = `★ ${repo.stargazers_count}`;
  stars.setAttribute('aria-label', `${repo.stargazers_count} stars`);
  meta.append(lang, stars);

  const link = document.createElement('a');
  link.href = repo.html_url;
  link.rel = 'noopener';
  link.textContent = 'View repository →';

  card.append(title, desc, meta, link);
  return card;
}

async function loadRepos() {
  const container = document.getElementById('repo-list');
  try {
    const res = await fetch(REPOS_URL, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      showMessage(container, 'No public repositories to show yet.');
      return;
    }
    container.replaceChildren(...repos.map(repoCard));
  } catch (err) {
    console.error(err);
    showMessage(container, 'Could not load repositories right now. See them on GitHub instead.');
  }
}

loadRepos();
