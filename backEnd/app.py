from flask import Flask, request, jsonify
from openai import OpenAI
import os 
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv(("OPENAI_API_KEY")))
@app.route("/gpt", methods=["POST"])
def gpt():
    data = request.get_json()
    prompt = data.get("prompt", "")
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/summarize-portfolio", methods=["POST"])
def summarize_portfolio():
    try:
        portfolio_context = """
        You are analyzing a web developer portfolio. Please provide a concise, professional summary highlighting:
        - Key skills and technologies
        - Notable projects and achievements
        - Professional experience and certifications
        - Overall strengths and specialties
        
        
        """
        
        data = request.get_json()
        user_request = data.get("request", "Summarize this portfolio")
        
        full_prompt = f"{portfolio_context}\n\nUser Request: {user_request}"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": full_prompt}],
            max_tokens=300
        )
        
        summary = response.choices[0].message.content
        return jsonify({"summary": summary})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Portfolio summarizer API is running", "model": "gpt-4o-mini"})

@app.route("/")
def home():
    return jsonify({
        "message": "Portfolio Summarizer API", 
        "status": "running",
        "ai_model": "gpt-4o-mini"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
