import importlib.util


MODULE_PATH = "cloud-functions/api/refine/index.py"

spec = importlib.util.spec_from_file_location(
    "notely_refine",
    MODULE_PATH,
)

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


note = """
Photosynthesis is the process by which plants convert
light energy into chemical energy. It mainly occurs in
the chloroplasts of plant cells.
"""


result = module.understand_note(note)

print("=== UNDERSTANDING RESULT ===")
print(result)
