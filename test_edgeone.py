import os

from openai import OpenAI

API_KEY = os.environ.get("MAKERS_MODELS_KEY")

if not API_KEY:
    raise RuntimeError("MAKERS_MODELS_KEY is not set.")

client = OpenAI(
api_key=API_KEY,
base_url="https://ai-gateway.edgeone.link/v1",
)

response = client.chat.completions.create(
model="@makers/deepseek-v4-flash",
temperature=0.2,
messages=[
{
"role": "user",
"content": "Reply with exactly: EdgeOne connection successful.",
}
],
)

print(response.choices[0].message.content)