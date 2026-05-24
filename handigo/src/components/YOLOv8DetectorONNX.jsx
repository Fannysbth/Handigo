import { useEffect, useRef, useState } from 'react';
import WebcamCapture from './WebcamCapture';
import { loadONNXModel, postprocessOutput } from '@/lib/onnxInference';
import { AlertCircle, Loader } from 'lucide-react';

export default function YOLOv8DetectorONNX({
  modelPath,
  onDetection,
  isEnabled = true,
  confidenceThreshold = 0.5,
  fps = 10,
}) {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [detectionStats, setDetectionStats] = useState({
    fps: 0,
    detections: 0,
  });

  const modelRef = useRef(null);

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());

  // =========================
  // AUTO LOAD MODEL
  // =========================
  useEffect(() => {
    let mounted = true;

    const initModel = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading model:', modelPath);

        const model = await loadONNXModel(modelPath);

        if (!mounted) return;

        console.log('MODEL READY');
        console.log('Input Names:', model.inputNames);
        console.log('Output Names:', model.outputNames);

        modelRef.current = model;

        setLoading(false);
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setError(err.message || 'Failed loading model');
        setLoading(false);
      }
    };

    initModel();

    return () => {
      mounted = false;
    };
  }, [modelPath]);

  // =========================
  // SYNC OVERLAY SIZE
  // =========================
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const container = containerRef.current;

    if (!overlay || !container) return;

    const syncSize = () => {
      overlay.width = container.offsetWidth;
      overlay.height = container.offsetHeight;
    };

    const observer = new ResizeObserver(syncSize);

    observer.observe(container);

    syncSize();

    return () => observer.disconnect();
  }, []);

  // =========================
  // HANDLE FRAME
  // =========================
  const handleFrame = async (canvas) => {
    if (!isEnabled) return;

    if (!modelRef.current) {
      console.log('Model belum ready');
      return;
    }

    if (!canvas) {
      console.log('Canvas belum ready');
      return;
    }

    try {
      frameCountRef.current++;

      const ctx = canvas.getContext('2d');

      // Resize image to 640x640
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 640;
      tempCanvas.height = 640;

      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(canvas, 0, 0, 640, 640);

      const imageData = tempCtx.getImageData(0, 0, 640, 640);

      // =========================
      // CREATE INPUT TENSOR
      // =========================
      const input = new Float32Array(3 * 640 * 640);

      for (let i = 0; i < 640 * 640; i++) {
        input[i] = imageData.data[i * 4] / 255.0;
        input[640 * 640 + i] = imageData.data[i * 4 + 1] / 255.0;
        input[2 * 640 * 640 + i] = imageData.data[i * 4 + 2] / 255.0;
      }

      const ort = await import('onnxruntime-web');

      const inputName = modelRef.current.inputNames[0];

      // =========================
      // RUN MODEL
      // =========================
      const results = await modelRef.current.run({
        [inputName]: new ort.Tensor(
          'float32',
          input,
          [1, 3, 640, 640]
        ),
      });

      console.log('RESULTS:', results);

      const outputName = modelRef.current.outputNames[0];

      const output = results[outputName];

      console.log('OUTPUT DIMS:', output.dims);

      // =========================
      // POST PROCESS
      // =========================
      const detections = postprocessOutput(
        output,
        canvas.width,
        canvas.height,
        confidenceThreshold
      );

      console.log('DETECTIONS:', detections);

      // =========================
      // FPS
      // =========================
      const now = Date.now();

      const elapsed = (now - lastFpsUpdateRef.current) / 1000;

      let currentFps = detectionStats.fps;

      if (elapsed >= 1) {
        currentFps = Math.round(
          frameCountRef.current / elapsed
        );

        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      setDetectionStats({
        fps: currentFps,
        detections: detections.length,
      });

      // =========================
      // DRAW DETECTIONS
      // =========================
      const overlayCanvas = overlayCanvasRef.current;

      if (overlayCanvas) {
        const overlayCtx = overlayCanvas.getContext('2d');

        const ow = overlayCanvas.width;
        const oh = overlayCanvas.height;

        overlayCtx.clearRect(0, 0, ow, oh);

        detections.forEach((det) => {
          const x = (det.x / canvas.width) * ow;
          const y = (det.y / canvas.height) * oh;
          const w = (det.width / canvas.width) * ow;
          const h = (det.height / canvas.height) * oh;

          // BOX
          overlayCtx.strokeStyle = '#00FF88';
          overlayCtx.lineWidth = 3;

          overlayCtx.strokeRect(x, y, w, h);

          // LABEL BG
          const label = `${det.className} ${(
            det.confidence * 100
          ).toFixed(1)}%`;

          overlayCtx.font = 'bold 14px Arial';

          const textWidth =
            overlayCtx.measureText(label).width;

          overlayCtx.fillStyle = '#00FF88';

          overlayCtx.fillRect(
            x,
            y - 28,
            textWidth + 12,
            28
          );

          // TEXT
          overlayCtx.fillStyle = '#000';

          overlayCtx.fillText(
            label,
            x + 6,
            y - 9
          );
        });
      }

      // =========================
      // CALLBACK
      // =========================
      if (onDetection) {
        onDetection({
          detections,
          fps: currentFps,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader size={20} className="animate-spin" />
          <span>Memuat model ONNX...</span>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR UI
  // =========================
  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 rounded-2xl flex items-center justify-center">
        <div className="flex items-start gap-2 text-red-600">
          <AlertCircle size={20} className="mt-0.5" />

          <div>
            <p className="font-semibold">
              Model Error
            </p>

            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative"
      >
        <WebcamCapture
          isEnabled={isEnabled}
          onFrame={handleFrame}
          canvasRef={canvasRef}
          showDashedBorder={true}
          fps={fps}
        />

        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
        />
      </div>

      
    </div>
  );
}