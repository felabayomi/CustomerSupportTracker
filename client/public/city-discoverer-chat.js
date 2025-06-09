(function() {
  'use strict';

  // Configuration - Update these URLs when deploying
  const CHAT_SERVER_URL = window.location.protocol === 'https:' ? 
    'wss://YOUR_REPLIT_DOMAIN.replit.app' : 
    'ws://localhost:5000';
  const API_BASE_URL = window.location.protocol === 'https:' ? 
    'https://YOUR_REPLIT_DOMAIN.replit.app' : 
    'http://localhost:5000';

  // Chat Widget Class
  class CityDiscovererChat {
    constructor(options = {}) {
      this.options = {
        websiteUrl: window.location.hostname,
        brandColor: options.brandColor || '#3b82f6',
        companyName: options.companyName || 'City Discoverer',
        welcomeMessage: options.welcomeMessage || 'I can help you discover cities, build smart itineraries, and even book flights, hotels, or car rentals with exclusive agency discounts. Whether you\'re exploring locally or going global—I\'m here to make travel easy. How can I assist you today?',
        position: options.position || 'bottom-right',
        ...options
      };

      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.messages = [];
      this.isOpen = false;
      this.isMinimized = false;
      this.unreadCount = 0;
      this.ws = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;

      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.connectWebSocket();
      this.addWelcomeMessage();
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .cd-chat-widget {
          position: fixed;
          ${this.options.position.includes('right') ? 'right: 20px' : 'left: 20px'};
          ${this.options.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .cd-chat-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.options.brandColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .cd-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .cd-chat-button svg {
          width: 28px;
          height: 28px;
          fill: white;
        }

        .cd-chat-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .cd-chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }

        .cd-chat-window.open {
          display: flex;
        }

        .cd-chat-header {
          background: ${this.options.brandColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cd-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .cd-chat-controls {
          display: flex;
          gap: 8px;
        }

        .cd-chat-controls button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .cd-chat-controls button:hover {
          opacity: 1;
          background: rgba(255,255,255,0.1);
        }

        .cd-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .cd-message {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .cd-message.user {
          flex-direction: row-reverse;
        }

        .cd-message-content {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }

        .cd-message.agent .cd-message-content {
          background: white;
          border: 1px solid #e5e7eb;
          color: #374151;
        }

        .cd-message.user .cd-message-content {
          background: ${this.options.brandColor};
          color: white;
        }

        .cd-message-time {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
        }

        .cd-chat-input {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }

        .cd-input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .cd-input-group input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }

        .cd-input-group input:focus {
          border-color: ${this.options.brandColor};
        }

        .cd-send-button {
          background: ${this.options.brandColor};
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cd-send-button:hover {
          background: ${this.adjustColor(this.options.brandColor, -20)};
        }

        .cd-send-button svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .cd-connection-status {
          padding: 8px 16px;
          background: #fef3c7;
          color: #92400e;
          font-size: 12px;
          text-align: center;
          display: none;
        }

        .cd-connection-status.disconnected {
          display: block;
          background: #fee2e2;
          color: #dc2626;
        }

        .cd-connection-status.connected {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    adjustColor(color, amount) {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + amount;
      let g = (num >> 8 & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.className = 'cd-chat-widget';
      widget.innerHTML = `
        <button class="cd-chat-button" onclick="cityDiscovererChat.toggle()">
          <svg viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="cd-chat-badge" style="display: none;">0</span>
        </button>

        <div class="cd-chat-window">
          <div class="cd-connection-status disconnected">
            Connecting...
          </div>
          
          <div class="cd-chat-header">
            <h3>${this.options.companyName}</h3>
            <div class="cd-chat-controls">
              <button onclick="cityDiscovererChat.close()" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="cd-chat-messages"></div>

          <div class="cd-chat-input">
            <div class="cd-input-group">
              <input type="text" placeholder="Type your message..." onkeypress="cityDiscovererChat.handleKeyPress(event)">
              <button class="cd-send-button" onclick="cityDiscovererChat.sendMessage()">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.widget = widget;
    }

    connectWebSocket() {
      const wsUrl = `${CHAT_SERVER_URL}/public-ws`;
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('City Discoverer Chat: Connected');
          this.reconnectAttempts = 0;
          this.updateConnectionStatus(true);
          
          // Send session info
          this.ws.send(JSON.stringify({
            type: 'init_public_session',
            sessionId: this.sessionId,
            websiteUrl: this.options.websiteUrl
          }));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'public_chat_message') {
              this.addMessage(data.message);
            }
          } catch (error) {
            console.error('City Discoverer Chat: Message error:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('City Discoverer Chat: Disconnected');
          this.updateConnectionStatus(false);
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('City Discoverer Chat: Connection error:', error);
          this.updateConnectionStatus(false);
        };

      } catch (error) {
        console.error('City Discoverer Chat: Failed to connect:', error);
        this.updateConnectionStatus(false);
        this.scheduleReconnect();
      }
    }

    scheduleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => this.connectWebSocket(), delay);
      }
    }

    updateConnectionStatus(connected) {
      const status = this.widget.querySelector('.cd-connection-status');
      if (connected) {
        status.className = 'cd-connection-status connected';
      } else {
        status.className = 'cd-connection-status disconnected';
        status.textContent = 'Connecting...';
      }
    }

    addWelcomeMessage() {
      this.addMessage({
        id: 'welcome',
        message: this.options.welcomeMessage,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        agentName: 'Support Agent'
      });
    }

    addMessage(message) {
      this.messages.push(message);
      
      if (message.sender === 'agent' && !this.isOpen) {
        this.unreadCount++;
        this.updateUnreadBadge();
      }

      this.renderMessages();
      this.scrollToBottom();
    }

    renderMessages() {
      const container = this.widget.querySelector('.cd-chat-messages');
      container.innerHTML = this.messages.map(msg => `
        <div class="cd-message ${msg.sender}">
          <div class="cd-message-content">
            ${msg.message}
            <div class="cd-message-time">
              ${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              ${msg.agentName ? ` • ${msg.agentName}` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    sendMessage() {
      const input = this.widget.querySelector('input');
      const message = input.value.trim();
      
      if (!message || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const userMessage = {
        id: `user_${Date.now()}`,
        message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };

      this.addMessage(userMessage);
      input.value = '';

      // Send to server
      this.ws.send(JSON.stringify({
        type: 'public_chat_message',
        sessionId: this.sessionId,
        message,
        websiteUrl: this.options.websiteUrl
      }));
    }

    handleKeyPress(event) {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.widget.querySelector('.cd-chat-window').classList.add('open');
      this.unreadCount = 0;
      this.updateUnreadBadge();
      this.scrollToBottom();
      
      setTimeout(() => {
        this.widget.querySelector('input').focus();
      }, 100);
    }

    close() {
      this.isOpen = false;
      this.widget.querySelector('.cd-chat-window').classList.remove('open');
    }

    updateUnreadBadge() {
      const badge = this.widget.querySelector('.cd-chat-badge');
      if (this.unreadCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      } else {
        badge.style.display = 'none';
      }
    }

    scrollToBottom() {
      const messages = this.widget.querySelector('.cd-chat-messages');
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // Auto-initialize when DOM is ready
  function initCityDiscovererChat() {
    if (window.cityDiscovererChat) {
      return;
    }

    const script = document.querySelector('script[src*="city-discoverer-chat.js"]');
    const config = {};
    
    if (script) {
      const brandColor = script.getAttribute('data-brand-color');
      const companyName = script.getAttribute('data-company-name');
      const welcomeMessage = script.getAttribute('data-welcome-message');
      const position = script.getAttribute('data-position');
      
      if (brandColor) config.brandColor = brandColor;
      if (companyName) config.companyName = companyName;
      if (welcomeMessage) config.welcomeMessage = welcomeMessage;
      if (position) config.position = position;
    }

    window.cityDiscovererChat = new CityDiscovererChat(config);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCityDiscovererChat);
  } else {
    initCityDiscovererChat();
  }

})();