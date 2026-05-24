import Container from '@/components/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Lightbulb } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  fetchExercises,
  fetchModuleById,
  fetchModuleProgress,
  saveExerciseResult,
  upsertProgress,
} from '../lib/api';

import YOLOv8DetectorONNX from '@/components/YOLOv8DetectorONNX';

const LATIHAN_SECONDS = 10;

const LatihanPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [liveDetections, setLiveDetections] = useState([]);

  const [exercise, setExercise] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [module, setModule] = useState(null);
  const [existingProgress, setExistingProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isScanning, setIsScanning] = useState(true);
  const [detectionMessage, setDetectionMessage] = useState('Mendeteksi...');

  // Accuracy final untuk 1 sesi latihan
  const [accuracy, setAccuracy] = useState(0);
  const [isDetected, setIsDetected] = useState(false);

  // freeze: akurasi hanya berubah sebelum time habis
  const bestAccuracyRef = useRef(0);
  const detectedAnyRef = useRef(false);

  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  // State untuk carousel referensi gambar
  const [refImageIndex, setRefImageIndex] = useState(0);

  const exerciseId = location.state?.exerciseId;
  const exerciseIndex = location.state?.exerciseIndex;

  const modelPath = useMemo(() => {
    return '/models/yolov8/best.onnx';
  }, []);

  // Reset refImageIndex setiap ganti exercise
  useEffect(() => {
    setRefImageIndex(0);
  }, [exercise?.id]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [mod, exs] = await Promise.all([fetchModuleById(id), fetchExercises(id)]);
        if (cancelled) return;

        setModule(mod);
        setAllExercises(exs);

        if (user) {
          const prog = await fetchModuleProgress(id);
          if (!cancelled) setExistingProgress(prog);
        }

        if (exerciseId) {
          const ex = exs.find((e) => e.id === exerciseId);
          setExercise(ex || exs[0]);
        } else if (exerciseIndex) {
          const ex = exs.find((e) => e.sort_order === exerciseIndex);
          setExercise(ex || exs[0]);
        } else {
          if (user) {
            const nextIdx = (existingProgress?.completed_exercises || 0) + 1;
            const nextEx = exs.find((e) => e.sort_order === nextIdx);
            setExercise(nextEx || exs[0]);
          } else {
            setExercise(exs[0]);
          }
        }

        startTimeRef.current = Date.now();
      } catch (err) {
        console.error(err);
        if (!cancelled) setDetectionMessage('Gagal memuat latihan');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, exerciseId, exerciseIndex, authLoading]);

  // timer latihan + freeze
  useEffect(() => {
    if (!exercise || !isScanning) return;

    startTimeRef.current = Date.now();
    bestAccuracyRef.current = 0;
    detectedAnyRef.current = false;

    timerRef.current = setTimeout(() => {
      setIsScanning(false);

      const finalAccuracy = detectedAnyRef.current ? bestAccuracyRef.current : 0;
      setAccuracy(Math.round(finalAccuracy));
      setIsDetected(detectedAnyRef.current && bestAccuracyRef.current > 0);

      setDetectionMessage(
        detectedAnyRef.current && bestAccuracyRef.current > 0
          ? '✓ Sesi latihan selesai'
          : '⚠️ Tidak terdeteksi'
      );
    }, LATIHAN_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [exercise, isScanning]);

  const handleDetection = useCallback(
    ({ detections }) => {
      setLiveDetections(detections || []);
      if (!exercise) return;
      if (!isScanning) return;

      // Parse target_signs
      const expectedSigns = Array.isArray(exercise.target_signs)
        ? exercise.target_signs
        : JSON.parse(exercise.target_signs || '[]');

      if (!detections || detections.length === 0) {
        setIsDetected(false);
        setDetectionMessage('Mendeteksi...');
        return;
      }

      // YOLOv8DetectorONNX pakai field: det.confidence (bukan det.conf)
      const getConf = (d) => d.confidence ?? d.conf ?? 0;

      // Filter hanya deteksi yang className-nya PERSIS ada di target_signs
      const matched = detections.filter((d) =>
        expectedSigns.includes(String(d.className || '').trim())
      );

      if (matched.length === 0) {
        // Ada deteksi tapi bukan target → akurasi 0, TIDAK update bestAccuracyRef
        detectedAnyRef.current = true;
        setIsDetected(false);
        setAccuracy(0);
        const wrongNames = detections.map((d) => d.className).join(', ');
        setDetectionMessage(`⚠️ Terbaca "${wrongNames}", bukan target`);
        return;
      }

      // Match ditemukan → ambil confidence tertinggi dari yang match
      const maxConfidence = Math.max(...matched.map((d) => getConf(d)));
      // confidence dari detector sudah dalam range 0–1
      const pct = Math.max(0, Math.min(100, maxConfidence * 100));

      detectedAnyRef.current = true;
      // Hanya update bestAccuracyRef jika lebih tinggi dari sebelumnya
      bestAccuracyRef.current = Math.max(bestAccuracyRef.current, pct);

      setIsDetected(true);
      setAccuracy(Math.round(bestAccuracyRef.current));
      setDetectionMessage(
        `✓ "${matched[0].className}" terdeteksi (${Math.round(pct)}%)`
      );
    },
    [exercise, isScanning]
  );

  const handleRetry = () => {
    bestAccuracyRef.current = 0;
    detectedAnyRef.current = false;

    setAccuracy(0);
    setIsDetected(false);
    setDetectionMessage('Mendeteksi...');
    setIsScanning(true);
    startTimeRef.current = Date.now();
  };

  const handleNext = async () => {
  if (!user || !exercise || isProcessing) return;

  setIsProcessing(true);

  try {
    // kalau masih scanning, paksa finalisasi dulu
    let finalAccuracy = accuracy;

    if (isScanning) {
      finalAccuracy = Math.round(bestAccuracyRef.current || 0);
    }

    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score = finalAccuracy;

    await saveExerciseResult(exercise.id, {
      module_id: id,
      score,
      accuracy: finalAccuracy,
      attempts: 1,
      time_seconds: timeSeconds,
    });

    await upsertProgress(id, {
      completed_exercises: exercise.sort_order,
      progress_percentage: 100,
      last_exercise_index: exercise.sort_order,
    });

    navigate(`/modul/${id}/hasil`, {
      state: {
        score,
        accuracy: finalAccuracy,
        timeSeconds,
        exerciseTitle: exercise.title,
        exerciseIndex: exercise.sort_order,
        totalExercises: module?.total_exercises || allExercises.length,
      },
    });

  } catch (err) {
    console.error(err);
    alert('Gagal menyimpan hasil. Coba lagi.');
  } finally {
    setIsProcessing(false);
  }
};

  if (authLoading || loading) return <LoadingSpinner text="Memuat latihan..." />;
  if (!exercise)
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Latihan tidak ditemukan.</p>
      </div>
    );

  const currentExIdx = exercise.sort_order;
  const totalEx = module?.total_exercises || allExercises.length;

  // Parse reference_url untuk multi-gambar
  const referenceUrls = (() => {
    try {
      if (!exercise?.reference_url) return {};
      if (typeof exercise.reference_url === 'string') {
        return JSON.parse(exercise.reference_url);
      }
      return exercise.reference_url;
    } catch {
      return {};
    }
  })();

  const refKeys = Object.keys(referenceUrls);
  const currentRefUrl = refKeys.length > 0 ? referenceUrls[refKeys[refImageIndex]] : null;

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-6 pb-20">
      <Container>
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ← Kembali
          </button>

          <div className="bg-light-blue text-primary-blue text-xs px-3 py-1 rounded-full font-semibold">
            {currentExIdx}/{totalEx}
          </div>
        </div>

        {/* INSTRUKSI */}
        <div className="bg-light-blue rounded-2xl p-4 sm:p-6 text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-blue mb-2">
            Instruksi
          </h1>

          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            {exercise.instruction ||
              `Tunjukkan isyarat untuk ${exercise.title}. Posisikan tanganmu di dalam bingkai kamera dan tahan selama ${LATIHAN_SECONDS} detik.`}
          </p>
        </div>

        {/* REFERENSI & KAMERA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <p className="text-sm font-semibold text-center mb-3 text-gray-600">REFERENSI</p>
            <div className="h-100 bg-light-blue rounded-2xl flex items-center justify-center overflow-hidden relative">
              {currentRefUrl ? (
                <>
                  <img
                    src={currentRefUrl}
                    alt={refKeys[refImageIndex] || exercise?.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Tombol navigasi huruf/target jika lebih dari 1 */}
                  {refKeys.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {refKeys.map((k, i) => (
                        <button
                          key={k}
                          onClick={() => setRefImageIndex(i)}
                          className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                            i === refImageIndex
                              ? 'bg-primary-blue text-white'
                              : 'bg-white text-gray-600 border border-gray-300 hover:bg-light-blue'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-white">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
          </div>

          <div>
  <p className="text-sm font-semibold text-center mb-3 text-gray-600">
    KAMERA ANDA
  </p>

  {/* BOX UTAMA */}
  <div className=" h-100  bg-light-blue rounded-2xl overflow-hidden relative">

    {/* FORCE FULL HEIGHT */}
    <div className="absolute inset-0 w-full h-full">
      
      <YOLOv8DetectorONNX
        modelPath={modelPath}
        onDetection={handleDetection}
        isEnabled={!!exercise}
        confidenceThreshold={0.5}
        fps={10}
        className="w-full h-full"
      />

    </div>

  </div>
</div>
        </div>

        

        {/* ACTION */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">

          <button
  onClick={handleNext}
  disabled={isProcessing}
  className="bg-primary-blue text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
>
  Selanjutnya
</button>
        </div>

        {/* TIPS */}
        <div className="flex items-start gap-2 text-sm text-gray-500 max-w-xl mx-auto">
          <Lightbulb size={18} className="text-secondary shrink-0 mt-0.5" />
          <p>
            Tips: Pastikan pencahayaan cukup dan latar belakang tidak terlalu ramai agar deteksi lebih akurat.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default LatihanPage;