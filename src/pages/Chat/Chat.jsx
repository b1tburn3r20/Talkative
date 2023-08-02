import { useState, useEffect, useRef } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "./Chat.css"; // Import the CSS file with the provided styles
const API_KEY = "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";
function utterance(say, volume=1, pitch=1, rate=1) {
  const utter = new SpeechSynthesisUtterance(say);
  utter.volume = volume; 
  utter.pitch = pitch; 
  utter.rate = rate;
  return utter; 
}
function App() {
  const [isListening, setIsListening] = useState(false);
  const [msg_box_val, set_msg_box_val] = useState(null);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hey, welcome. Whats on your mind?",
      sender: "ChatGPT",
    },
  ]);
  let tts = speechSynthesis;
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  };
  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      console.log("Started");
    };
    
    recognition.onend = () => {
      console.log("Ended");
    };
    
    recognition.onresult = (e) => {
      console.log(e);
    };
    
    recognition.onerror = function(e) {
      console.error("Go bang your ahead and try to figure it out", e.error);
    };
    if (isListening) {
      recognition.start();
      tts.cancel();
    } else {
      recognition.stop();
    }


  }, [isListening]);

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content:
        "You are a therapist, your patient is troubled by something, you dont know what it is so be curious and engaging. Ask them questions about their issues, try to keep it to one question. reassure them, and sometimes offer a haiku or quote for inspiration.",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        tts.resume()
        tts.speak(utterance(data.choices[0].message.content))
        setTyping(false);
      });
  }

  return (
    <div className="App">
      <div className="chat-backdrop">
        <MainContainer>
          <ChatContainer className="chat-container">
            <MessageList
              className="chat-history !important"
              scrollBehavior="smooth"
              typingIndicator={
                typing ? <TypingIndicator content="ChatGPT is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                const messageClassName =
                  message.sender === "user"
                    ? "user-message"
                    : "assistant-message";
                return (
                  <Message
                    key={i}
                    model={message}
                    className={messageClassName}
                  />
                );
              })}
            </MessageList>
            <MessageInput
              value={msg_box_val}
              className="chat-input"
              placeholder="Empezar a chatear (Start chatting...)"
              style={{
                "::placeholder": { color: "#d0d0db", important: "true" },
              }}
              onSend={handleSend}
              attachButton={false}
              sendButton={true} // Set this to true to show the send button
            />
          </ChatContainer>
        </MainContainer>
        <button onClick={() => setIsListening((prevState) => !prevState)}>
          {isListening ? "Stop" : "Start"} Listening
        </button>
      </div>
    </div>
  );
}

export default App;
