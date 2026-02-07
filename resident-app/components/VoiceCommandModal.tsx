/**
 * VoiceCommandModal — Record audio, send to backend for voice-based visitor approval.
 */
'use client';

import { useState, useRef, useCallback } from 'react';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Stage = 'idle' | 'recording' | 'processing' | 'result' | 'error';

export default function VoiceCommandModal({ isOpen, onClose, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const reset = () => {
    setStage('idle');
    setTranscript('');
    setErrorMsg('');
    chunksRef.current = [];
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
      };

      mediaRecorder.start();
      setStage('recording');
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone permissions.');
      setStage('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setStage('processing');
    }
  }, []);

  const processAudio = async (blob: Blob) => {
    setStage('processing');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const res = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'Voice processing failed.');
        setStage('error');
        return;
      }

      setTranscript(data.transcript || 'No transcript available.');
      setStage('result');
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStage('error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        <h2 className="text-title text-ink">Voice Command</h2>
        <p className="text-caption text-ink-muted mt-1">
          Speak to add or approve a visitor
        </p>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col items-center py-4">
          {stage === 'idle' && (
            <>
              <div className="w-24 h-24 rounded-full bg-brand/10 flex items-center justify-center mb-5">
                <span className="text-4xl">🎤</span>
              </div>
              <p className="text-body text-ink-muted text-center mb-2">
                Tap the button and say something like:
              </p>
              <p className="text-caption text-ink-faint text-center italic">
                &ldquo;Allow Ahmed to visit tomorrow at 3pm for delivery&rdquo;
              </p>
            </>
          )}

          {stage === 'recording' && (
            <>
              <div className="w-24 h-24 rounded-full bg-status-error/10 flex items-center justify-center mb-5 animate-pulse">
                <span className="text-4xl">🔴</span>
              </div>
              <p className="text-body text-ink font-medium text-center">
                Listening...
              </p>
              <p className="text-caption text-ink-muted text-center mt-1">
                Tap Stop when you&apos;re done speaking
              </p>
            </>
          )}

          {stage === 'processing' && (
            <>
              <div className="w-24 h-24 rounded-full bg-brand/10 flex items-center justify-center mb-5 animate-spin-slow">
                <span className="text-4xl">⏳</span>
              </div>
              <p className="text-body text-ink-muted text-center">
                Processing your voice command...
              </p>
            </>
          )}

          {stage === 'result' && (
            <>
              <div className="w-24 h-24 rounded-full bg-status-success/10 flex items-center justify-center mb-5">
                <span className="text-4xl">✅</span>
              </div>
              <p className="text-body text-status-success font-medium text-center mb-3">
                Command processed!
              </p>
              <div className="w-full p-3 rounded-lg bg-base-muted border border-base-border">
                <p className="text-micro text-ink-faint uppercase tracking-wider mb-1">Transcript</p>
                <p className="text-body text-ink">{transcript}</p>
              </div>
            </>
          )}

          {stage === 'error' && (
            <>
              <div className="w-24 h-24 rounded-full bg-status-error/10 flex items-center justify-center mb-5">
                <span className="text-4xl">❌</span>
              </div>
              <p className="text-body text-status-error font-medium text-center mb-2">
                Something went wrong
              </p>
              <p className="text-caption text-ink-muted text-center">{errorMsg}</p>
            </>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          {stage === 'result' ? 'Done' : 'Cancel'}
        </Button>

        {stage === 'idle' && (
          <Button variant="primary" size="sm" onClick={startRecording}>
            🎤 Start Recording
          </Button>
        )}

        {stage === 'recording' && (
          <Button variant="danger" size="sm" onClick={stopRecording}>
            ⏹ Stop Recording
          </Button>
        )}

        {stage === 'error' && (
          <Button variant="primary" size="sm" onClick={() => { reset(); }}>
            Try Again
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
