'use client'
import React, { useState, useEffect, useRef } from 'react';

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Continue listening until explicitly stopped
      recognition.interimResults = true; // Show interim results while speaking
      recognition.lang = 'en-US'; // Set your preferred language

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Process all results from the event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript(''); // Optionally clear previous transcript
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Speech to Text</h1>
      <div>
        <button onClick={startListening} disabled={listening}>
          Start Listening
        </button>
        <button onClick={stopListening} disabled={!listening} style={{ marginLeft: '1rem' }}>
          Stop Listening
        </button>
      </div>
      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
        <p>{transcript || 'Your speech will appear here...'}</p>
      </div>
    </div>
  );
};

export default SpeechToText;
