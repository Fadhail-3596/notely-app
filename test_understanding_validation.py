import importlib.util


MODULE_PATH = "cloud-functions/api/refine/index.py"

spec = importlib.util.spec_from_file_location(
    "notely_refine",
    MODULE_PATH,
)

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


raw_result = """
{
  "main_topic": "Photosynthesis",
  "summary": "Photosynthesis is how plants convert light energy into chemical energy, primarily in the chloroplasts of plant cells.",
  "context": "A biology or plant science note explaining the basic process and location of photosynthesis.",
  "key_concepts": [
    "Photosynthesis",
    "Light energy conversion",
    "Chemical energy",
    "Chloroplasts",
    "Plant cells"
  ]
}
"""


parsed = module.parse_json_result(raw_result)

print("=== PARSED ===")
print(parsed)

print()
print("=== VALID ===")
print(module.validate_understanding_result(parsed))

print()
print("=== NORMALIZED ===")
print(module.normalize_understanding_result(raw_result))
