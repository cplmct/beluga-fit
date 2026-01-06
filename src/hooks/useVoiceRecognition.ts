import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

export function useVoiceRecognition(onCommand: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    // Placeholder: Expo does not support native speech recognition on web
    // You can integrate a web-based recognizer here if needed
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    startListening,
    stopListening,
  };
}