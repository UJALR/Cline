async function askGPT() {
  const userInput = document.getElementById("userInput").value;
  const responseEl = document.getElementById("response");
  responseEl.textContent = "Thinking...";

  const res = await fetch("https://cline-1-gotw.onrender.com/summarize-portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userInput })
  });

  const data = await res.json();
  responseEl.textContent = data.reply || "Error: No response.";
}