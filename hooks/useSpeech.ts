
import { useState, useEffect, useCallback } from 'react';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
}

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices when they are available
  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    loadVoices(); // Initial load
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition not supported by this browser.");
      return;
    }
    if (isListening) return;
    setTranscript(''); // Clear previous transcript
    setIsListening(true);
    recognition.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    if (!isListening) return;
    // recognition.stop() will trigger the onend event, which sets isListening to false
    recognition.stop();
  }, [isListening]);

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a higher quality, more natural voice
    let selectedVoice = voices.find(voice => voice.name === 'Google US English'); // Common on Chrome
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.name === 'Samantha'); // Common on macOS
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.default);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang === 'en-US');
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.pitch = 1; // Natural pitch
    utterance.rate = 1; // Normal speaking rate
    speechSynthesis.speak(utterance);
  }, [voices]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const fullTranscript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, []);

  return { isListening, transcript, error, startListening, stopListening, speak, setTranscript };
};