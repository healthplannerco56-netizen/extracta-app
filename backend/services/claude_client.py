"""Thin wrapper around the Anthropic Python SDK."""
import os
from anthropic import Anthropic

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def extract_fields(chunk: str, prompt_template: str) -> str:
    """Send a chunk + prompt to Claude and return raw text response."""
    client = get_client()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[
            {"role": "user", "content": prompt_template.replace("{{CHUNK}}", chunk)}
        ],
    )
    return message.content[0].text
