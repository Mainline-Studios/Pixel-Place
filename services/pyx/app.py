"""
Pyx content filter HTTP service.
Run: pip install -r requirements.txt && pip install pyx_ai && python app.py

Set PYX_SERVICE_URL in Pixel Place .env to point here (e.g. http://localhost:5001).
"""

import os
import re
from flask import Flask, request, jsonify

app = Flask(__name__)

BAN_LINE = 0.7


def censor_letters(text: str) -> str:
    """Replace every letter (A-Z, a-z) with ~."""
    if not text:
        return text
    return re.sub(r'[A-Za-z]', '~', text)


def get_score(text: str) -> float:
    """
    Get Pyx score (0=safe, 1=bad).
    Uses pyx_ai if installed; otherwise placeholder (0 = pass through).
    """
    try:
        from pyx_ai import PyxAI, BAN_LINE as _  # noqa: F401
        pyx = PyxAI()
        return float(pyx.score(text))
    except ImportError:
        # No pyx_ai: pass through (score 0)
        return 0.0


@app.route('/score', methods=['POST'])
def score():
    """POST { text: string } -> { score: number }"""
    data = request.get_json() or {}
    text = data.get('text', '') or ''
    s = get_score(text)
    return jsonify(score=s)


@app.route('/filter', methods=['POST'])
def filter_text():
    """POST { text: string } -> { filtered: string, score: number }"""
    data = request.get_json() or {}
    text = data.get('text', '') or ''
    s = get_score(text)
    filtered = censor_letters(text) if s >= BAN_LINE else text
    return jsonify(filtered=filtered, score=s)


@app.route('/health', methods=['GET'])
def health():
    return jsonify(status='ok')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
