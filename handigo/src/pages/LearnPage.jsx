import { Link, useParams } from 'react-router-dom';
import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect, useRef, useState } from 'react';
import { Info, Lightbulb } from 'lucide-react';

import {
  fetchExerciseById,
  verifySign,
} from '../lib/api';

const LearnPage = () => {
  const { exerciseId } = useParams();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [accuracy, setAccuracy] = useState(0);
  const [detected, setDetected] = useState(false);
  const [message, setMessage] = useState('Menunggu deteksi...');
  const [isScanning, setIsScanning] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // =========================
  // LOAD EXERCISE
  // =========================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchExerciseById(exerciseId);

        if (!cancelled) {
          setExercise(data);
        }
      } catch (err) {
        console.error('Error loading exercise:', err);
        if (!cancelled) {
          setError(err.message || 'Gagal memuat latihan');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // =========================
  // START CAMERA
  // =========================
  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });

        if (!cancelled) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error('Camera error:', err);
        if (!cancelled) {
          setMessage('❌ Kamera tidak tersedia');
          setIsScanning(false);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // =========================
  // AUTO DETECTION LOOP
  // =========================
  useEffect(() => {
    if (!exercise || !videoRef.current || !canvasRef.current || !isScanning) return;

    const captureAndDetect = async () => {
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video || video.videoWidth === 0) {
          return;
        }

        // Capture frame dari video
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Convert canvas ke base64
        const frameBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Verifikasi dengan backend
        const result = await verifySign({
          image_base64: frameBase64,
          expected_sign: exercise.sign_value || exercise.title,
          exercise_id: exercise.id,
        });

        if (result) {
          setAccuracy(result.accuracy || 0);
          setDetected(result.detected || false);
          setMessage(result.message || 'Menunggu deteksi...');

          // Auto-stop jika terdeteksi dengan akurasi tinggi
          if (result.detected && result.accuracy >= 80) {
            setIsScanning(false);
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
        setMessage('⚠️ Error deteksi, coba lagi');
      }
    };

    // Run detection setiap 2.5 detik
    detectionIntervalRef.current = setInterval(captureAndDetect, 2500);

    // Auto-stop setelah 30 detik
    const timeoutId = setTimeout(() => {
      if (isScanning) {
        setIsScanning(false);
        setMessage('⏱️ Waktu scanning habis');
      }
    }, 30000);

    return () => {
      clearInterval(detectionIntervalRef.current);
      clearTimeout(timeoutId);
    };
  }, [exercise, isScanning]);

  if (loading) {
    return <LoadingSpinner text="Memuat latihan..." />;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-blue text-white px-4 py-2 rounded-full text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Latihan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">

      {/* HEADER */}
      <header className="border-b border-gray-200 shrink-0 bg-light-blue">
        <Container className="flex items-center justify-between py-4">
          <Link 
            to="/" 
            className="p-2 -ml-2 text-primary-blue hover:bg-white/20 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <h1 className="font-bold text-primary-blue text-lg">
            {exercise?.title || 'Latihan'}
          </h1>

          <div className="p-2 -mr-2 text-primary-blue">
            <Info size={20} />
          </div>
        </Container>
      </header>

      {/* CONTENT */}
      <Container className="flex-1 overflow-y-auto py-6 flex flex-col">

        {/* CAMERA */}
        <div className="w-full max-w-3xl mx-auto aspect-video bg-dark-gray rounded-2xl overflow-hidden relative shadow-md">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* FRAME GUIDE */}
          <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-xl pointer-events-none"></div>

          {/* STATUS BADGE */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${detected ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
            <span>
              {detected ? '✓ Terdeteksi' : 'Scanning...'}
            </span>
          </div>

          {/* ACCURACY BADGE */}
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
            {accuracy}%
          </div>
        </div>

        {/* CANVAS HIDDEN (untuk capture) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* PROGRESS BAR */}
        <div className="mt-6 w-full max-w-3xl mx-auto">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
            <span>Akurasi Gerakan</span>
            <span className={`font-bold ${accuracy >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {Math.round(accuracy)}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${detected ? 'bg-green-500' : 'bg-primary-blue'}`}
              style={{ width: `${accuracy}%` }}
            />
          </div>

          <p className="text-sm text-center mt-3 text-gray-600 min-h-6">
            {message}
          </p>
        </div>

        {/* INSTRUCTION SECTION */}
        <div className="mt-12 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mx-auto bg-light-blue rounded-2xl flex items-center justify-center mb-4">
            {exercise?.reference_image ? (
              <img 
                src={exercise.reference_image} 
                alt={exercise.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-blue">
                {exercise?.title?.charAt(0)}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-primary-blue mb-2">
            {exercise?.title}
          </h2>

          <p className="text-gray-600 text-sm max-w-[300px] leading-relaxed">
            {exercise?.instruction || 'Tunjukkan isyarat sesuai referensi. Pastikan tangan terlihat jelas di kamera.'}
          </p>

          {/* TIPS */}
          <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 px-4 py-3 rounded-lg max-w-xs">
            <Lightbulb size={16} className="text-secondary shrink-0 mt-0.5" />
            <p>
              Tips: Pastikan pencahayaan cukup dan gerakan lambat agar deteksi lebih akurat.
            </p>
          </div>
        </div>

      </Container>
    </div>
  );
};

export default LearnPage;