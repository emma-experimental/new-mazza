(function () {
  if (window.ChatWidgetLoaded) return;
  window.ChatWidgetLoaded = true;

  const config = window.ChatWidgetConfig || {
    webhookUrl: '',
    companyName: 'AI Assistant',
    companyLogo: 'https://via.placeholder.com/32',
    primaryColor: '#10b981',
  };

  if (!config.webhookUrl) {
    console.error('ChatWidgetConfig.webhookUrl is required');
    return;
  }

  // === DOM ELEMENTS ===
  const widget = document.createElement('div');
  widget.id = 'ai-chat-widget';
  widget.innerHTML = `
    <style>
      #ai-chat-widget * { box-sizing: border-box; }
      #ai-chat-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .chat-launcher {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: ${config.primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 9999;
      }
      .chat-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 550px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        border: 1px solid #e2e8f0;
        z-index: 9999;
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      .chat-window.open {
        display: flex;
      }
      .chat-header {
        padding: 14px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: space-between;
      }
      .chat-header img {
        width: 32px;
        height: 32px;
        border-radius: 8px;
      }
      .chat-header h3 {
        margin: 0;
        font-size: 15px;
        color: #1e293b;
        font-weight: 600;
      }
      .chat-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #64748b;
        cursor: pointer;
      }
      .chat-body {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8fafc;
      }
      .chat-input {
        padding: 12px 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 10px;
      }
      .chat-input input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        outline: none;
        font-size: 14px;
        min-height: 40px;
      }
      .chat-input button {
        background: ${config.primaryColor};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
      }
      .form-screen, .chat-screen {
        display: none;
      }
      .form-screen.active, .chat-screen.active {
        display: flex;
        flex-direction: column;
      }
      .form-field {
        margin-bottom: 12px;
      }
      .form-field label {
        display: block;
        font-size: 14px;
        color: #334155;
        margin-bottom: 6px;
        text-align: left;
      }
      .form-field input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 14px;
      }
      .submit-btn {
        background: ${config.primaryColor};
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 15px;
        cursor: pointer;
        font-weight: 500;
      }
      .message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        line-height: 1.4;
        font-size: 14px;
        word-wrap: break-word;
      }
      .bot-message {
        background: white;
        border: 1px solid #e2e8f0;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .user-message {
        background: ${config.primaryColor};
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      .typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        border-bottom-left-radius: 4px;
        align-self: flex-start;
        width: fit-content;
      }
      .typing-dot {
        width: 8px;
        height: 8px;
        background: #94a3b8;
        border-radius: 50%;
        animation: blink 1.4s infinite both;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes blink {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }
    </style>
    <button class="chat-launcher" id="launcher">💬</button>
    <div class="chat-window" id="chatWindow">
      <div class="chat-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${config.companyLogo}" alt="${config.companyName}">
          <h3>${config.companyName}</h3>
        </div>
        <button class="chat-close" id="closeChat">×</button>
      </div>
      <div class="chat-body">
        <div class="form-screen active" id="formScreen">
          <h3 style="text-align:left; margin:0 0 16px;">Let's get started</h3>
          <p style="text-align:left; font-size:14px; color:#64748b; margin:0 0 16px;">Please share your details so we can help you better.</p>
          <div class="form-field">
            <label for="userName">Name</label>
            <input type="text" id="userName" placeholder="Your full name">
          </div>
          <div class="form-field">
            <label for="userEmail">Email</label>
            <input type="email" id="userEmail" placeholder="you@example.com">
          </div>
          <div class="form-field">
            <label for="userPhone">Phone</label>
            <input type="tel" id="userPhone" placeholder="+1 234 567 890">
          </div>
          <button class="submit-btn" id="startChatBtn">Start Conversation</button>
        </div>
        <div class="chat-screen" id="chatScreen">
          <div class="messages" id="messages"></div>
          <div class="chat-input">
            <input type="text" id="userMessage" placeholder="Type your message..." autocomplete="off">
            <button id="sendBtn">➤</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // === DOM REFERENCES ===
  const launcher = document.getElementById('launcher');
  const chatWindow = document.getElementById('chatWindow');
  const formScreen = document.getElementById('formScreen');
  const chatScreen = document.getElementById('chatScreen');
  const messagesContainer = document.getElementById('messages');
  const startChatBtn = document.getElementById('startChatBtn');

  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userPhone = document.getElementById('userPhone');

  const userMessage = document.getElementById('userMessage');
  const sendBtn = document.getElementById('sendBtn');
  const closeChat = document.getElementById('closeChat');

  let isChatStarted = false;

  // === FUNCTIONS ===
  function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  async function sendToN8n(data) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      hideTyping();
      addMessage(result.response);
    } catch (error) {
      hideTyping();
      addMessage("Sorry, I couldn't reach the server. Please try again.");
    }
  }

  // === EVENT LISTENERS ===
  launcher.addEventListener('click', () => {
    chatWindow.classList.add('open');
  });

  closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  startChatBtn.addEventListener('click', () => {
    const name = userName.value.trim();
    const email = userEmail.value.trim();
    const phone = userPhone.value.trim();

    if (!name || !email || !phone) {
      alert('Please fill in all fields');
      return;
    }

    formScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    isChatStarted = true;

    showTyping();
    sendToN8n({
      name,
      email,
      phone,
      message: "I want to start a conversation."
    });
  });

  function sendMessage() {
    const text = userMessage.value.trim();
    if (!text || !isChatStarted) return;

    addMessage(text, true);
    userMessage.value = '';
    showTyping();

    sendToN8n({
      name: userName.value.trim(),
      email: userEmail.value.trim(),
      phone: userPhone.value.trim(),
      message: text
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  userMessage.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
