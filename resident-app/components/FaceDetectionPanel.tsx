/**
 * FaceDetectionPanel — Camera capture + face detection for guard interface.
 * Uses device camera, sends photo to backend for face detection.
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface FaceBox {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface DetectionResult {
  detected: boolean;
  count: number;
  faces: FaceBox[];
  annotated_image?: string;
}

type Stage = 'idle' | 'camera' | 'detecting' | 'result' | 'error';

export default function FaceDetectionPanel() {
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setStage('camera');
    setResult(null);
    setCapturedImage(null);
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setErrorMsg('Camera access denied. Please allow camera permissions.');
      setStage('error');
    }
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    stopCamera();
    setStage('detecting');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setErrorMsg('Failed to capture image.');
        setStage('error');
        return;
      }

      // Show captured image
      const reader = new FileReader();
      reader.onload = () => setCapturedImage(reader.result as string);
      reader.readAsDataURL(blob);

      // Send to backend
      try {
        const formData = new FormData();
        formData.append('photo', blob, 'capture.jpg');

        const res = await fetch('/api/guard/face-detect', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          setErrorMsg(data.error || 'Face detection failed');
          setStage('error');
          return;
        }

        setResult({
          detected: data.detected,
          count: data.count,
          faces: data.faces || [],
          annotated_image: data.annotated_image,
        });
        setStage('result');
      } catch {
        setErrorMsg('Network error during face detection.');
        setStage('error');
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  const reset = () => {
    stopCamera();
    setStage('idle');
    setResult(null);
    setCapturedImage(null);
    setErrorMsg('');
  };

  return (
    <Card className="!p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-base-border flex items-center justify-between">
        <div>
          <h3 className="text-title text-ink font-semibold">📸 Face Detection</h3>
          <p className="text-micro text-ink-muted mt-0.5">Verify visitor identity</p>
        </div>
        {stage !== 'idle' && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* Idle */}
          {stage === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📷</span>
              </div>
              <p className="text-body text-ink-muted mb-5">
                Capture a photo to detect and verify faces
              </p>
              <Button variant="primary" size="lg" onClick={startCamera}>
                Open Camera
              </Button>
            </motion.div>
          )}

          {/* Camera */}
          {stage === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING}
            >
              <div className="relative rounded-lg overflow-hidden bg-black mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 border-2 border-brand/40 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-brand rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-brand rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-brand rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-brand rounded-br-lg" />
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button variant="ghost" size="md" onClick={reset} fullWidth>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={captureAndDetect} fullWidth>
                  📸 Capture & Detect
                </Button>
              </div>
            </motion.div>
          )}

          {/* Detecting */}
          {stage === 'detecting' && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-4 animate-pulse">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-body text-ink-muted">Detecting faces...</p>
            </motion.div>
          )}

          {/* Result */}
          {stage === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={SPRING}
            >
              {/* Annotated image */}
              {result.annotated_image && (
                <div className="rounded-lg overflow-hidden mb-4 border border-base-border">
                  <img
                    src={`data:image/jpeg;base64,${result.annotated_image}`}
                    alt="Face detection result"
                    className="w-full"
                  />
                </div>
              )}

              {!result.annotated_image && capturedImage && (
                <div className="rounded-lg overflow-hidden mb-4 border border-base-border">
                  <img src={capturedImage} alt="Captured" className="w-full" />
                </div>
              )}

              {/* Status */}
              <div
                className={`rounded-card p-4 text-center mb-4 border-2 ${
                  result.detected
                    ? 'bg-status-success-bg border-status-success'
                    : 'bg-status-error-bg border-status-error'
                }`}
              >
                <p
                  className={`text-xl font-bold ${
                    result.detected ? 'text-status-success' : 'text-status-error'
                  }`}
                >
                  {result.detected
                    ? `✅ ${result.count} Face${result.count > 1 ? 's' : ''} Detected`
                    : '❌ No Face Detected'}
                </p>
              </div>

              {/* Face details */}
              {result.faces.length > 0 && (
                <div className="space-y-2 mb-4">
                  {result.faces.map((face, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-base-muted text-caption"
                    >
                      <span className="text-ink-secondary">Face {i + 1}</span>
                      <span className="text-ink font-medium">
                        {face.width}×{face.height}px
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={reset} fullWidth>
                  Scan Again
                </Button>
                <Button variant="primary" size="md" onClick={startCamera} fullWidth>
                  New Capture
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-status-error/10 flex items-center justify-center mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <p className="text-body text-status-error font-medium mb-2">
                Detection Failed
              </p>
              <p className="text-caption text-ink-muted mb-5">{errorMsg}</p>
              <Button variant="primary" size="md" onClick={() => { reset(); startCamera(); }}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
