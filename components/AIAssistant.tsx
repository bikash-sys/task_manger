
import React, { useEffect, useState, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useAppContext } from '../context/AppContext';
import { processUserCommandStream } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ChatIcon from './icons/ChatIcon';
import Chat from './Chat';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const AIAssistant: React.FC = () => {
  const { isListening, transcript, startListening, stopListening, speak, setTranscript } = useSpeech();
  const { data, setData } = useAppContext();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const wasListening = usePrevious(isListening);

  const processCommand = async (command: string) => {
      if (!command.trim()) return;

      setIsProcessing(true);
      setTranscript('');

      await processUserCommandStream(command, data, [], {
        onTextChunk: () => {}, // Not needed for voice-only interaction
        onTextDone: (fullText) => {
            speak(fullText);
            addToast(fullText);
        },
        onData: (updatedData) => {
            setData(updatedData);
        },
        onError: (error) => {
            speak(error);
            addToast(error);
        },
        onDone: () => {
            setIsProcessing(false);
        }
    });
  };
  
  useEffect(() => {
    // When listening stops and there's a transcript, process it automatically
    if (wasListening && !isListening && transcript.trim()) {
      processCommand(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript, wasListening]);


  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isProcessing || isChatOpen) return; // Don't listen if chat is open or processing
      startListening();
    }
  };

  const getButtonClass = () => {
    if (isProcessing) {
      return 'bg-accent animate-pulse';
    }
    if (isListening) {
      return 'bg-red-500 scale-110';
    }
    return 'bg-primary hover:bg-primary-focus';
  };

  return (
    <>
      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-4">
        <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            disabled={isListening || isProcessing}
            className="w-14 h-14 rounded-full bg-secondary/80 text-white flex items-center justify-center shadow-lg transition-all duration-300 transform hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-secondary/50 disabled:bg-gray-500 disabled:cursor-not-allowed"
            aria-label="Open AI Chat"
        >
            <ChatIcon className="w-7 h-7" />
        </button>

        <button
          onClick={handleMicClick}
          disabled={isProcessing || isChatOpen}
          className={`w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-primary-focus/50 ${getButtonClass()} disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed`}
          aria-label={isListening ? 'Stop Listening' : 'Activate AI Assistant'}
        >
          <MicrophoneIcon className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export default AIAssistant;
