import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import '../styles/ChatInput.css';

const ChatInput = ({ onSend, isStreaming }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = 'auto';
    // Set to scrollHeight (constrained by max-height in CSS)
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  // Focus input on mount and when streaming completes
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isStreaming) return;

    onSend(text.trim());
    setText('');
    
    // Reset textarea height manually after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-wrapper">
        <div className="chat-input-fields">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={isStreaming ? "AI is typing..." : "Type your message here..."}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <button
            type="submit"
            className="btn-send"
            disabled={!text.trim() || isStreaming}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="chat-input-footer">
          <div className="input-tip">
            <CornerDownLeft size={12} />
            <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
          </div>
          <div className="char-count">
            {text.length} characters
          </div>
        </div>
      </form>
      <div className="footer-disclaimer">
        Antigravity Chat Workspace • Responses are locally simulated for testing
      </div>
    </div>
  );
};

export default ChatInput;
