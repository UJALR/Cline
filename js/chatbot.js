(function () {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatStatus = document.getElementById("chatStatus");
  const sendButton = document.getElementById("chatSend");
  const quickPromptButtons = Array.from(document.querySelectorAll("[data-chat-prompt]"));

  const API_ENDPOINTS = [
    "/chat",
    "https://cline-1-gotw.onrender.com/chat"
  ];

  let isWaiting = false;

  const initialGreeting =
    "Hi there! I'm the AI assistant for Ujjawal Rai. Ask me about skills, projects, services, or how to start a project.";
  addMessage("assistant", initialGreeting);

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || isWaiting) return;
    await sendMessage(text);
  });

  quickPromptButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (isWaiting) return;
      const prompt = btn.getAttribute("data-chat-prompt") || btn.textContent;
      if (!prompt) return;
      await sendMessage(prompt.trim());
    });
  });

  async function sendMessage(text) {
    addMessage("user", text);
    chatInput.value = "";
    setStatus("Thinking...");
    setWaiting(true);

    for (const url of API_ENDPOINTS) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text })      // ✅ FIXED
        });

        const data = await response.json();
        if (data.reply) {
          addMessage("assistant", data.reply);
          break;
        }
      } catch (e) {}
    }

    setStatus("");
    setWaiting(false);
  }

  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = `chat-message chat-message-${role}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = role === "assistant" ? "AI" : "You";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    wrap.append(avatar, bubble);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setStatus(msg) {
    if (chatStatus) chatStatus.textContent = msg;
  }

  function setWaiting(flag) {
    isWaiting = flag;
    chatInput.disabled = flag;
    sendButton.disabled = flag;
  }
})();
