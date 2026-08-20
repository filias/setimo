#!/usr/bin/env python3
"""Local development server for Sétimo.

The site reads its content from JSON files via fetch(), which the browser
blocks when the HTML is opened straight off disk (file://). This server works
around that and has no dependencies.

    python3 server.py          # http://localhost:8000
    python3 server.py 3000     # on another port
"""

import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).parent.resolve()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # While editing content, never serve JSON from cache.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "404" in (args[1] if len(args) > 1 else ""):
            super().log_message(fmt, *args)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    address = f"http://localhost:{port}"

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), Handler) as server:
        print(f"Sétimo a servir em {address}  (Ctrl+C para parar)")
        webbrowser.open(address)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nAté já.")


if __name__ == "__main__":
    main()
