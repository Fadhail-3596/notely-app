import importlib.util
from http.server import HTTPServer


HOST = "127.0.0.1"
PORT = 8000

MODULE_PATH = "cloud-functions/api/refine/index.py"

spec = importlib.util.spec_from_file_location(
    "notely_refine",
    MODULE_PATH,
)

if spec is None or spec.loader is None:
    raise RuntimeError("Could not load Python Cloud Function.")

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

handler = module.handler

server = HTTPServer((HOST, PORT), handler)

print(f"Notely Python service running at http://{HOST}:{PORT}")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
finally:
    server.server_close()
