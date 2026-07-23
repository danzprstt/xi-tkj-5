const OWNER = process.env.GITHUB_OWNER || 'danzprstt';
const REPO = process.env.GITHUB_REPO || 'x-tkj-4';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN; // GitHub PAT, scope: repo (contents read/write). RAHASIA.

function ghHeaders() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN belum di-set di environment variables.');
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function apiUrl(path) {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
}

/**
 * Ambil isi file dari repo. Return null kalau file belum ada (bukan error —
 * berguna untuk file baru seperti foto/lagu siswa yang baru pertama kali upload).
 */
export async function getFile(path) {
  const res = await fetch(apiUrl(path), { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFile gagal (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return {
    sha: data.sha,
    contentText: Buffer.from(data.content, 'base64').toString('utf8'),
    contentBase64: data.content.replace(/\n/g, ''),
  };
}

/**
 * Tulis/update file di repo. `contentBase64` = isi file dalam base64 (dipakai
 * baik untuk teks maupun file biner seperti jpg/mp3). `sha` wajib diisi kalau
 * file SUDAH ADA (didapat dari getFile), dikosongkan kalau file baru.
 */
export async function putFile({ path, contentBase64, message, sha }) {
  const body = {
    message,
    content: contentBase64,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub putFile gagal (${res.status}): ${await res.text()}`);
  return res.json();
}
