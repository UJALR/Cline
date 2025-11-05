from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Load OpenAI client safely
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # ✅ Load portfolio text (VERY IMPORTANT)
    try:
        portfolio_path = os.path.join(os.path.dirname(__file__), "portfolio.txt")
        with open(portfolio_path, "r", encoding="utf-8") as f:
            portfolio_content = f.read()
    except:
        portfolio_content = "Portfolio file missing."

    # ✅ System / Memory instruction
    system_instruction = f"""
You are an AI assistant for web developer **Ujjawal Rai**.

Always answer questions ONLY using information from the portfolio.
If the user asks something NOT in the portfolio, respond with:
"I'm not sure about that, but you can ask me about my skills, projects, or experience."

--- PORTFOLIO DATA START ---
{portfolio_content}
--- PORTFOLIO DATA END ---
"""

    # ✅ Send to OpenAI
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            max_tokens=350
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": "gpt-4o-mini",
        "api": "online"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "message": "Portfolio Chatbot API",
        "endpoints": ["/chat", "/health"]
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
