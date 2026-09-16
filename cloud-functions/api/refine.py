import json
import os
from http.server import BaseHTTPRequestHandler

from openai import OpenAI


MAX_NOTE_LENGTH = 14000

API_KEY = os.environ.get("MAKERS_MODELS_KEY")

if not API_KEY:
    raise RuntimeError("MAKERS_MODELS_KEY is not set.")


client = OpenAI(
    api_key=API_KEY,
    base_url="https://ai-gateway.edgeone.link/v1",
)


def parse_json_result(result):
    if isinstance(result, dict):
        return result

    if not isinstance(result, str):
        return None

    try:
        return json.loads(result)
    except (json.JSONDecodeError, TypeError):
        return None


def validate_understanding_result(result):
    if not isinstance(result, dict):
        return False

    required_keys = {
        "main_topic",
        "summary",
        "context",
        "key_concepts",
    }

    if not required_keys.issubset(result.keys()):
        return False

    if not isinstance(result["main_topic"], str):
        return False

    if not isinstance(result["summary"], str):
        return False

    if not isinstance(result["context"], str):
        return False

    if not isinstance(result["key_concepts"], list):
        return False

    if not all(
        isinstance(item, str)
        for item in result["key_concepts"]
    ):
        return False

    return True


def understand_note(note):
    prompt = f"""
You are the note-understanding component of Notely.

Analyze the user's note and identify its meaning,
main topic, context, and important concepts.

Return a JSON object with exactly these fields:

{{
  "main_topic": "...",
  "summary": "...",
  "context": "...",
  "key_concepts": ["...", "..."]
}}

Rules:
- Return valid JSON only.
- Do not use Markdown fences.
- Do not invent information that is not reasonably supported by the note.
- Keep the analysis concise.

Note:
{note}
""".strip()

    response = client.chat.completions.create(
        model="@makers/deepseek-v4-flash",
        temperature=0.1,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "AI returned an empty understanding response."
        )

    return content.strip()


def refine_note(note, style=""):
    prompt = f"""
You are the AI core of Notely.

Refine the following note into clear,
accurate, academically appropriate prose.

Selected style:
{style or "Default"}

Original note:
{note}

Return only the refined note.

Rules:
- Preserve the original meaning.
- Improve clarity, structure, grammar, and precision.
- Do not invent unsupported facts.
- Do not add citations.
- Do not add headings unless they are necessary.
- Do not explain what you changed.
- Return only the refined note.
""".strip()

    response = client.chat.completions.create(
        model="@makers/deepseek-v4-flash",
        temperature=0.2,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "AI returned an empty refinement response."
        )

    return content.strip()


class handler(BaseHTTPRequestHandler):

    def send_json(self, data, status_code=200):
        body = json.dumps(
            data,
            ensure_ascii=False,
        ).encode("utf-8")

        self.send_response(status_code)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )

        self.send_header(
            "Content-Length",
            str(len(body)),
        )

        self.end_headers()

        try:
            self.wfile.write(body)
        except (ConnectionAbortedError, BrokenPipeError):
            pass

    def do_GET(self):
        self.send_json(
            {
                "status": "ok",
                "service": "notely-python",
                "message": "Python Cloud Function is ready.",
            }
        )

    def do_POST(self):
        try:
            # ---------------------------------
            # 1. Read request body
            # ---------------------------------

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0,
                )
            )

            raw_body = self.rfile.read(content_length)

            body = json.loads(
                raw_body.decode("utf-8")
            )

            # ---------------------------------
            # 2. Extract input
            # ---------------------------------

            input_data = body.get("input", {})
            optional_data = body.get("optional", {})

            if not isinstance(input_data, dict):
                self.send_json(
                    {
                        "error": "Input must be an object."
                    },
                    400,
                )
                return

            if not isinstance(optional_data, dict):
                self.send_json(
                    {
                        "error": "Optional must be an object."
                    },
                    400,
                )
                return

            note = input_data.get("note")
            style = optional_data.get("style", "")

            # ---------------------------------
            # 3. Validate request
            # ---------------------------------

            if (
                not isinstance(note, str)
                or not note.strip()
            ):
                self.send_json(
                    {
                        "error": "Note is required."
                    },
                    400,
                )
                return

            note = note.strip()

            if len(note) > MAX_NOTE_LENGTH:
                self.send_json(
                    {
                        "error": (
                            f"Note must not exceed "
                            f"{MAX_NOTE_LENGTH} characters."
                        )
                    },
                    400,
                )
                return

            if not isinstance(style, str):
                self.send_json(
                    {
                        "error": "Style must be a string."
                    },
                    400,
                )
                return

            style = style.strip()

            # ---------------------------------
            # 4. Understand note
            # ---------------------------------

            understanding_raw = understand_note(note)

            understanding = parse_json_result(
                understanding_raw
            )

            if not validate_understanding_result(
                understanding
            ):
                raise RuntimeError(
                    "Invalid understanding result."
                )

            # ---------------------------------
            # 5. Refine note
            # ---------------------------------

            refined_note = refine_note(
                note,
                style,
            )

            # ---------------------------------
            # 6. Build response
            # ---------------------------------

            result = {
                "refined_note": refined_note,

                "key_points": understanding[
                    "key_concepts"
                ],

                "citations_used": [],

                "uncertainties": [
                    "Academic evidence retrieval is not connected yet.",
                    "Claim extraction and evidence verification are not connected yet.",
                ],

                "understanding": understanding,
            }

            # ---------------------------------
            # 7. Send response
            # ---------------------------------

            self.send_json(
                result,
                200,
            )

        except json.JSONDecodeError:
            self.send_json(
                {
                    "error": "Invalid JSON request body."
                },
                400,
            )

        except ValueError:
            self.send_json(
                {
                    "error": "Invalid Content-Length header."
                },
                400,
            )

        except Exception as error:
            print(
                "AI service error:",
                repr(error),
            )

            self.send_json(
                {
                    "error": "AI refinement failed."
                },
                500,
            )

if __name__ == "__main__":
    from http.server import HTTPServer

    server = HTTPServer(
        ("127.0.0.1", 8000),
        handler,
    )

    print("Notely Python service running on http://127.0.0.1:8000")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nNotely Python service stopped.")
    finally:
        server.server_close()