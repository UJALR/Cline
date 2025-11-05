(function () {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatStatus = document.getElementById('chatStatus');
  const sendButton = document.getElementById('chatSend');
  const quickPromptButtons = Array.from(document.querySelectorAll('[data-chat-prompt]'));
  const notify = typeof window.showNotification === 'function' ? window.showNotification : null;

  if (!chatForm || !chatInput || !sendButton) return;

  // ✅ Updated to /chat
  const API_ENDPOINTS = ['/chat', 'https://cline-1-gotw.onrender.com/chat'];

  const conversation = [];
  let isWaitingForResponse = false;

  const initialGreeting =
    "Hi there! I'm the AI assistant for Ujjawal Rai's portfolio. Ask me about his skills, experience, services, or how to start a project together.";

  addMessage('assistant', initialGreeting);
  renderMessages();

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isWaitingForResponse) return;

    const userInput = chatInput.value.trim();
    if (!userInput) {
      if (notify) notify('Please enter a message before sending.', 'error');
      chatInput.focus();
      return;
    }

    await handleUserMessage(userInput);
  });

  quickPromptButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (isWaitingForResponse) return;
      const prompt = button.getAttribute('data-chat-prompt') || button.textContent || '';
      if (!prompt) return;
      chatInput.value = '';
      await handleUserMessage(prompt.trim());
    });
  });

  async function handleUserMessage(messageText) {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    addMessage('user', trimmed);
    chatInput.value = '';
    setWaitingState(true);
    setStatus('Thinking...');

    try {
      const reply = await requestAssistantReply(trimmed);
      if (!reply) throw new Error('No reply received from assistant.');
      addMessage('assistant', reply.trim());
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus('Something went wrong. Please try again.');
      if (notify) notify('Unable to reach the AI assistant. Please try again in a moment.', 'error');
    } finally {
      setWaitingState(false);
    }
  }

  async function requestAssistantReply(lastMessage) {
    let lastError;

    for (const url of API_ENDPOINTS) {
      try {
        // ✅ Send correct JSON shape
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: lastMessage })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || `Status ${response.status}`);

        if (typeof data.reply === 'string') return data.reply;
        throw new Error('Unexpected response');
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to reach assistant.');
  }

  function addMessage(role, text) {
    conversation.push({ role, text });
    renderMessages();
  }

  function renderMessages() {
    chatMessages.innerHTML = '';
    conversation.forEach((message) => {
      const messageElement = createMessageElement(message);
      chatMessages.appendChild(messageElement);
    });

    if (isWaitingForResponse) chatMessages.appendChild(createTypingIndicator());
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function createMessageElement(message) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-message chat-message-${message.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = message.role === 'assistant' ? 'AI' : 'You';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = message.text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function createTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message chat-message-assistant chat-message-typing';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'chat-dot';
      bubble.appendChild(dot);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function setStatus(message) {
    if (chatStatus) chatStatus.textContent = message;
  }

  function setWaitingState(isWaiting) {
    isWaitingForResponse = isWaiting;
    chatInput.disabled = isWaiting;
    sendButton.disabled = isWaiting;
    quickPromptButtons.forEach((button) => (button.disabled = isWaiting));
    renderMessages();
    if (!isWaiting) chatInput.focus();
  }
})();
