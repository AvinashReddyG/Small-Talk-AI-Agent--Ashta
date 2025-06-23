// import UserIcon from "./UserIcon"
// import ChatbotIcon from "./ChatbotIcon"

// const ChatMessage = ({chat}) => {
//   return (
//     !chat.hideInChat && (
//       <div className={`message ${chat.role === 'model' ? 'bot' : 'user' }-message ${chat.isError ? 'error' : ''}`}>
//           {chat.role === 'model' ? <ChatbotIcon/> : <UserIcon/>}
//           <p className="message-text">{chat.text}</p>
//       </div>
//    )
//   );
// }

// export default ChatMessage

import UserIcon from "./UserIcon";
import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat, onRefresh }) => {
  return (
    !chat.hideInChat && (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message ${chat.isError ? "error" : ""}`}
      >
        {chat.role === "model" ? <ChatbotIcon /> : <UserIcon />}
        <div className="message-content">
          <p className="message-text">{chat.text}</p>
          {chat.role === "model" &&
            !chat.isError &&
            chat.text !== "Thinking..." && (
              <button
                className="refresh-button"
                onClick={() => onRefresh(chat)}
                aria-label="Regenerate response"
              >
                <span className="material-symbols-rounded">refresh</span>
              </button>
            )}
        </div>
      </div>
    )
  );
};

export default ChatMessage;
