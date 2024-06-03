import React, { useState, useEffect } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import Statistics from './Statistics';

const API_KEY = "YOUR_OPENAI_API_KEY";
const systemMessage = {
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
};

const initialMessages = [
  {
    message: "Hello, I'm ChatGPT! Ask me anything!",
    sentTime: "just now",
    sender: "ChatGPT"
  }
];

function App() {
  const [sessions, setSessions] = useState({}); // Store multiple sessions
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [view, setView] = useState('chat'); // New state for toggling views
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem('chatSessions')) || {};
    setSessions(storedSessions);
    const firstSessionId = Object.keys(storedSessions)[0];
    setCurrentSessionId(firstSessionId || createNewSession("Default Session"));
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions, currentSessionId]);

  const createNewSession = (name) => {
    const newSessionId = name || `session-${Date.now()}`;
    setSessions(prevSessions => ({
      ...prevSessions,
      [newSessionId]: { messages: initialMessages, name: newSessionId }
    }));
    setCurrentSessionId(newSessionId);
    return newSessionId;
  };

  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const deleteSession = () => {
    if (!currentSessionId) return;
    const updatedSessions = { ...sessions };
    delete updatedSessions[currentSessionId];
    setSessions(updatedSessions);
    const nextSessionId = Object.keys(updatedSessions)[0] || createNewSession("Default Session");
    setCurrentSessionId(nextSessionId);
  };

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...(sessions[currentSessionId]?.messages || []), newMessage];
    
    setSessions(prevSessions => ({
      ...prevSessions,
      [currentSessionId]: { ...prevSessions[currentSessionId], messages: newMessages }
    }));

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    try {
      let apiMessages = chatMessages.map((messageObject) => {
        let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
        return { role: role, content: messageObject.message };
      });

      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
          systemMessage,
          ...apiMessages
        ]
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", 
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      const data = await response.json();

      if (response.ok) {
        setSessions(prevSessions => ({
          ...prevSessions,
          [currentSessionId]: { ...prevSessions[currentSessionId], messages: [...chatMessages, {
            message: data.choices[0].message.content,
            sender: "ChatGPT"
          }] }
        }));
      } else {
        console.error("Error from API:", data);
      }
    } catch (error) {
      console.error("Error processing message to ChatGPT:", error);
    } finally {
      setIsTyping(false);
    }
  }

  const handleClearSession = () => {
    setSessions(prevSessions => ({
      ...prevSessions,
      [currentSessionId]: { ...prevSessions[currentSessionId], messages: initialMessages }
    }));
  };

  const handleNewSessionNameChange = (event) => {
    setNewSessionName(event.target.value);
  };

  const handleCreateNewSession = () => {
    if (newSessionName.trim()) {
      createNewSession(newSessionName.trim());
      setNewSessionName('');
    }
  };

  const getMessageCount = (messages, sender) => {
    return messages.filter(msg => msg.sender === sender).length;
  };

  const currentMessages = sessions[currentSessionId]?.messages || initialMessages;

  return (
    <div className="App">
      <button onClick={() => setView(view === 'chat' ? 'stats' : 'chat')}>
        {view === 'chat' ? 'View Statistics' : 'Back to Chat'}
      </button>
      <input 
        type="text" 
        value={newSessionName} 
        onChange={handleNewSessionNameChange} 
        placeholder="Enter session name" 
      />
      <button onClick={handleCreateNewSession}>New Session</button>
      <select onChange={(e) => switchSession(e.target.value)} value={currentSessionId}>
        {Object.keys(sessions).map(sessionId => (
          <option key={sessionId} value={sessionId}>{sessions[sessionId].name}</option>
        ))}
      </select>
      {view === 'chat' ? (
        <div style={{ position: "relative", height: "800px", width: "700px" }}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
              >
                {currentMessages.map((message, i) => {
                  return <Message key={i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
      ) : (
        <Statistics 
          userMessageCount={getMessageCount(currentMessages, 'user')}
          chatGPTMessageCount={getMessageCount(currentMessages, 'ChatGPT')}
          messages={currentMessages}
        />
      )}
      <button onClick={handleClearSession}>Clear Session</button>
      <button onClick={deleteSession}>Delete Session</button>
    </div>
  );
}

export default App;
