
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { processUserCommandStream } from '../services/geminiService';
import { useSpeech } from '../hooks/useSpeech';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import XIcon from './icons/XIcon';
import RefreshIcon from './icons/RefreshIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const { data, setData } = useAppContext();
  const { addToast } = useToast();
  const { speak } = useSpeech();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chatHistory', []);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{ sender: 'ai', text: "Hello! How can I help you today?" }]);
    }
  }, [isOpen, messages.length, setMessages]);


  const handleSend = async () => {
    const command = inputText.trim();
    if (!command || isProcessing) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: command }];
    setMessages(newMessages);
    setInputText('');
    setIsProcessing(true);
    
    // Add AI message placeholder for streaming
    setMessages(prev => [...prev, { sender: 'ai', text: '' }]);
    let currentAiText = '';

    await processUserCommandStream(command, data, newMessages, {
        onTextChunk: (chunk) => {
            currentAiText += chunk;
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg?.sender === 'ai') {
                    lastMsg.text = currentAiText;
                }
                return newMsgs;
            });
        },
        onTextDone: (fullText) => {
            speak(fullText);
            addToast(fullText);
        },
        onData: (updatedData) => {
            setData(updatedData);
        },
        onError: (error) => {
            setMessages(prev => {
                 const newMsgs = [...prev];
                 const lastMsg = newMsgs[newMsgs.length - 1];
                 if (lastMsg?.sender === 'ai') {
                    lastMsg.text = error;
                }
                return newMsgs;
            });
            speak(error);
            addToast(error);
        },
        onDone: () => {
            setIsProcessing(false);
        }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleClearHistory = () => {
      setMessages([{ sender: 'ai', text: "History cleared. How can I help you?" }]);
      setIsConfirmingClear(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed z-50 bg-surface rounded-lg shadow-2xl flex flex-col animate-fade-in-up bottom-4 inset-x-4 h-[80vh] md:bottom-28 md:inset-x-auto md:right-8 md:w-full md:max-w-sm md:h-[60vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Aura Chat</h3>
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsConfirmingClear(true)} className="p-1 text-on-surface-secondary hover:text-white" aria-label="Clear chat history">
                <RefreshIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1 text-on-surface-secondary hover:text-white" aria-label="Close chat">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-700 text-on-surface'}`}>
                  <p className="whitespace-pre-wrap">{msg.text.split('---JSON---')[0]}</p>
                </div>
              </div>
            ))}
            {isProcessing && messages[messages.length-1]?.text === '' && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-gray-700 text-on-surface">
                  <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 bg-on-surface-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-on-surface-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-on-surface-secondary rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-primary focus:border-primary"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            className="ml-3 p-3 rounded-full bg-primary text-white hover:bg-primary-focus disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        onConfirm={handleClearHistory}
        title="Clear Conversation"
      >
        Are you sure you want to delete your entire chat history? This cannot be undone.
      </ConfirmationDialog>
    </>
  );
};

export default Chat;
