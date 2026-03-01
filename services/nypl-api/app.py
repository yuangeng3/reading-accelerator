"""Flask API wrapping NYPL Playwright automation.

Endpoints:
  GET  /api/check?title=...&isbn=...  — Check branch availability (no auth)
  POST /api/hold                       — Place a hold (requires NYPL creds)
  GET  /api/account                    — Get holds + checkouts (requires NYPL creds)
  GET  /health                         — Health check

Designed to run on NixiHost (104.225.208.28) with gunicorn.
"""

import asyncio
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from nypl_catalog import check_availability, place_hold, get_holds_and_checkouts, cleanup

app = Flask(__name__)

# Allow requests from reads.fatfirewoman.com and localhost
CORS(app, origins=[
    "https://reads.fatfirewoman.com",
    "http://localhost:3000",
    "http://localhost:3001",
])

# Simple API key for hold/account endpoints (set in env)
API_KEY = os.environ.get("NYPL_API_KEY", "")


def require_api_key(f):
    """Decorator to require API key for authenticated endpoints."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key", "")
        if not API_KEY or key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def run_async(coro):
    """Run an async function from sync Flask context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/check")
def check():
    """Check NYPL availability for a book. No auth required."""
    title = request.args.get("title", "")
    isbn = request.args.get("isbn")

    if not title and not isbn:
        return jsonify({"error": "title or isbn parameter required"}), 400

    try:
        result = run_async(check_availability(title=title, isbn=isbn))
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/hold", methods=["POST"])
@require_api_key
def hold():
    """Place a hold at NYPL. Requires API key + NYPL creds in env."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    title = data.get("title", "")
    pickup_branch = data.get("pickup_branch", "")
    isbn = data.get("isbn")

    if not title or not pickup_branch:
        return jsonify({"error": "title and pickup_branch required"}), 400

    try:
        result = run_async(place_hold(title=title, pickup_branch=pickup_branch, isbn=isbn))
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/account")
@require_api_key
def account():
    """Get current holds and checkouts. Requires API key + NYPL creds in env."""
    try:
        result = run_async(get_holds_and_checkouts())
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.teardown_appcontext
def shutdown(exception=None):
    """Cleanup browser on app shutdown."""
    try:
        run_async(cleanup())
    except Exception:
        pass


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
