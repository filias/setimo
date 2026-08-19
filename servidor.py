#!/usr/bin/env python3
"""Servidor local para o Sétimo.

O site lê os conteúdos de ficheiros JSON com fetch(), o que o navegador
bloqueia quando se abre o HTML directamente do disco (file://). Este servidor
resolve isso e não tem dependências.

    python3 servidor.py          # http://localhost:8000
    python3 servidor.py 3000     # noutra porta
"""

import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path

RAIZ = Path(__file__).parent.resolve()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RAIZ), **kwargs)

    def end_headers(self):
        # Durante a edição de conteúdos, evita servir JSON em cache.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, formato, *args):
        if "404" in (args[1] if len(args) > 1 else ""):
            super().log_message(formato, *args)


def main() -> None:
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    endereco = f"http://localhost:{porta}"

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", porta), Handler) as servidor:
        print(f"Sétimo a servir em {endereco}  (Ctrl+C para parar)")
        webbrowser.open(endereco)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nAté já.")


if __name__ == "__main__":
    main()
