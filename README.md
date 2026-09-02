# Sétimo

A site about the seventh grade in Portugal: the subjects, the official curriculum
(the DGE's *Aprendizagens Essenciais*) and activities to do outside the classroom.

Live at **<https://setimo.filias.dev>**.

The repository also holds a second, separate site for the eighth grade under
`oitavo/`, live at **<https://oitavo.filias.dev>**. See [The eighth
grade](#the-eighth-grade).

HTML, CSS and JavaScript, no build step. The content lives in JSON files, kept
apart from the markup.

## Running it

```bash
python3 server.py
```

Opens at `http://localhost:8000`. A server is needed because the site reads its
JSON with `fetch()`, which browsers block over `file://`.

## Layout

```
index.html          Grid of the seventh-grade subjects
subject.html        Generic page; the subject comes from ?subject=<id>
css/style.css       Single stylesheet, tokens on :root, light and dark themes
js/common.js        Theme, JSON loading, element creation
js/home.js          The home-page grid
js/subject.js       Renders domains, subtopics, essentials and activities
data/               All of the content
favicon.svg         The crossed seven; the .ico and 180 px PNG sit beside it
favicons/           The six designs that were on the table
server.py           Local server, no dependencies
deploy/             Publish webhook and its systemd unit
oitavo/             The eighth-grade site, standing on its own
```

The code is entirely in English — filenames, classes, functions, variables and
JSON keys. Portuguese is reserved for what appears on screen: the JSON values,
the page copy and the messages shown to the reader. Subject and domain `id`s
(`fisico-quimica`, `espaco`) stay Portuguese too, since they are content
identifiers and show up in the URL.

## The three reading layers

Every subtopic is written twice, and the button in the header picks what you see:

| Mode | Shows |
|---|---|
| **Aluno** | Only the narrative text, the questions and the activities |
| **Ambos** | Everything, with the essentials folded into a panel |
| **Currículo** | Essentials opened, narrative reduced to context |

The choice is kept in `localStorage`.

## Adding a subject

1. Create `data/<id>.json` in the same shape as `data/fisico-quimica.json`.
2. In `data/subjects.json`, change that subject's `status` to `"ready"`.

A subject's `id` is both its filename and the value of `?subject=` in the URL.

### Shape of `data/<id>.json`

Keys in English, values in Portuguese.

```jsonc
{
  "id": "…", "name": "…", "emoji": "…", "year": "7.º ano", "cycle": "…",
  "intro": "…",            // framing of the subject
  "studentIntro": "…",     // the same thing, for the student
  "source": { "title": "…", "publisher": "…", "url": "…", "note": "…" },
  "domains": [{
    "id": "…", "name": "…", "emoji": "…", "summary": "…",
    "subtopics": [{
      "id": "…", "name": "…",
      "student": "…",            // the student layer
      "questions": ["…"],        // opening questions
      "essentials": ["…"],       // official descriptors, verbatim
      "activities": [{
        "title": "…", "type": "…", "duration": "…",
        "materials": ["…"], "steps": ["…"],
        "curriculumLink": "…",   // which descriptor this activity covers
        "safety": "…",           // optional: safety note
        "reflection": "…"        // closing question
      }]
    }]
  }]
}
```

Each domain may carry a `palette`, one of `indigo`, `green`, `orange`, `purple`,
`crimson`, `teal`, `amber` or `slate`. The values live in `css/style.css` and are
defined for both themes; a domain with no palette falls back to the brand colour.
Colours belong to the data rather than to a map in the code, because domain ids
repeat across subjects — `gramatica` and `leitura` appear in three of them.

## About the sources

The text in the «Aprendizagens Essenciais (oficial)» layer is transcribed from the
documents ratified by the [Direção-Geral da Educação](https://www.dge.mec.pt/aprendizagens-essenciais-0),
under article 38 of Decree-Law 55/2018 of 6 July. The activities, the questions
and the «para ti» passages are our own and carry no official standing.

Eleven of the twelve subjects have an *Aprendizagens Essenciais* document.
**Cidadania e Desenvolvimento has none** — by design: it is a curricular component
whose domains each school's Conselho de Turma chooses from a national list. Its
official layer therefore transcribes the *Estratégia Nacional de Educação para a
Cidadania*, and the page says so rather than implying a document that does not
exist. A subject renames that layer through an optional `source.layer`:

```jsonc
"source": {
  "title": "…", "publisher": "…", "url": "…", "note": "…",
  "layer": {                       // all three keys optional
    "name": "Estratégia Nacional de Educação para a Cidadania",  // default: "Aprendizagens Essenciais"
    "noun": "excertos",            // default: "descritores"
    "sourceLabel": "Documento oficial"   // default: "Currículo oficial"
  }
}
```

## The matrix

Twelve subjects. Second Foreign Language is fixed as **French**, which is what
this school offers; elsewhere it may be Spanish or German. Complemento à Educação
Artística and EMRC are not part of this matrix — the first is a school-by-school
offer, the second optional to attend.

## Status

- [x] Físico-Química — 3 domains, 9 subtopics, 41 essential descriptors, 20 activities
- [x] Português — 5 domains, 10 subtopics, 42 essential descriptors, 21 activities
- [x] Inglês (LE I) — 3 domains, 9 subtopics, 15 essential descriptors, 14 activities
- [x] Francês (LE II) — 3 domains, 6 subtopics, 10 essential descriptors, 9 activities
- [x] História — 4 domains, 12 subtopics, 53 essential descriptors, 14 activities
- [x] Geografia — 2 domains, 6 subtopics, 25 essential descriptors, 10 activities
- [x] Matemática — 4 domains, 17 subtopics, 107 essential descriptors, 21 activities
- [x] Ciências Naturais — 1 domain, 5 subtopics, 31 essential descriptors, 10 activities
- [x] Educação Visual — 3 domains, 6 subtopics, 14 essential descriptors, 7 activities
- [x] TIC — 4 domains, 7 subtopics, 28 essential descriptors, 7 activities
- [x] Educação Física — 3 domains, 8 subtopics, 24 essential descriptors, 11 activities
- [x] Cidadania e Desenvolvimento — 4 domains, 7 subtopics, 28 excerpts, 11 activities

All twelve subjects of the matrix are covered.

## The eighth grade

`oitavo/` is a **separate site, not a second mode of this one**. It has its own
`index.html`, `subject.html`, stylesheet, scripts, data and icons, and shares
nothing with the seventh-grade site but the repository and the deploy webhook.
The two can drift apart without either one breaking.

```
oitavo/
  index.html          Grid of the eighth-grade subjects
  subject.html        Generic page; the subject comes from ?subject=<id>
  css/style.css       Its own copy of the stylesheet
  js/                 Its own copy of common.js, home.js, subject.js
  data/               The eighth-grade content
  favicon.svg         The eight; the .ico and 180 px PNG sit beside it
```

Everything in *Adding a subject* above applies unchanged inside `oitavo/data/`.
`python3 server.py` serves both: the seventh grade at `/` and the eighth at
`/oitavo/`.

## Publishing

A push to `main` publishes both sites. GitHub calls
`https://setimo.filias.dev/deploy`, `deploy/webhook.py` checks the HMAC signature
and runs `git pull --ff-only` in `/opt/setimo`. Caddy serves the folder as it
stands — no build step, so what is in the repository is what goes live. One pull
updates both hosts, because both are rooted in the same working copy.

| Piece | Where |
|---|---|
| Repository | <https://github.com/filias/setimo> |
| Files | `/opt/setimo`, cloned with its own read-only key |
| Caddy blocks | `/etc/caddy/Caddyfile`, hosts `setimo.filias.dev` and `oitavo.filias.dev` |
| Service | `setimo-webhook.service`, listening on `127.0.0.1:9017` |
| Secret | `/etc/setimo-webhook.env`, matching the one in the GitHub webhook |

The Caddy blocks:

```caddy
setimo.filias.dev {
	handle /deploy {
		reverse_proxy localhost:9017
	}
	handle {
		root * /opt/setimo
		file_server {
			hide .git deploy oitavo
		}
		encode gzip
	}
}

oitavo.filias.dev {
	root * /opt/setimo/oitavo
	file_server
	encode gzip
}
```

The `hide` matters: without it `file_server` serves `/.git/`, and with it the
whole history of the repository. `oitavo` is hidden from the seventh-grade host
so that the eighth-grade site is reachable only under its own domain, rather than
at both `oitavo.filias.dev/` and `setimo.filias.dev/oitavo/`.

Only the seventh-grade host carries the `/deploy` route; one webhook updates the
working copy that both hosts are served from.

### Setting it up again

To restore this on a clean server:

1. `ssh-keygen -t ed25519 -f /root/.ssh/setimo_deploy -N ""` and add the public
   half to the repository's deploy keys, read-only.
2. A `Host github-setimo` entry in `/root/.ssh/config` pointing at that key.
3. `git clone git@github-setimo:filias/setimo.git /opt/setimo`.
4. `printf 'WEBHOOK_SECRET=%s\n' "$(openssl rand -hex 32)" > /etc/setimo-webhook.env`
   under `umask 077`, and the same secret in the GitHub webhook.
5. `cp deploy/setimo-webhook.service /etc/systemd/system/` and
   `systemctl enable --now setimo-webhook`.
6. The block above in `/etc/caddy/Caddyfile`, then `caddy validate` and
   `systemctl reload caddy`.

### Checking it worked

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://setimo.filias.dev/   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://setimo.filias.dev/.git/config  # 404
ssh memi 'git -C /opt/setimo rev-parse --short HEAD'                  # matches local
```

If a push does not reach the air, the delivery is recorded on GitHub under
*Settings → Webhooks*, with both the request and the response.
