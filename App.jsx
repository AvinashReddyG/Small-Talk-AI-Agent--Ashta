import { ThemeProvider, useTheme } from './context/ThemeContext';
import ChatbotIcon from "./components/ChatbotIcon";
import UserIcon from "./components/UserIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import VoiceModeButton from "./components/VoiceModeButton";
import { useState, useRef, useEffect } from "react";
import { companyInfo } from "./companyInfo";
import { voiceService } from "./services/voiceService";

const AppContent = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [refreshCount, setRefreshCount] = useState({});
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const chatBodyRef = useRef();
  const optionsRef = useRef();

  const resetConversation = () => {
    setChatHistory([
      {
        hideInChat: true,
        role: "model",
        text: companyInfo,
      },
    ]);
    setRefreshCount({});
  };

  const generateBotResponse = async (
    history,
    messageId = null,
    isRefresh = false,
  ) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError, id: messageId || Date.now() },
      ]);

      // Speak the response if voice mode is enabled
      if (!isError && isVoiceMode) {
        voiceService.speak(text);
      }
    };

    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    if (isRefresh && messageId) {
      const currentRefreshCount = refreshCount[messageId] || 0;
      const variationPrompts = [
        `Please provide a completely different response than before. This is variation #${currentRefreshCount + 1}. Be original and approach the question from a new angle.`,
        `I need a fresh perspective on this question. Your previous response was good, but please think differently this time (variation #${currentRefreshCount + 1}).`,
        `Generate a creative alternative to your previous answer. Ensure this response (variation #${currentRefreshCount + 1}) uses different examples and reasoning.`,
        `Reimagine your response entirely. For this variation #${currentRefreshCount + 1}, use a different tone, structure, and approach than before.`,
      ];

      const randomPrompt =
        variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

      const variationHint = {
        role: "user",
        parts: [{ text: randomPrompt }],
      };
      history.push(variationHint);
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        generationConfig: {
          temperature: isRefresh ? 1.0 + Math.random() * 0.5 : 0.7,
          topP: isRefresh ? 0.95 : 0.9,
          topK: isRefresh ? 40 : 20,
          maxOutputTokens: isRefresh
            ? 800 + Math.floor(Math.random() * 400)
            : 800,
        },
      }),
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error.message || "Something went wrong!");

      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiResponseText);

      if (isRefresh && messageId) {
        setRefreshCount((prev) => ({
          ...prev,
          [messageId]: (prev[messageId] || 0) + 1,
        }));
      }
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  const handleRefresh = (botMessage) => {
    const botIndex = chatHistory.findIndex((msg) => msg === botMessage);
    if (botIndex === -1) return;

    const messageId = botMessage.id || Date.now();

    let relevantHistory = [chatHistory[0]];

    let userMessageIndex = -1;
    for (let i = botIndex - 1; i >= 1; i--) {
      if (chatHistory[i].role === "user") {
        userMessageIndex = i;
        break;
      }
    }

    if (userMessageIndex !== -1) {
      for (let i = 1; i <= userMessageIndex; i++) {
        if (!chatHistory[i].hideInChat) {
          relevantHistory.push(chatHistory[i]);
        }
      }
    }

    setChatHistory((prev) => [
      ...prev.slice(0, botIndex),
      { role: "model", text: "Thinking...", id: messageId },
      ...prev.slice(botIndex + 1),
    ]);

    generateBotResponse(relevantHistory, messageId, true);
  };

  const handleVoiceModeToggle = () => {
    const newVoiceMode = voiceService.toggleVoiceMode();
    setIsVoiceMode(newVoiceMode);
  };

  const handleOptionClick = (option) => {
    setShowOptions(false);
    let prompt = "";
    
    switch(option) {
      case 'start':
        prompt = "Give me a friendly and engaging opening line to start a conversation with someone I just met. Make it natural and not too formal.";
        break;
      case 'end':
        prompt = "Give me a polite and friendly way to end a conversation. Make it sound natural and not abrupt.";
        break;
      case 'flirt':
        prompt = "Give me a clever and tasteful pickup line. Make it charming but not too cheesy.";
        break;
      case 'joke':
        prompt = "Tell me a short, clean joke that would be appropriate for a casual conversation.";
        break;
    }

    const newHistory = [
      ...chatHistory,
      { role: "user", text: prompt }
    ];

    setChatHistory(prev => [...prev, { role: "model", text: "Thinking..." }]);
    generateBotResponse(newHistory);
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span className="material-symbols-rounded">
          {isDarkMode ? "light_mode" : "dark_mode"}
        </span>
      </button>
      <p className="floating-text">Click here to start</p>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Small Talk Chatbot</h2>
          </div>
          <div className="header-buttons">
            <button
              onClick={resetConversation}
              className="material-symbols-rounded reset-button"
              title="Reset Conversation"
            >
              restart_alt
            </button>
            <button
              onClick={() => setShowChatbot((prev) => !prev)}
              className="material-symbols-rounded"
            >
              keyboard_arrow_down
            </button>
          </div>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hi there! 👋 <br /> I'm Asta, I'm your secret friend to help you
              in small talk, and brighten your day!
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} onRefresh={handleRefresh} />
          ))}
        </div>
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
          <div className="footer-buttons">
            <VoiceModeButton
              isVoiceMode={isVoiceMode}
              onToggle={handleVoiceModeToggle}
            />
            <div className="options-container" ref={optionsRef}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="options-button"
                title="Quick Options"
              >
                <span className="material-symbols-rounded">more_horiz</span>
              </button>
              {showOptions && (
                <div className="options-menu">
                  <button onClick={() => handleOptionClick('start')}>Start</button>
                  <button onClick={() => handleOptionClick('end')}>End</button>
                  <button onClick={() => handleOptionClick('flirt')}>Flirt</button>
                  <button onClick={() => handleOptionClick('joke')}>Joke</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
