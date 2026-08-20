# Sétimo

Um site sobre o 7.º ano de escolaridade em Portugal: as disciplinas, o currículo
oficial (Aprendizagens Essenciais da DGE) e atividades para fazer fora da sala de aula.

No ar em **<https://setimo.filias.dev>**.

HTML, CSS e JavaScript sem build. O conteúdo vive em ficheiros JSON, separado da marcação.

## Correr

```bash
python3 server.py
```

Abre em `http://localhost:8000`. É preciso servidor porque o site lê os JSON com
`fetch()`, e o navegador bloqueia isso em `file://`.

## Estrutura

```
index.html          Grelha das disciplinas do 7.º ano
subject.html        Página genérica; a disciplina vem de ?subject=<id>
css/style.css       Folha única, com tokens em :root e tema claro/escuro
js/common.js        Tema, carregamento de JSON, criação de elementos
js/home.js          Grelha da página inicial
js/subject.js       Renderização de domínios, subdomínios, AE e atividades
data/               O conteúdo todo
favicon.svg         O sete cortado; o .ico e o PNG de 180 px ao lado
favicons/           Os seis desenhos que estiveram em cima da mesa
server.py           Servidor local sem dependências
deploy/             Webhook de publicação e unidade systemd
```

O código é todo em inglês — nomes de ficheiros, classes, funções, variáveis e
chaves de JSON. Em português fica só o que se lê no ecrã: os valores do JSON, o
texto das páginas e as mensagens ao utilizador. Os `id` das disciplinas e dos
domínios (`fisico-quimica`, `espaco`) também ficam em português, porque são
identificadores de conteúdo e aparecem no endereço.

## As três camadas de leitura

Cada subdomínio tem duas escritas do mesmo assunto, e o botão no topo escolhe o que se vê:

| Modo | Mostra |
|---|---|
| **Aluno** | Só o texto narrativo, as perguntas e as atividades |
| **Ambos** | Tudo, com as Aprendizagens Essenciais recolhidas num painel |
| **Currículo** | Aprendizagens Essenciais abertas, narrativa reduzida a contexto |

A escolha fica guardada em `localStorage`.

## Acrescentar uma disciplina

1. Cria `data/<id>.json` com a mesma forma de `data/fisico-quimica.json`.
2. Em `data/subjects.json`, muda o `status` dessa disciplina para `"ready"`.

O `id` da disciplina é o nome do ficheiro e o valor de `?subject=` no endereço.

### Forma de `data/<id>.json`

As chaves são em inglês, os valores em português.

```jsonc
{
  "id": "…", "name": "…", "emoji": "…", "year": "7.º ano", "cycle": "…",
  "intro": "…",            // enquadramento da disciplina
  "studentIntro": "…",     // a mesma coisa, para o aluno
  "source": { "title": "…", "publisher": "…", "url": "…", "note": "…" },
  "domains": [{
    "id": "…", "name": "…", "emoji": "…", "summary": "…",
    "subtopics": [{
      "id": "…", "name": "…",
      "student": "…",            // camada do aluno
      "questions": ["…"],        // perguntas de arranque
      "essentials": ["…"],       // descritores oficiais das AE, texto literal
      "activities": [{
        "title": "…", "type": "…", "duration": "…",
        "materials": ["…"], "steps": ["…"],
        "curriculumLink": "…",   // que descritor do currículo é que isto cobre
        "safety": "…",           // opcional: segurança
        "reflection": "…"        // pergunta de fecho
      }]
    }]
  }]
}
```

As cores por domínio estão em `DOMAIN_COLORS`, em `js/subject.js`. Um domínio
sem entrada nesse mapa usa a cor da marca.

## Sobre as fontes

O texto na camada «Aprendizagens Essenciais (oficial)» é transcrito dos documentos
homologados pela [Direção-Geral da Educação](https://www.dge.mec.pt/aprendizagens-essenciais-0),
ao abrigo do artigo 38.º do Decreto-Lei n.º 55/2018, de 6 de julho. As atividades,
as perguntas e os textos «para ti» são propostas próprias e não têm carácter oficial.

## A matriz

Treze disciplinas. A Língua Estrangeira II está fixada no **Francês**, que é a
oferta desta escola; noutras pode ser Espanhol ou Alemão. O Complemento à
Educação Artística varia da mesma maneira, com o projeto educativo de cada
escola. A EMRC, de frequência facultativa, não consta desta matriz.

## Estado

- [x] Físico-Química — 3 domínios, 9 subdomínios, 41 descritores das AE, 20 atividades
- [ ] As restantes doze disciplinas da matriz do 7.º ano

## Publicação

Um push para `main` publica em <https://setimo.filias.dev>. O GitHub chama
`https://setimo.filias.dev/deploy`, o `deploy/webhook.py` verifica a assinatura
HMAC e faz `git pull --ff-only` em `/opt/setimo`. O Caddy serve a pasta tal como
está — não há passo de build, e o que está no repositório é o que fica no ar.

| Peça | Onde |
|---|---|
| Repositório | <https://github.com/filias/setimo> |
| Ficheiros | `/opt/setimo`, clonado com uma chave de leitura própria |
| Bloco do Caddy | `/etc/caddy/Caddyfile`, host `setimo.filias.dev` |
| Serviço | `setimo-webhook.service`, à escuta em `127.0.0.1:9017` |
| Segredo | `/etc/setimo-webhook.env`, o mesmo que está no webhook do GitHub |

O bloco do Caddy:

```caddy
setimo.filias.dev {
	handle /deploy {
		reverse_proxy localhost:9017
	}
	handle {
		root * /opt/setimo
		file_server {
			hide .git deploy
		}
		encode gzip
	}
}
```

O `hide` é preciso: sem ele o `file_server` serve `/.git/`, e com ela toda a
história do repositório.

### Montar de novo

Se for preciso repor isto num servidor limpo:

1. `ssh-keygen -t ed25519 -f /root/.ssh/setimo_deploy -N ""` e junta a pública
   às *deploy keys* do repositório, só de leitura.
2. Um `Host github-setimo` em `/root/.ssh/config` a apontar para essa chave.
3. `git clone git@github-setimo:filias/setimo.git /opt/setimo`.
4. `printf 'WEBHOOK_SECRET=%s\n' "$(openssl rand -hex 32)" > /etc/setimo-webhook.env`
   com `umask 077`, e o mesmo segredo no webhook do GitHub.
5. `cp deploy/setimo-webhook.service /etc/systemd/system/` e
   `systemctl enable --now setimo-webhook`.
6. O bloco acima no `/etc/caddy/Caddyfile`, `caddy validate` e `systemctl reload caddy`.

### Confirmar que está bom

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://setimo.filias.dev/   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://setimo.filias.dev/.git/config  # 404
ssh memi 'git -C /opt/setimo rev-parse --short HEAD'                  # igual ao local
```

Se um push não chegar ao ar, a entrega fica registada no GitHub, em
*Settings → Webhooks*, com o pedido e a resposta.
