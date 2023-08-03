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
function utterance(say, volume = 1, pitch = 1, rate = 1) {
  const utter = new SpeechSynthesisUtterance(say);
  utter.volume = volume;
  utter.pitch = pitch;
  utter.rate = rate;
  return utter;
}
function App() {
  const [isListening, setIsListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [msg_box_val, set_msg_box_val] = useState('');
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
    recognition.continuous = false;
    recognition.lang = "eng-US";
    let full_transcript = [];
    let full_processed = [];
    recognition.continuous = true;
    recognition.lang = "eng-US";
    recognition.onstart = () => {
      console.log(`started`);
    };
    recognition.onend = () => {
      full_processed.push(full_transcript[full_transcript.length-1]);
      console.log("Full processed: ", full_processed);
      set_msg_box_val(full_processed.join(' '));

      console.log(`ended`);
      if (isListening) recognition.start();
    };
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      full_transcript.push(transcript);
      console.log("transcript: ", transcript, isListening);
      set_msg_box_val(transcript);
    };
    recognition.onerror = (e) => {
      console.log(`Error: ${e.error}`);
    };
    if (isListening) {
      console.log("Is listening: ", isListening);
      recognition.start();
      tts.cancel();
    } else {
      recognition.stop();
    }
    return () => {
        recognition.onend = null;
        recognition.stop();
    };
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
        tts.speak(utterance(data.choices[0].message.content));
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
              id="msg_box"

              isValidMessage={true}
              className="chat-input"
              placeholder="Empezar a chatear (Start chatting...)"
              value={msg_box_val}
              style={{
                "::placeholder": { color: "#d0d0db", important: "true" },
              }}
              onSend={handleSend}
              attachButton={false}
              sendButton={true}
              onChange={(e) => {set_msg_box_val(isListening ? msg_box_val : e)}}
            />
          </ChatContainer>
        </MainContainer>
        <button onClick={() => setIsListening((prevState) => !prevState)}>{isListening ? "Stop" : "Start"} Listening</button>
      </div>
    </div>
  );
}

export default App;