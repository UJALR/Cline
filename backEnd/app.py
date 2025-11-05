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
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    incoming_messages = data.get("messages")

    # ✅ Load portfolio text (VERY IMPORTANT)
    try:
        portfolio_path = os.path.join(os.path.dirname(__file__), "portfolio.txt")
        with open(portfolio_path, "r", encoding="utf-8") as f:
            portfolio_content = f.read()
    except:
        portfolio_content = "Portfolio file missing."

    # ✅ System / Memory instruction
    system_instruction = f"""
You are ChatGPT, a friendly and knowledgeable AI assistant representing web developer **Ujjawal Rai**.

• Respond to users with the same helpful tone and breadth of knowledge as ChatGPT.
• When a question is related to Ujjawal Rai, his work, or anything in the portfolio, rely on the portfolio information below.
• If the portfolio doesn't cover a requested detail about Ujjawal, say you're not sure but invite the user to ask about his skills, projects, or experience.
• For topics unrelated to Ujjawal, answer using your general knowledge just like ChatGPT would.

--- PORTFOLIO DATA START ---
{portfolio_content}
--- PORTFOLIO DATA END ---
"""

    # ✅ Send to OpenAI
    try:
        messages_payload = [{"role": "system", "content": system_instruction}]

        if isinstance(incoming_messages, list) and incoming_messages:
            for item in incoming_messages:
                if not isinstance(item, dict):
                    continue

                role = item.get("role")
                if role not in ("user", "assistant"):
                    continue

                content = (item.get("content") or item.get("text") or "").strip()
                if not content:
                    continue

                messages_payload.append({"role": role, "content": content})

        elif prompt:
            messages_payload.append({"role": "user", "content": prompt})

        if len(messages_payload) == 1:
            return jsonify({"error": "No valid prompt provided"}), 400

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_payload,
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
