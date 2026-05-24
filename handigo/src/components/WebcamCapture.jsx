import { useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useWebcam } from '@/lib/useWebcam';

export default function WebcamCapture({
  isEnabled = true,
  onFrame,
  canvasRef,
  showDashedBorder = true,
  fps = 10,
}) {
  const { videoRef, isReady, error } = useWebcam();

  const handleFrameCapture = useCallback(() => {
    if (!isEnabled || !videoRef.current || !canvasRef?.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    if (onFrame) onFrame(canvas);
  }, [isEnabled, videoRef, canvasRef, onFrame]);

  useEffect(() => {
    if (!isEnabled || !isReady) return;

    const interval = setInterval(handleFrameCapture, 1000 / fps);
    return () => clearInterval(interval);
  }, [isEnabled, isReady, handleFrameCapture, fps]);

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 rounded-2xl flex items-center justify-center">
        <div className="flex items-start gap-2 text-red-600">
          <AlertCircle size={20} className="mt-0.5" />
          <div>
            <p className="font-semibold">Camera Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-light-blue rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full  object-cover"
      />
      {/* Hidden canvas — dipakai untuk capture frame inference */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {showDashedBorder && (
        <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}