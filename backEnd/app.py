from flask import Flask, request, jsonify
from openai import OpenAI
import os
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        user_message = (data.get("message") or "").strip()

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # ✅ Load portfolio knowledge
        with open("backEnd/portfolio.txt", "r", encoding="utf-8") as f:
            portfolio_text = f.read()

        system_prompt = f"""
        You are an AI assistant representing Ujjawal Rai.
        You should only answer using the information below.
        Do NOT make up any details.

        --- Portfolio ---
        {portfolio_text}
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
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
