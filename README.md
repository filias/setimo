# Sétimo

Um site sobre o 7.º ano de escolaridade em Portugal: as disciplinas, o currículo
oficial (Aprendizagens Essenciais da DGE) e atividades para fazer fora da sala de aula.

No ar em **<https://setimo.filias.dev>**.

HTML, CSS e JavaScript sem build. O conteúdo vive em ficheiros JSON, separado da marcação.

## Correr

```bash
python3 servidor.py
```

Abre em `http://localhost:8000`. É preciso servidor porque o site lê os JSON com
`fetch()`, e o navegador bloqueia isso em `file://`.

## Estrutura

```
index.html          Grelha das disciplinas do 7.º ano
disciplina.html     Página genérica; a disciplina vem de ?d=<id>
css/estilo.css      Folha única, com tokens em :root e tema claro/escuro
js/comum.js         Tema, carregamento de JSON, criação de elementos
js/inicio.js        Grelha da página inicial
js/disciplina.js    Renderização de domínios, subdomínios, AE e atividades
dados/              O conteúdo todo
servidor.py         Servidor local sem dependências
```

## As três camadas de leitura

Cada subdomínio tem duas escritas do mesmo assunto, e o botão no topo escolhe o que se vê:

| Modo | Mostra |
|---|---|
| **Aluno** | Só o texto narrativo, as perguntas e as atividades |
| **Ambos** | Tudo, com as Aprendizagens Essenciais recolhidas num painel |
| **Currículo** | Aprendizagens Essenciais abertas, narrativa reduzida a contexto |

A escolha fica guardada em `localStorage`.

## Acrescentar uma disciplina

1. Cria `dados/<id>.json` com a mesma forma de `dados/fisico-quimica.json`.
2. Em `dados/disciplinas.json`, muda o `estado` dessa disciplina para `"pronto"`.

O `id` da disciplina é o nome do ficheiro e o valor de `?d=` no endereço.

### Forma de `dados/<id>.json`

```jsonc
{
  "id": "…", "nome": "…", "emoji": "…", "ano": "7.º ano", "ciclo": "…",
  "intro": "…",            // enquadramento da disciplina
  "paraTiIntro": "…",      // a mesma coisa, para o aluno
  "fonte": { "titulo": "…", "editor": "…", "url": "…", "nota": "…" },
  "dominios": [{
    "id": "…", "nome": "…", "emoji": "…", "sumario": "…",
    "subdominios": [{
      "id": "…", "nome": "…",
      "paraTi": "…",             // camada do aluno
      "perguntas": ["…"],        // perguntas de arranque
      "ae": ["…"],               // descritores oficiais, texto literal
      "atividades": [{
        "titulo": "…", "tipo": "…", "duracao": "…",
        "material": ["…"], "passos": ["…"],
        "ligacao": "…",          // que descritor do currículo é que isto cobre
        "cuidado": "…",          // opcional: segurança
        "reflexao": "…"          // pergunta de fecho
      }]
    }]
  }]
}
```

As cores por domínio estão em `CORES_DOMINIO`, em `js/disciplina.js`. Um domínio
sem entrada nesse mapa usa a cor da marca.

## Sobre as fontes

O texto na camada «Aprendizagens Essenciais (oficial)» é transcrito dos documentos
homologados pela [Direção-Geral da Educação](https://www.dge.mec.pt/aprendizagens-essenciais-0),
ao abrigo do artigo 38.º do Decreto-Lei n.º 55/2018, de 6 de julho. As atividades,
as perguntas e os textos «para ti» são propostas próprias e não têm carácter oficial.

## Estado

- [x] Físico-Química — 3 domínios, 9 subdomínios, 41 descritores das AE, 20 atividades
- [ ] As restantes doze disciplinas da matriz do 7.º ano

## Publicação

Um push para `main` publica em `setimo.filias.dev`. O GitHub chama
`https://setimo.filias.dev/deploy`, o `deploy/webhook.py` verifica a assinatura
HMAC e faz `git pull --ff-only` em `/opt/setimo`. O Caddy serve a pasta tal como
está — não há passo de build.

| Peça | Onde |
|---|---|
| Ficheiros | `/opt/setimo` no servidor |
| Bloco do Caddy | `/etc/caddy/Caddyfile`, host `setimo.filias.dev` |
| Serviço | `setimo-webhook.service`, à escuta em `127.0.0.1:9017` |
| Segredo | `/etc/setimo-webhook.env` |
