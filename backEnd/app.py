from flask import Flask, request, jsonify
from openai import OpenAI
import os 
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)

# ✅ Correct getenv usage
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}

    raw_messages = data.get("messages")
    prompt = (data.get("prompt") or "").strip()

    messages = []

    if isinstance(raw_messages, list) and raw_messages:
        for item in raw_messages:
            role = item.get("role") if isinstance(item, dict) else None
            content = ""
            if isinstance(item, dict):
                content = (item.get("content") or item.get("text") or "").strip()
            if role in {"system", "user", "assistant"} and content:
                messages.append({"role": role, "content": content})

        if not messages:
            return jsonify({"error": "No valid messages provided"}), 400
    elif prompt:
        messages = [{"role": "user", "content": prompt}]
    else:
        return jsonify({"error": "No prompt provided"}), 400

    # Limit conversation to the most recent 12 messages to control token usage
    if len(messages) > 12:
        messages = messages[-12:]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500
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
