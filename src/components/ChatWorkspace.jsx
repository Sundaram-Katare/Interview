import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  Menu, 
  Sun, 
  Moon, 
  Trash, 
  PanelLeftClose, 
  PanelLeftOpen,
  Info
} from 'lucide-react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { getMockResponse } from '../utils/mockAi';
import '../styles/ChatWorkspace.css';

const ChatWorkspace = () => {
  // 1. Session State & LocalStorage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
    return [{
      id: 'session-default',
      title: 'Welcome Chat',
      messages: [],
      createdAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('active_session_id');
    return saved || 'session-default';
  });

  // 2. Theme & Responsive States
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('chat_theme');
    return saved || 'dark';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarActive, setIsMobileSidebarActive] = useState(false);
  
  // 3. Streaming and Interval Refs
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef(null);

  // Sync sessions to localStorage on changes
  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    localStorage.setItem('active_session_id', activeSessionId);
    // When active session changes, clean up any active stream
    cleanupStream();
  }, [activeSessionId]);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chat_theme', theme);
  }, [theme]);

  // Clean up any streaming intervals on unmount
  useEffect(() => {
    return () => cleanupStream();
  }, []);

  const cleanupStream = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Find the currently selected session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Update session messages helper
  const updateSessionMessages = (sessionId, newMessages, title) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: newMessages,
          title: title || s.title
        };
      }
      return s;
    }));
  };

  // Create a new session
  const handleNewChat = () => {
    cleanupStream();
    const newSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsMobileSidebarActive(false);
  };

  // Delete a session
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation(); // Avoid triggering session selection
    
    // If we're deleting the active session, switch active to another one
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        // If no sessions remain, create a default one
        const fallback = {
          id: 'session-default',
          title: 'Welcome Chat',
          messages: [],
          createdAt: Date.now()
        };
        setSessions([fallback]);
        setActiveSessionId(fallback.id);
      }
    }
    
    // Remove session
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Clear current conversation messages
  const handleClearCurrentSession = () => {
    cleanupStream();
    updateSessionMessages(activeSessionId, [], 'Empty Chat');
  };

  // Send message and stream reply
  const handleSendMessage = (text) => {
    if (isStreaming) return;

    // 1. Add User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    // Determine session title auto-naming
    const isFirstMsg = currentSession.messages.length === 0;
    const cleanTitle = isFirstMsg 
      ? (text.length > 20 ? text.slice(0, 20) + '...' : text)
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMsg];
    updateSessionMessages(activeSessionId, updatedMessages, cleanTitle);

    // 2. Generate simulated AI response
    const mockReply = getMockResponse(text);

    // 3. Add AI placeholder message
    const aiMsgId = `assistant-${Date.now()}`;
    const placeholderAiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    const messagesWithPlaceholder = [...updatedMessages, placeholderAiMsg];
    updateSessionMessages(activeSessionId, messagesWithPlaceholder, cleanTitle);

    // 4. Start Character Streaming Loop
    setIsStreaming(true);
    let charIdx = 0;
    const speedMs = 15; // characters per 15 milliseconds for smooth response

    streamIntervalRef.current = setInterval(() => {
      charIdx++;
      const partialResponse = mockReply.slice(0, charIdx);

      // Mutate local state for fast UI rendering
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const updated = s.messages.map(m => {
            if (m.id === aiMsgId) {
              return { ...m, content: partialResponse };
            }
            return m;
          });
          return { ...s, messages: updated };
        }
        return s;
      }));

      // Finish streaming once we reach string length
      if (charIdx >= mockReply.length) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setIsStreaming(false);

        // Turn off isStreaming flag for the message
        setSessions(prev => {
          const finalSessions = prev.map(s => {
            if (s.id === activeSessionId) {
              const updated = s.messages.map(m => {
                if (m.id === aiMsgId) {
                  return { ...m, isStreaming: false };
                }
                return m;
              });
              return { ...s, messages: updated };
            }
            return s;
          });
          localStorage.setItem('chat_sessions', JSON.stringify(finalSessions));
          return finalSessions;
        });
      }
    }, speedMs);
  };

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setIsMobileSidebarActive(false);
  };

  return (
    <div className="chat-workspace">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarActive ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarActive(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`chat-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarActive ? 'active' : ''}`}>
        <div className="sidebar-header">
          <button className="btn-new-chat" onClick={handleNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => selectSession(session.id)}
            >
              <div className="session-title">
                <MessageSquare size={16} />
                <span>{session.title}</span>
              </div>
              {sessions.length > 1 && (
                <button 
                  className="btn-delete-session"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="Delete chat"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="footer-user">
            <div className="user-avatar">AG</div>
            <div className="user-info">
              <span className="user-name">Antigravity User</span>
              <span className="user-role">Frontend Engineer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat Area Container */}
      <main className="chat-area">
        {/* Chat Header */}
        <header className="chat-header">
          <div className="header-left">
            <button 
              className="btn-sidebar-toggle"
              onClick={() => {
                setIsSidebarCollapsed(prev => !prev);
                setIsMobileSidebarActive(prev => !prev);
              }}
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <h1>{currentSession.title}</h1>
          </div>

          <div className="header-actions">
            <button 
              className="btn-icon-action" 
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="tooltip">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button 
              className="btn-icon-action"
              onClick={handleClearCurrentSession}
              disabled={currentSession.messages.length === 0 || isStreaming}
              title="Clear current conversation"
              aria-label="Clear current conversation"
            >
              <Trash size={18} />
              <span className="tooltip">Clear Chat</span>
            </button>
          </div>
        </header>

        {/* Chat Main Stream */}
        <div className="chat-main">
          <MessageList 
            messages={currentSession.messages} 
            onSuggestionClick={handleSendMessage}
            isStreaming={isStreaming}
          />
          <ChatInput 
            onSend={handleSendMessage} 
            isStreaming={isStreaming} 
          />
        </div>
      </main>
    </div>
  );
};

export default ChatWorkspace;
