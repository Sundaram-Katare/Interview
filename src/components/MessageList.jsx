import React, { useRef, useEffect } from 'react';
import { Bot, User, Sparkles, Code2, GraduationCap, RefreshCw } from 'lucide-react';
import '../styles/MessageList.css';

const MessageList = ({ messages, onSuggestionClick, isStreaming }) => {
  const scrollAnchorRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format date helper
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to escape HTML
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Inline formatting helper for Bold & Code snippets
  const parseInlineMarkdown = (text) => {
    let formatted = text;
    // Bold formatting: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code: `code`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    // Replace single newlines with break tags
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  // Parses content blocks to handle paragraph blocks, bullet lists, and code blocks
  const parseMarkdown = (text, isMessageStreaming = false, isLastBlock = false) => {
    if (!text && isMessageStreaming) {
      return <span className="streaming-cursor"></span>;
    }
    if (!text) return null;

    const parts = text.split('```');
    
    return parts.map((part, index) => {
      const isCodeBlock = index % 2 === 1;

      if (isCodeBlock) {
        // Extract language and code contents
        const firstNewLine = part.indexOf('\n');
        let lang = 'code';
        let codeContent = part;

        if (firstNewLine !== -1) {
          lang = part.substring(0, firstNewLine).trim();
          codeContent = part.substring(firstNewLine + 1);
        }

        // Trim ending newline
        if (codeContent.endsWith('\n')) {
          codeContent = codeContent.slice(0, -1);
        }

        return (
          <pre key={index}>
            <div className="code-header">
              <span>{lang}</span>
            </div>
            <code>{escapeHtml(codeContent)}</code>
          </pre>
        );
      }

      // Plain text block - handle paragraphs and lists
      const paragraphs = part.split(/\n\n+/g);

      return paragraphs.map((para, pIdx) => {
        const trimmedPara = para.trim();
        if (!trimmedPara) return null;

        const isLastParagraph = pIdx === paragraphs.length - 1;

        // Bullet point check
        const lines = para.split('\n');
        const isList = lines.length > 1 && lines.every(line => {
          const t = line.trim();
          return t.startsWith('- ') || t.startsWith('* ') || t === '';
        });

        if (isList) {
          return (
            <ul key={`${index}-${pIdx}`}>
              {lines.map((line, lIdx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                const cleanedLine = trimmedLine.replace(/^[\s-*]+/, '');
                
                // Show cursor at the end of the last list item if it's the streaming message
                const showCursor = isMessageStreaming && isLastBlock && isLastParagraph && lIdx === lines.length - 1;

                return (
                  <li key={lIdx}>
                    <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(escapeHtml(cleanedLine)) }} />
                    {showCursor && <span className="streaming-cursor"></span>}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Header check
        if (trimmedPara.startsWith('### ')) {
          const headerText = trimmedPara.replace('### ', '');
          const showCursor = isMessageStreaming && isLastBlock && isLastParagraph;
          return (
            <h3 key={`${index}-${pIdx}`}>
              <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(escapeHtml(headerText)) }} />
              {showCursor && <span className="streaming-cursor"></span>}
            </h3>
          );
        }

        // Regular paragraph
        const showCursor = isMessageStreaming && isLastBlock && isLastParagraph;
        return (
          <p key={`${index}-${pIdx}`}>
            <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(escapeHtml(trimmedPara)) }} />
            {showCursor && <span className="streaming-cursor"></span>}
          </p>
        );
      });
    });
  };

  const suggestions = [
    {
      title: "Say Hello",
      desc: "Simulate a friendly AI response greeting",
      icon: <Sparkles size={16} />,
      prompt: "Hello!"
    },
    {
      title: "Write some code",
      desc: "Get a simulated React hook code block",
      icon: <Code2 size={16} />,
      prompt: "Write a React hook for localStorage"
    },
    {
      title: "What is React?",
      desc: "Learn about the core concepts of React",
      icon: <GraduationCap size={16} />,
      prompt: "Explain React"
    },
    {
      title: "How to clear history",
      desc: "Get steps on how to reset this workspace",
      icon: <RefreshCw size={16} />,
      prompt: "How do I clear the chat history?"
    }
  ];

  return (
    <div className="message-list-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-logo">
            <Bot size={36} />
          </div>
          <h2>Antigravity Workspace</h2>
          <p>
            Welcome to your premium React chat interface. Submit a prompt below to see the simulated real-time character-by-character response streaming!
          </p>
          <div className="suggestions-grid">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="suggestion-card"
                onClick={() => onSuggestionClick(s.prompt)}
                disabled={isStreaming}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>{s.icon}</span>
                  <span className="suggestion-title">{s.title}</span>
                </div>
                <span className="suggestion-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="message-list-inner">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div key={msg.id || index} className={`message-row ${msg.role} animate-slideup`}>
                <div className="message-item">
                  <div className={`avatar-wrapper ${msg.role}`}>
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-meta">
                      <span>{isUser ? 'You' : 'Assistant'}</span>
                      <span>•</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-bubble">
                      {isUser 
                        ? parseInlineMarkdown(escapeHtml(msg.content))
                        : parseMarkdown(msg.content, msg.isStreaming, true)
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollAnchorRef} className="scroll-anchor" />
        </div>
      )}
    </div>
  );
};

export default MessageList;
