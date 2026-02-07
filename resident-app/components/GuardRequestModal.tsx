/**
 * GuardRequestModal — Guard raises an approval request to a resident.
 * Includes face capture via camera, visitor details form, and apartment selection.
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'capture' | 'details' | 'submitting' | 'result';

export default function GuardRequestModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('capture');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [detecting, setDetecting] = useState(false);

  // Form fields
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState<{ approval_id: number; face_detected: boolean } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const reset = () => {
    stopCamera();
    setStep('capture');
    setCapturedBlob(null);
    setCapturedPreview(null);
    setFaceDetected(null);
    setDetecting(false);
    setVisitorName('');
    setVisitorPhone('');
    setPurpose('');
    setAptNumber('');
    setError('');
    setResultData(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError('Camera access denied.');
    }
  }, []);

  // Auto-start camera when modal opens on capture step
  useEffect(() => {
    if (isOpen && step === 'capture' && !cameraActive && !capturedBlob) {
      startCamera();
    }
  }, [isOpen, step, cameraActive, capturedBlob, startCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    stopCamera();
    setDetecting(true);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture image.');
        setDetecting(false);
        return;
      }

      setCapturedBlob(blob);
      const reader = new FileReader();
      reader.onload = () => setCapturedPreview(reader.result as string);
      reader.readAsDataURL(blob);

      // Run face detection
      try {
        const formData = new FormData();
        formData.append('photo', blob, 'capture.jpg');
        const res = await fetch('/api/guard/face-detect', { method: 'POST', body: formData });
        const data = await res.json();
        setFaceDetected(data.ok && data.detected);

        // If face detected, show annotated image
        if (data.ok && data.annotated_image) {
          setCapturedPreview(`data:image/jpeg;base64,${data.annotated_image}`);
        }
      } catch {
        setFaceDetected(false);
      } finally {
        setDetecting(false);
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  const retakePhoto = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setFaceDetected(null);
    startCamera();
  };

  const goToDetails = () => {
    setStep('details');
  };

  const skipPhoto = () => {
    stopCamera();
    setCapturedBlob(null);
    setCapturedPreview(null);
    setFaceDetected(null);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!visitorName.trim() || !purpose.trim() || !aptNumber.trim()) {
      setError('Visitor name, purpose, and apartment are required.');
      return;
    }

    setError('');
    setStep('submitting');

    try {
      const formData = new FormData();
      formData.append('visitor_name', visitorName.trim());
      formData.append('purpose', purpose.trim());
      formData.append('apt_number', aptNumber.trim());
      if (visitorPhone.trim()) formData.append('visitor_phone', visitorPhone.trim());
      if (capturedBlob) formData.append('photo', capturedBlob, 'visitor.jpg');

      const res = await fetch('/api/guard/request-approval', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to send request.');
        setStep('details');
        return;
      }

      setResultData({ approval_id: data.approval_id, face_detected: data.face_detected });
      setStep('result');

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch {
      setError('Network error. Please try again.');
      setStep('details');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <span className="text-xl">🚪</span>
          <div>
            <h2 className="text-title text-ink">Request Visitor Approval</h2>
            <p className="text-caption text-ink-muted mt-0.5">
              {step === 'capture' && 'Step 1: Capture visitor photo'}
              {step === 'details' && 'Step 2: Enter visitor details'}
              {step === 'submitting' && 'Sending request...'}
              {step === 'result' && 'Request sent!'}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <AnimatePresence mode="wait">
          {/* Step 1: Camera capture */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRING}
            >
              {!capturedBlob ? (
                <>
                  <div className="relative rounded-lg overflow-hidden bg-black mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {/* Scan corners */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 left-3 w-10 h-10 border-t-3 border-l-3 border-brand rounded-tl-lg" />
                      <div className="absolute top-3 right-3 w-10 h-10 border-t-3 border-r-3 border-brand rounded-tr-lg" />
                      <div className="absolute bottom-3 left-3 w-10 h-10 border-b-3 border-l-3 border-brand rounded-bl-lg" />
                      <div className="absolute bottom-3 right-3 w-10 h-10 border-b-3 border-r-3 border-brand rounded-br-lg" />
                      <p className="absolute bottom-5 left-0 right-0 text-center text-white text-caption font-medium drop-shadow-lg">
                        Position face within frame
                      </p>
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-3">
                    <Button variant="ghost" size="md" onClick={skipPhoto} fullWidth>
                      Skip Photo
                    </Button>
                    <Button variant="primary" size="md" onClick={capturePhoto} fullWidth>
                      📸 Capture
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview captured image */}
                  <div className="relative rounded-lg overflow-hidden border border-base-border mb-3">
                    {capturedPreview && (
                      <img src={capturedPreview} alt="Captured" className="w-full" />
                    )}
                  </div>

                  {detecting ? (
                    <div className="text-center py-3">
                      <p className="text-body text-ink-muted animate-pulse">🔍 Detecting face...</p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`rounded-lg p-3 text-center mb-3 border ${
                          faceDetected
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'bg-amber-50 border-amber-300 text-amber-700'
                        }`}
                      >
                        {faceDetected ? '✅ Face detected successfully' : '⚠️ No face detected — you can still proceed'}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="ghost" size="md" onClick={retakePhoto} fullWidth>
                          Retake
                        </Button>
                        <Button variant="primary" size="md" onClick={goToDetails} fullWidth>
                          Continue →
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Step 2: Details form */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={SPRING}
            >
              {/* Show captured face thumbnail if we have one */}
              {capturedPreview && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-base-muted">
                  <img src={capturedPreview} alt="Visitor" className="w-14 h-14 rounded-full object-cover border-2 border-base-border" />
                  <div>
                    <p className="text-caption text-ink-secondary font-medium">Photo captured</p>
                    <p className="text-micro text-ink-faint">
                      {faceDetected ? '✅ Face verified' : '⚠️ No face detected'}
                    </p>
                  </div>
                  <button onClick={() => { setStep('capture'); retakePhoto(); }} className="ml-auto text-caption text-brand hover:underline">
                    Retake
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-caption text-status-error">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                    Visitor Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Ahmed Hassan"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                    Apartment Number <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={aptNumber}
                    onChange={(e) => setAptNumber(e.target.value)}
                    placeholder="e.g. 501"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                    Purpose <span className="text-status-error">*</span>
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select purpose...</option>
                    <option value="Delivery">📦 Delivery</option>
                    <option value="Personal Visit">👤 Personal Visit</option>
                    <option value="Maintenance">🔧 Maintenance</option>
                    <option value="Service Provider">🛠️ Service Provider</option>
                    <option value="Guest">🎉 Guest</option>
                    <option value="Other">📝 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-4 animate-pulse">
                <span className="text-3xl">📤</span>
              </div>
              <p className="text-body text-ink-muted">Sending approval request to resident...</p>
            </motion.div>
          )}

          {/* Result */}
          {step === 'result' && resultData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-status-success/10 flex items-center justify-center mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <p className="text-title text-status-success font-semibold mb-2">
                Request Sent!
              </p>
              <p className="text-body text-ink-muted mb-1">
                Approval request #{resultData.approval_id} has been sent to the resident.
              </p>
              <p className="text-caption text-ink-faint">
                {resultData.face_detected
                  ? '📸 Visitor photo with face attached'
                  : '📋 No photo attached'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal.Body>

      {step === 'details' && (
        <Modal.Footer>
          <Button variant="ghost" size="sm" onClick={() => setStep('capture')}>
            ← Back
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            📤 Send to Resident
          </Button>
        </Modal.Footer>
      )}

      {step === 'result' && (
        <Modal.Footer>
          <Button variant="primary" size="sm" onClick={handleClose}>
            Done
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
