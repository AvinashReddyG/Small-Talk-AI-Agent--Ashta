import {useRef} from 'react';

const geminiApiKey = import.meta.env.VITE_API_KEY;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

const ChatForm = ({chatHistory, setChatHistory, generateBotResponse}) => {
    const inputRef = useRef()
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const userMessage =  inputRef.current.value.trim();
        if(!userMessage) return;
        inputRef.current.value = "";

        // updating chat history with user's message
        setChatHistory(history => [...history, {role: 'user', text: userMessage}]);

        // bot response
        setTimeout(() => {
            setChatHistory(history => [...history, {role: 'model', text: "Thinking..."}]);

            // Create a new history array that includes the companyInfo and the user's message
            const newHistory = [
                {role: 'model', text: chatHistory[0].text}, // companyInfo
                {role: 'user', text: userMessage}
            ];
            
            generateBotResponse(newHistory);
        }, 300);
  }
  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
        <input ref={inputRef} type="text" placeholder= "Type here..." className="message-input" required />
        <button className="material-symbols-rounded">Send </button>
    </form>
  )
}

export default ChatForm
