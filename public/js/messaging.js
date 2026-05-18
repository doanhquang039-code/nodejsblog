(function () {
  const conversationsList = document.getElementById("conversationsList");
  const emptyChat = document.getElementById("emptyChat");
  const chatContent = document.getElementById("chatContent");
  const messagesArea = document.getElementById("messagesArea");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  let activeConversationId = null;

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || body.error || "Request failed");
    }
    return body.data;
  }

  function showState(message) {
    conversationsList.innerHTML = `<div class="empty-state">${message}</div>`;
  }

  function renderConversations(data) {
    const conversations = data.conversations || [];
    if (!conversations.length) {
      showState("Chưa có cuộc trò chuyện nào.");
      return;
    }

    conversationsList.innerHTML = conversations
      .map((conversation) => {
        const title = conversation.name || `Cuộc trò chuyện #${conversation.id}`;
        const lastMessage = conversation.lastMessage?.content || "Chưa có tin nhắn";
        return `
          <button class="conversation-item" data-id="${conversation.id}">
            <div class="conversation-avatar">${title.charAt(0).toUpperCase()}</div>
            <div class="conversation-info">
              <div class="conversation-name">${title}</div>
              <div class="conversation-last-message">${lastMessage}</div>
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderMessages(data) {
    const messages = data.messages || [];
    messagesArea.innerHTML = messages
      .map((message) => `
        <div class="message-group">
          <div class="message-content">
            <div class="message-sender">${message.sender?.name || "User"}</div>
            <div class="message-bubble">${message.content}</div>
            <div class="message-time">${new Date(message.created_at).toLocaleString("vi-VN")}</div>
          </div>
        </div>
      `)
      .join("");
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  async function loadConversations() {
    try {
      renderConversations(await api("/api/conversations"));
    } catch (error) {
      showState(error.message);
    }
  }

  async function openConversation(id) {
    activeConversationId = id;
    emptyChat.style.display = "none";
    chatContent.style.display = "block";
    renderMessages(await api(`/api/conversations/${id}/messages`));
    await api(`/api/conversations/${id}/read`, { method: "PUT" }).catch(() => null);
  }

  async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !activeConversationId) return;

    await api(`/api/conversations/${activeConversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    messageInput.value = "";
    await openConversation(activeConversationId);
  }

  conversationsList?.addEventListener("click", (event) => {
    const item = event.target.closest(".conversation-item");
    if (item) openConversation(item.dataset.id).catch((error) => alert(error.message));
  });

  sendBtn?.addEventListener("click", () => sendMessage().catch((error) => alert(error.message)));
  messageInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage().catch((error) => alert(error.message));
    }
  });

  loadConversations();
})();
