import React, { useEffect, useRef, useState } from 'react';
import { loadModel, runInference } from '../lib/onnxInference';

// PENTING: Sudah disesuaikan dengan isi names dari hasil training model kamu
const DEFAULT_LABELS = {
  alfabet: [
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
  ],
  angka: [
    'Delapan','Dua','Empat','Enam','Lima',
    'Satu','Sembilan','Tiga','Tujuh'
  ],
  kosakata: [
    'Bodoh','Cinta','Jahat','Kamu','Kasih',
    'Maaf','Makan','Masuk','Minum','Nama',
    'Rumah','Saya','Terima','Tidur','Tolong'
  ]
};

const YOLOv8DetectorONNX = ({
  modelPath,
  onDetection,
  isEnabled = true,
  confidenceThreshold = 0.5,
  fps = 5,
  className = ""
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);

  // Deteksi list label berdasarkan nama file model yang aktif
  const labels = React.useMemo(() => {
    if (modelPath.includes('numbers')) return DEFAULT_LABELS.angka;
    if (modelPath.includes('words')) return DEFAULT_LABELS.kosakata;
    return DEFAULT_LABELS.alfabet;
  }, [modelPath]);

  // Effect 1: Memuat Model ONNX
  useEffect(() => {
    let active = true;
    const initModel = async () => {
      try {
        setModelLoading(true);
        setModelError(null);
        sessionRef.current = null;
        
        const session = await loadModel(modelPath);
        if (active) {
          sessionRef.current = session;
        }
      } catch (err) {
        console.error(err);
        if (active) setModelError('Gagal menginisialisasi model AI.');
      } finally {
        if (active) setModelLoading(false);
      }
    };

    initModel();
    return () => { active = false; };
  }, [modelPath]);

  // Effect 2: Mengaktifkan Kamera Web
  useEffect(() => {
    let stream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => console.error("Akses kamera ditolak:", err));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Effect 3: Loop Inference Terjadwal
  useEffect(() => {
    if (!isEnabled || modelLoading || !sessionRef.current) return;

    let intervalId = null;

    const performDetection = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const detections = await runInference(sessionRef.current, video, confidenceThreshold, labels);
      
      // Kirim hasil ke komponen utama (LatihanPage)
      onDetection({ detections });

      // Gambar kotak visualisasi secara lokal di canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach(({ box, className, confidence }) => {
        const scaleX = canvas.width / 640;
        const scaleY = canvas.height / 640;

        const [x, y, w, h] = box;
        const rx = x * scaleX;
        const ry = y * scaleY;
        const rw = w * scaleX;
        const rh = h * scaleY;

        // Bounding Box
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(rx, ry, rw, rh);

        // Label Background
        ctx.fillStyle = '#00E5FF';
        const text = `${className} (${Math.round(confidence * 100)}%)`;
        ctx.font = 'bold 14px sans-serif';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(rx, ry - 24, textWidth + 10, 24);

        // Teks Label
        ctx.fillStyle = '#000000';
        ctx.fillText(text, rx + 5, ry - 7);
      });
    };

    intervalId = setInterval(performDetection, 1000 / fps);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isEnabled, modelLoading, confidenceThreshold, fps, labels, onDetection]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover "
        onLoadedMetadata={() => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover "
      />
      
      {modelLoading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 text-center text-white text-sm font-semibold tracking-wide">
          ⏳ Mengunduh & Memuat Model AI ke Browser...
        </div>
      )}
      {modelError && (
        <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center p-4 text-center text-white text-sm font-semibold">
          ❌ {modelError}
        </div>
      )}
    </div>
  );
};

export default React.memo(YOLOv8DetectorONNX);