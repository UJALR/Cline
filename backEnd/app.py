from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ✅ Allow all domains to call API (required for S3 + browser)
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Load API key correctly
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/chat", methods=["POST"])
def chat():
    # ✅ Safely parse JSON even if Render sends weird headers
    data = request.get_json(force=True, silent=True) or {}

    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )

        reply = response.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Portfolio chatbot API is running",
        "model": "gpt-4o-mini"
    })


@app.route("/")
def home():
    return jsonify({
        "message": "Portfolio Chatbot API",
        "status": "running",
        "ai_model": "gpt-4o-mini"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
