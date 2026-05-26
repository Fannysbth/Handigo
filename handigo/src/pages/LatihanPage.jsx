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

  const [exercise, setExercise] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [module, setModule] = useState(null);
  const [existingProgress, setExistingProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isScanning, setIsScanning] = useState(true);
  const [detectionMessage, setDetectionMessage] = useState('Mendeteksi...');

  const [accuracy, setAccuracy] = useState(0);
  const [isDetected, setIsDetected] = useState(false);

  const bestAccuracyRef = useRef(0);
  const detectedAnyRef = useRef(false);

  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  const [refImageIndex, setRefImageIndex] = useState(0);

  const exerciseId = location.state?.exerciseId;
  const exerciseIndex = location.state?.exerciseIndex;

  // ─── PENCERNAAN PATH MODEL SECARA DINAMIS & AMAN ───────────────────────────
  const modelPath = useMemo(() => {
    if (!id) return '/models/yolov8/best.onnx';

    const idStr = String(id).toLowerCase();
    const titleStr = module?.title ? String(module.title).toLowerCase() : '';

    // Cek Modul Angka (Bisa lewat segmen ID URL, kata kunci ID, atau Judul dari DB)
    if (
      idStr === '2' || 
      idStr.includes('number') || 
      idStr.includes('angka') ||
      titleStr.includes('angka') || 
      titleStr.includes('number')
    ) {
      return '/models/yolov8/numbers.onnx';
    }

    // Cek Modul Kata / Kosakata
    if (
      idStr === '3' || 
      idStr.includes('word') || 
      idStr.includes('kata') ||
      titleStr.includes('kata') || 
      titleStr.includes('kosakata') || 
      titleStr.includes('word')
    ) {
      return '/models/yolov8/words.onnx';
    }

    // Default Fallback ke Modul 1 (Alfabet)
    return '/models/yolov8/best.onnx';
  }, [id, module]);

  // Parsing target_signs dipisah ke useMemo agar tidak merusak siklus re-render
  const expectedSigns = useMemo(() => {
    if (!exercise) return [];
    try {
      return Array.isArray(exercise.target_signs)
        ? exercise.target_signs.map(s => String(s).trim())
        : JSON.parse(exercise.target_signs || '[]').map(s => String(s).trim());
    } catch (e) {
      console.error("Gagal mengurai target_signs:", e);
      return [];
    }
  }, [exercise]);

  useEffect(() => {
    setRefImageIndex(0);
  }, [exercise?.id]);

  // Memuat seluruh data dari API Backend
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

        let prog = null;
        if (user) {
          prog = await fetchModuleProgress(id);
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
            const nextIdx = (prog?.completed_exercises || 0) + 1;
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
  }, [id, exerciseId, exerciseIndex, authLoading, user]);

  // Timer Manajemen Sesi Latihan
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
          : '⚠️ Waktu habis, isyarat tidak terdeteksi'
      );
    }, LATIHAN_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [exercise, isScanning]);

  // Callback penerima koordinat & deteksi dari komponen anak
  const handleDetection = useCallback(
    ({ detections }) => {
      if (!exercise || !isScanning) return;

      if (!detections || detections.length === 0) {
        setIsDetected(false);
        setDetectionMessage('Mendeteksi...');
        return;
      }

      // Normalisasi nama deteksi dari model agar seragam huruf kapital/spasi
      const matched = detections.filter((d) =>
        expectedSigns.some(target => target.toLowerCase() === String(d.className || '').trim().toLowerCase())
      );

      if (matched.length === 0) {
        detectedAnyRef.current = true;
        setIsDetected(false);
        setAccuracy(0);
        const wrongNames = detections.map((d) => d.className).join(', ');
        setDetectionMessage(`⚠️ Terbaca "${wrongNames}", posisikan tangan dengan benar`);
        return;
      }

      const maxConfidence = Math.max(...matched.map((d) => d.confidence || 0));
      const pct = Math.max(0, Math.min(100, maxConfidence * 100));

      detectedAnyRef.current = true;
      bestAccuracyRef.current = Math.max(bestAccuracyRef.current, pct);

      setIsDetected(true);
      setAccuracy(Math.round(bestAccuracyRef.current));
      setDetectionMessage(
        `✓ "${matched[0].className}" terdeteksi sempurna (${Math.round(pct)}%)`
      );
    },
    [exercise, isScanning, expectedSigns]
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
      alert('Gagal menyimpan hasil progress. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner text="Menyiapkan halaman kelas..." />;
  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Soal latihan tidak ditemukan.</p>
      </div>
    );
  }

  const currentExIdx = exercise.sort_order;
  const totalEx = module?.total_exercises || allExercises.length;

  // Parser URL gambar referensi pintar
  const referenceUrls = (() => {
    try {
      if (!exercise?.reference_url) return {};
      
      let urlsArray = [];
      if (typeof exercise.reference_url === 'string') {
        if (exercise.reference_url.startsWith('{') && exercise.reference_url.endsWith('}')) {
          const cleanedStr = exercise.reference_url.slice(1, -1);
          urlsArray = cleanedStr.split(',').map(url => url.trim());
        } else {
          try {
            const parsed = JSON.parse(exercise.reference_url);
            urlsArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
          } catch {
            urlsArray = [exercise.reference_url];
          }
        }
      } else if (Array.isArray(exercise.reference_url)) {
        urlsArray = exercise.reference_url;
      }

      const mappedObj = {};
      urlsArray.forEach((url, index) => {
        const label = expectedSigns[index] !== undefined ? String(expectedSigns[index]).trim() : `Gbr ${index + 1}`;
        mappedObj[label] = url;
      });

      return mappedObj;
    } catch (err) {
      console.error("Gagal melakukan parse link gambar referensi:", err);
      return {};
    }
  })();

  const refKeys = Object.keys(referenceUrls);
  const currentRefUrl = refKeys.length > 0 ? referenceUrls[refKeys[refImageIndex]] : null;

  return (
    <div className="flex-1 flex flex-col bg-white text-gray-800 antialiased pt-20 pb-6">
      <Container>
        {/* PROGRESS NAV */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            ← Kembali ke Modul
          </button>

          <div className="bg-light-blue text-primary-blue text-xs px-4 py-1.5 rounded-full font-bold">
            Soal {currentExIdx} dari {totalEx}
          </div>
        </div>

        {/* AREA INSTRUKSI */}
        <div className="bg-light-blue rounded-2xl p-5 sm:p-6 text-center mb-6 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-blue mb-2 tracking-tight">
            Target: {exercise.title}
          </h1>
          <p className="text-blue-600 font-bold mb-3 text-base tracking-wide bg-white/60 inline-block px-4 py-1 rounded-full">
            {detectionMessage}
          </p>
          <p className="text-gray-600 text-sm max-w-xl mx-auto leading-relaxed">
            {exercise.instruction ||
              `Arahkan tangan Anda ke kamera dan peragakan simbol bahasa isyarat yang tepat.`}
          </p>
        </div>

        {/* KONTEN UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* SISI KIRI: REFERENSI */}
          <div>
            <p className="text-xs font-bold tracking-wider text-center mb-3 text-gray-400 uppercase">Gambar Panduan</p>
            <div className="h-96 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-inner">
              {currentRefUrl ? (
                <>
                  <img
                    src={currentRefUrl}
                    alt={refKeys[refImageIndex] || exercise?.title}
                    className="w-full h-full object-contain p-2"
                  />
                  {refKeys.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 bg-black/5 py-1 backdrop-blur-xs">
                      {refKeys.map((k, i) => (
                        <button
                          key={k}
                          onClick={() => setRefImageIndex(i)}
                          className={`min-w-[40px] h-7 rounded px-2 text-xs font-bold transition-all cursor-pointer ${
                            i === refImageIndex
                              ? 'bg-primary-blue text-white shadow-sm'
                              : 'bg-white/90 text-gray-600 hover:bg-white border border-gray-200'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2">
                  <ImageIcon size={36} />
                  <span className="text-xs">Tidak ada gambar panduan</span>
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: VIDEO DETEKTOR */}
          <div>
            <p className="text-xs font-bold tracking-wider text-center mb-3 text-gray-400 uppercase">Kamera Pemindai</p>
            <div className="h-96 bg-gray-900 rounded-2xl overflow-hidden relative shadow-md border border-gray-800">
              <YOLOv8DetectorONNX
                modelPath={modelPath}
                onDetection={handleDetection}
                isEnabled={isScanning && !!exercise}
                confidenceThreshold={0.4}
                fps={6}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          {!isScanning && (
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto bg-gray-100 text-gray-700 px-8 py-3.5 rounded-full text-sm font-bold hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
            >
              Coba Pindai Ulang
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-primary-blue text-white px-10 py-3.5 rounded-full text-sm font-bold hover:bg-primary-hover active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Menyimpan Hasil...' : 'Lanjut'}
          </button>
        </div>

        {/* FOOTER TIPS */}
        <div className="flex items-start gap-2.5 text-xs text-gray-400 max-w-lg mx-auto bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-normal">
            <strong>Tips Akurasi:</strong> Pastikan telapak tangan menghadap penuh ke arah lensa kamera, tidak terlalu jauh, serta hindari bayangan objek lain di latar belakang.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default LatihanPage;