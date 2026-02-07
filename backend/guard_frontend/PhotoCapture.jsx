import React, { useRef, useState } from 'react';

const PhotoCapture = ({ onPhotoCaptured }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/png');
    onPhotoCaptured(photo);
  };

  return (
    <div>
      <h2>Photo Capture</h2>
      {!isCameraOn && <button onClick={startCamera}>Start Camera</button>}
      {isCameraOn && (
        <div>
          <video ref={videoRef} autoPlay playsInline></video>
          <button onClick={capturePhoto}>Capture Photo</button>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;