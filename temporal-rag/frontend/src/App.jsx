import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Markdown from 'react-markdown';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('ws://localhost:1918');

    socket.current.on('message', (content) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        if (lastMessage?.role === 'assistant') {
          return [
            ...prev.slice(0, prev.length - 1),
            { ...lastMessage, content: lastMessage.content + content },
          ];
        }

        return [...prev, { role: 'assistant', content }];
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '') return;

    setMessages([...messages, { role: 'user', content: input }]);
    socket.current.emit('message', input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  return (
      <div
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            maxWidth: '70%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            height: '90vh',
          }}
      >
        <h1>Chat with Temporal Expert</h1>
        <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '300px',
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
        >
          {messages.map((msg, index) => (
              <div
                  key={index}
                  style={{
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    marginBottom: '10px',
                  }}
              >
                <div
                    style={{
                      display: 'inline-block',
                      padding: '0px 12px',
                      borderRadius: '10px',
                      background: msg.role === 'user' ? '#3c3c3c' : '#545454',
                    }}
                >
                  {msg.role === 'user' ?
                      <div style={{padding: '10px', whiteSpace: 'pre-wrap'}}>{msg.content}</div> :
                      <Markdown>{msg.content}</Markdown>
                  }
                </div>
              </div>
          ))}
        </div>
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{width: '98%', padding: '10px', marginTop: '10px'}}
            onKeyDown={handleKeyDown}
        />
      </div>
  );
};

export default Chat;
