(function () {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    return;
  }

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatStatus = document.getElementById('chatStatus');
  const sendButton = document.getElementById('chatSend');
  const quickPromptButtons = Array.from(document.querySelectorAll('[data-chat-prompt]'));
  const notify = typeof window.showNotification === 'function' ? window.showNotification : null;

  if (!chatForm || !chatInput || !sendButton) {
    return;
  }

  const API_ENDPOINTS = ['/chat', 'https://cline-1-gotw.onrender.com/chat'];
  const SYSTEM_PROMPT = "You are Ujjawal Rai's friendly portfolio assistant. Answer questions using the details from the" +
    " portfolio site, highlighting skills, experience, and ways to work with Ujjawal. Keep responses concise," +
    " professional, and inviting.";

  const conversation = [];
  let isWaitingForResponse = false;

  const initialGreeting = "Hi there! I'm the AI assistant for Ujjawal Rai's portfolio. Ask me about his skills," +
    " experience, services, or how to start a project together.";

  addMessage('assistant', initialGreeting);
  renderMessages();

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isWaitingForResponse) {
      return;
    }

    const userInput = chatInput.value.trim();
    if (!userInput) {
      if (notify) {
        notify('Please enter a message before sending.', 'error');
      }
      chatInput.focus();
      return;
    }

    await handleUserMessage(userInput);
  });

  quickPromptButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (isWaitingForResponse) {
        return;
      }
      const prompt = button.getAttribute('data-chat-prompt') || button.textContent || '';
      if (!prompt) {
        return;
      }
      chatInput.value = '';
      await handleUserMessage(prompt.trim());
    });
  });

  async function handleUserMessage(messageText) {
    const trimmed = messageText.trim();
    if (!trimmed) {
      return;
    }

    addMessage('user', trimmed);
    chatInput.value = '';
    setWaitingState(true);
    setStatus('Thinking...');

    try {
      const reply = await requestAssistantReply();
      if (!reply) {
        throw new Error('No reply received from assistant.');
      }
      addMessage('assistant', reply.trim());
      setStatus('');
    } catch (error) {
      console.error(error);
      if (conversation.length && conversation[conversation.length - 1].role === 'user') {
        conversation.pop();
      }
      setStatus('Something went wrong. Please try again.');
      renderMessages();
      chatInput.value = trimmed;
      if (notify) {
        notify('Unable to reach the AI assistant. Please try again in a moment.', 'error');
      }
    } finally {
      setWaitingState(false);
    }
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

    if (isWaitingForResponse) {
      chatMessages.appendChild(createTypingIndicator());
    }

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

    const paragraphs = message.text.split(/\n{2,}/).map((segment) => segment.trim()).filter(Boolean);
    if (paragraphs.length === 0) {
      const paragraph = document.createElement('p');
      paragraph.textContent = message.text.trim();
      bubble.appendChild(paragraph);
    } else {
      paragraphs.forEach((segment) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = segment;
        bubble.appendChild(paragraph);
      });
    }

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

    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'chat-dot';
      bubble.appendChild(dot);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function setStatus(message) {
    if (!chatStatus) {
      return;
    }
    chatStatus.textContent = message;
  }

  function setWaitingState(isWaiting) {
    isWaitingForResponse = isWaiting;
    chatInput.disabled = isWaiting;
    sendButton.disabled = isWaiting;
    quickPromptButtons.forEach((button) => {
      button.disabled = isWaiting;
    });
    renderMessages();
    if (!isWaiting) {
      chatInput.focus();
    }
  }

  async function requestAssistantReply() {
    const payloadMessages = buildOpenAIMessages();
    let lastError;

    for (const url of API_ENDPOINTS) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: payloadMessages })
        });

        const data = await response.json();
        if (!response.ok) {
          const errorMessage = data?.error || `Request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        if (data && typeof data.reply === 'string') {
          return data.reply;
        }

        if (data && data.error) {
          throw new Error(data.error);
        }

        throw new Error('Unexpected response from assistant.');
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to reach assistant.');
  }

  function buildOpenAIMessages() {
    const recentMessages = conversation.slice(-10).map((message) => ({
      role: message.role,
      content: message.text
    }));

    return [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages
    ];
  }
})();
