import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Model registry ───────────────────────────────────────────────────────────
const MODELS = [
  {
    id: 'alphabet',
    label: 'Alfabet',
    description: 'A – Z  (26 kelas)',
    path: '/models/yolov8/best.onnx',
    nc: 26,
    names: [
      'A','B','C','D','E','F','G','H','I','J','K','L','M',
      'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    ],
    color: '#00ff9d',
  },
  {
    id: 'words',
    label: 'Kata',
    description: '15 kelas kata',
    path: '/models/yolov8/words.onnx',
    nc: 15,
    names: [
      'Bodoh','Cinta','Jahat','Kamu','Kasih',
      'Maaf','Makan','Masuk','Minum','Nama',
      'Rumah','Saya','Terima','Tidur','Tolong',
    ],
    color: '#7c6aff',
  },
  {
    id: 'numbers',
    label: 'Angka',
    description: '9 kelas angka',
    path: '/models/yolov8/numbers.onnx',
    nc: 9,
    names: [
      'Delapan','Dua','Empat','Enam','Lima',
      'Satu','Sembilan','Tiga','Tujuh',
    ],
    color: '#ff9d00',
  },
];

// ─── Webcam hook ──────────────────────────────────────────────────────────────
function useWebcam() {
  const videoRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!mounted) return;

        stream = mediaStream;

        const video = videoRef.current;

        if (!video) {
          throw new Error('Video element missing');
        }

        video.srcObject = mediaStream;

        // JANGAN await play()
        video.onloadedmetadata = () => {
          video.play()
            .then(() => {
              if (mounted) {
                setIsReady(true);
              }
            })
            .catch((err) => {
              console.error('Play error:', err);
              if (mounted) {
                setError(err.message);
              }
            });
        };

      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(err.message || 'Camera error');
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isReady,
    error,
  };
}
// ─── Main page ────────────────────────────────────────────────────────────────
export default function CVTestPage() {
  const CONFIDENCE = 0.45;

  const { videoRef, isReady, error: camError } = useWebcam();
  const captureCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef     = useRef(null);

  // Per-model session cache so we don't reload when switching back
  const sessionCacheRef = useRef({});
  const intervalRef     = useRef(null);
  const frameCountRef   = useRef(0);
  const fpsTimerRef     = useRef(Date.now());
  const statsRef        = useRef({ fps: 0 });

  const [activeModelId, setActiveModelId]   = useState('alphabet');
  const [modelStates,   setModelStates]     = useState(() =>
    Object.fromEntries(MODELS.map((m) => [m.id, { status: 'idle', error: '' }]))
  );
  const [running,       setRunning]         = useState(false);
  const [stats,         setStats]           = useState({ fps: 0, detections: 0, inferenceMs: 0 });
  const [detectionLog,  setDetectionLog]    = useState([]);
  const [modelInfo,     setModelInfo]       = useState(null);

  const activeModel = MODELS.find((m) => m.id === activeModelId);
  const activeState = modelStates[activeModelId];

  // Keep statsRef in sync
  statsRef.current = stats;

  // Overlay canvas size sync
  useEffect(() => {
    const overlay    = overlayCanvasRef.current;
    const container  = containerRef.current;
    if (!overlay || !container) return;
    const sync = () => { overlay.width = container.offsetWidth; overlay.height = container.offsetHeight; };
    const ro = new ResizeObserver(sync);
    ro.observe(container);
    sync();
    return () => ro.disconnect();
  }, []);

  // Stop inference whenever model changes
  useEffect(() => {
    setRunning(false);
    setStats({ fps: 0, detections: 0, inferenceMs: 0 });
    setDetectionLog([]);
    setModelInfo(null);
    frameCountRef.current = 0;
    fpsTimerRef.current   = Date.now();
  }, [activeModelId]);

  // Load model (cached per id)
  const loadModel = useCallback(async () => {
    const model = activeModel;

    setModelStates((s) => ({ ...s, [model.id]: { status: 'loading', error: '' } }));

    try {
      const ort = await import('onnxruntime-web');
      ort.env.wasm.numThreads = 1;

      let session = sessionCacheRef.current[model.id];
      if (!session) {
        session = await ort.InferenceSession.create(model.path, {
          executionProviders: ['wasm'],
        });
        sessionCacheRef.current[model.id] = session;
      }

      // Probe output shape with a dummy run
      const dummy = new ort.Tensor('float32', new Float32Array(1 * 3 * 640 * 640), [1, 3, 640, 640]);
      const dummyOut = await session.run({ [session.inputNames[0]]: dummy });
      const outTensor = dummyOut[session.outputNames[0]];

      setModelInfo({
        inputs:      session.inputNames,
        outputs:     session.outputNames,
        outputShape: Array.from(outTensor.dims),
      });

      setModelStates((s) => ({ ...s, [model.id]: { status: 'ready', error: '' } }));
    } catch (err) {
      setModelStates((s) => ({ ...s, [model.id]: { status: 'error', error: err.message } }));
    }
  }, [activeModel]);

  // Inference loop
  const processFrame = useCallback(async () => {
    const session = sessionCacheRef.current[activeModelId];
    if (!session || !videoRef.current || !isReady) return;

    const video = videoRef.current;
    const cap   = captureCanvasRef.current;
    const ov    = overlayCanvasRef.current;
    if (!cap || !ov) return;

    cap.width  = video.videoWidth  || 640;
    cap.height = video.videoHeight || 480;
    cap.getContext('2d').drawImage(video, 0, 0, cap.width, cap.height);

    const t0 = performance.now();

    try {
      const ort = await import('onnxruntime-web');

      const resized = document.createElement('canvas');
      resized.width = resized.height = 640;
      resized.getContext('2d').drawImage(cap, 0, 0, 640, 640);
      const imgData = resized.getContext('2d').getImageData(0, 0, 640, 640);

      const input = new Float32Array(3 * 640 * 640);
      for (let i = 0; i < 640 * 640; i++) {
        input[i]                 = imgData.data[i * 4]     / 255;
        input[640 * 640 + i]     = imgData.data[i * 4 + 1] / 255;
        input[2 * 640 * 640 + i] = imgData.data[i * 4 + 2] / 255;
      }

      const results = await session.run({
        [session.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, 640, 640]),
      });

      const inferenceMs  = Math.round(performance.now() - t0);
      const outTensor    = results[session.outputNames[0]];
      const detections   = parseYOLOv8(outTensor, CONFIDENCE, activeModel.names);

      // FPS
      frameCountRef.current++;
      const now     = Date.now();
      const elapsed = (now - fpsTimerRef.current) / 1000;
      let fps = statsRef.current.fps;
      if (elapsed >= 1) {
        fps = Math.round(frameCountRef.current / elapsed);
        frameCountRef.current = 0;
        fpsTimerRef.current   = now;
      }

      setStats({ fps, detections: detections.length, inferenceMs });

      if (detections.length > 0) {
        setDetectionLog((prev) => [
          { time: new Date().toLocaleTimeString(), detections, modelId: activeModelId },
          ...prev.slice(0, 14),
        ]);
      }

      // Draw
      const ow   = ov.width;
      const oh   = ov.height;
      const octx = ov.getContext('2d');
      octx.clearRect(0, 0, ow, oh);

      detections.forEach((det) => {
        const x = det.x * ow;
        const y = det.y * oh;
        const w = det.w * ow;
        const h = det.h * oh;

        const hue   = (det.classId * (360 / activeModel.nc)) % 360;
        const color = `hsl(${hue}, 90%, 60%)`;

        octx.strokeStyle = color;
        octx.lineWidth   = 2.5;
        octx.strokeRect(x, y, w, h);

        const label = `${det.className}  ${(det.conf * 100).toFixed(0)}%`;
        octx.font = 'bold 13px monospace';
        const tw = octx.measureText(label).width;
        roundRect(octx, x, y - 24, tw + 14, 22, 5);
        octx.fillStyle = color;
        octx.fill();
        octx.fillStyle = '#000';
        octx.fillText(label, x + 7, y - 7);
      });

      // Scan line
      const scanY = ((Date.now() / 8) % oh);
      octx.strokeStyle = `${activeModel.color}22`;
      octx.lineWidth   = 1.5;
      octx.beginPath(); octx.moveTo(0, scanY); octx.lineTo(ow, scanY); octx.stroke();

    } catch (err) {
      console.error('Inference error:', err);
    }
  }, [activeModelId, activeModel, isReady, videoRef]);
  useEffect(() => {
  console.log('isReady:', isReady);
  console.log('camError:', camError);
}, [isReady, camError]);

  useEffect(() => {
    if (running && activeState.status === 'ready') {
      intervalRef.current = setInterval(processFrame, 100);
    } else {
      clearInterval(intervalRef.current);
      const ov = overlayCanvasRef.current;
      if (ov) ov.getContext('2d').clearRect(0, 0, ov.width, ov.height);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, activeState.status, processFrame]);

  // Switch model tab (stops inference)
  const switchModel = (id) => {
    if (id === activeModelId) return;
    setRunning(false);
    setActiveModelId(id);
  };

  const accentColor = activeModel.color;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ ...s.badge, color: accentColor, borderColor: accentColor + '44', background: accentColor + '18' }}>
            DEV
          </span>
          <h1 style={s.title}>CV Model Test</h1>
        </div>
        <p style={s.subtitle}>YOLOv8 · ONNX Runtime Web · No backend required</p>
      </div>

      {/* Model switcher tabs */}
      <div style={s.tabs}>
        {MODELS.map((m) => {
          const st  = modelStates[m.id];
          const active = m.id === activeModelId;
          return (
            <button
              key={m.id}
              onClick={() => switchModel(m.id)}
              style={{
                ...s.tab,
                ...(active ? { ...s.tabActive, borderColor: m.color, color: m.color, background: m.color + '18' } : {}),
              }}
            >
              <span style={s.tabLabel}>{m.label}</span>
              <span style={s.tabDesc}>{m.description}</span>
              {/* Status dot */}
              <span style={{
                ...s.statusDot,
                background:
                  st.status === 'ready'   ? '#00ff9d' :
                  st.status === 'loading' ? '#ffaa00' :
                  st.status === 'error'   ? '#ff4d4d' : '#333',
                boxShadow: st.status === 'ready' ? `0 0 6px ${m.color}` : 'none',
              }} />
            </button>
          );
        })}
      </div>

      <div style={s.layout}>
        {/* Camera */}
        <div style={s.cameraSection}>
          <div ref={containerRef} style={{ ...s.cameraContainer, borderColor: running ? accentColor + '66' : '#1e1e2e' }}>
            {camError ? (
              <div style={s.camError}>
                <span style={{ fontSize: 36 }}>📷</span>
                <p style={{ color: '#ff6b6b', margin: '8px 0 0', fontSize: 13 }}>{camError}</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted controls={false} style={s.video} />
            )}
            <canvas ref={overlayCanvasRef} style={s.overlay} />
            <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

            {/* Corner brackets colored by model */}
            {['tl','tr','bl','br'].map((p) => (
              <div key={p} style={{ ...s.corner, ...s[p], borderColor: accentColor }} />
            ))}

            {/* Live badge */}
            <div style={s.liveBadge}>
              <span style={{
                ...s.dot,
                background:  running ? accentColor : '#333',
                boxShadow:   running ? `0 0 8px ${accentColor}` : 'none',
              }} />
              {running ? 'LIVE' : 'PAUSED'}
            </div>

            {/* Model name watermark */}
            <div style={{ ...s.watermark, color: accentColor + '99' }}>
              {activeModel.label.toUpperCase()}
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsBar}>
            {[
              { label: 'FPS',        value: stats.fps },
              { label: 'Detections', value: stats.detections },
              { label: 'Inference',  value: `${stats.inferenceMs}ms` },
              { label: 'Status',     value: activeState.status.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} style={s.statItem}>
                <span style={s.statLabel}>{label}</span>
                <span style={{ ...s.statValue, color: accentColor }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={s.sidebar}>
          {/* Load + Run */}
          <div style={s.card}>
            <p style={{ ...s.cardTitle, color: accentColor }}>Controls</p>

            <button
              onClick={loadModel}
              disabled={activeState.status === 'loading' || activeState.status === 'ready'}
              style={{
                ...s.btn,
                borderColor: accentColor + '55',
                ...(activeState.status === 'ready'   ? { background: accentColor + '18', color: accentColor } : {}),
                ...(activeState.status === 'loading' ? s.btnDisabled : {}),
              }}
            >
              {activeState.status === 'idle'    && `⬇ Load "${activeModel.label}" Model`}
              {activeState.status === 'loading' && '⏳ Loading…'}
              {activeState.status === 'ready'   && `✓ "${activeModel.label}" Ready`}
              {activeState.status === 'error'   && '↺ Retry Load'}
            </button>

            {activeState.status === 'error' && (
              <p style={s.errorText}>{activeState.error}</p>
            )}

            {modelInfo && (
              <div style={s.ioBox}>
                <p style={s.ioRow}>Shape: <code style={{ ...s.code, color: accentColor }}>[{modelInfo.outputShape.join(', ')}]</code></p>
                <p style={s.ioRow}>Features: <code style={{ ...s.code, color: accentColor }}>{modelInfo.outputShape[1]}</code> &nbsp; Boxes: <code style={{ ...s.code, color: accentColor }}>{modelInfo.outputShape[2]}</code></p>
              </div>
            )}

            <div style={{ ...s.btnRow, marginTop: 10 }}>
              <button
                onClick={() => setRunning(true)}
                disabled={activeState.status !== 'ready' || running || !!camError}
                style={{
                  ...s.btn, flex: 1,
                  background: accentColor + '18',
                  borderColor: accentColor + '55',
                  color: accentColor,
                  ...(running || activeState.status !== 'ready' ? s.btnDisabled : {}),
                }}
              >▶ Start</button>
              <button
                onClick={() => setRunning(false)}
                disabled={!running}
                style={{
                  ...s.btn, flex: 1,
                  background: '#ff4d4d18',
                  borderColor: '#ff4d4d55',
                  color: '#ff6b6b',
                  ...(!running ? s.btnDisabled : {}),
                }}
              >⏹ Stop</button>
            </div>
          </div>

          {/* Detection log */}
          <div style={{ ...s.card, flex: 1, minHeight: 0 }}>
            <p style={{ ...s.cardTitle, color: accentColor }}>Detection Log</p>
            {detectionLog.length === 0 ? (
              <p style={s.cardHint}>Belum ada deteksi. Tunjukkan isyarat ke kamera.</p>
            ) : (
              <div style={s.log}>
                {detectionLog.map((entry, i) => {
                  const entryModel = MODELS.find((m) => m.id === entry.modelId);
                  return (
                    <div key={i} style={s.logEntry}>
                      <span style={s.logTime}>{entry.time}</span>
                      <span style={{ ...s.logModel, color: entryModel?.color }}>
                        {entryModel?.label}
                      </span>
                      {entry.detections.map((d, j) => {
                        const hue = (d.classId * (360 / (entryModel?.nc || 26))) % 360;
                        return (
                          <span key={j} style={{
                            ...s.logTag,
                            background: `hsl(${hue},90%,10%)`,
                            borderColor: `hsl(${hue},90%,35%)`,
                            color:       `hsl(${hue},90%,65%)`,
                          }}>
                            {d.className} {(d.conf * 100).toFixed(0)}%
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Debug checklist */}
          <div style={s.card}>
            <p style={{ ...s.cardTitle, color: accentColor }}>Debug</p>
            {[
              { ok: !camError,                       label: 'Camera accessible' },
              { ok: isReady,                         label: 'Video stream ready' },
              { ok: activeState.status === 'ready',  label: `"${activeModel.label}" model loaded` },
              { ok: running,                         label: 'Inference running' },
              { ok: stats.detections > 0,            label: 'Detections found' },
            ].map(({ ok, label }) => (
              <div key={label} style={s.checkRow}>
                <span style={{ color: ok ? accentColor : '#444', fontSize: 14, width: 16 }}>
                  {ok ? '✓' : '○'}
                </span>
                <span style={{ color: ok ? '#ccc' : '#555', fontSize: 12 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Class list for active model */}
          <div style={s.card}>
            <p style={{ ...s.cardTitle, color: accentColor }}>
              {activeModel.label} Classes ({activeModel.nc})
            </p>
            <div style={s.classGrid}>
              {activeModel.names.map((name, i) => {
                const hue = (i * (360 / activeModel.nc)) % 360;
                return (
                  <div key={name} style={{
                    ...s.classChip,
                    background:  `hsl(${hue},90%,8%)`,
                    borderColor: `hsl(${hue},90%,28%)`,
                    color:       `hsl(${hue},90%,65%)`,
                    fontSize:    name.length > 5 ? 9 : 11,
                  }}>
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── YOLOv8 output parser ─────────────────────────────────────────────────────
// Shape [1, 4+nc, numBoxes] — features-first when dims[1] < dims[2]
function parseYOLOv8(tensor, threshold, classNames) {
  const data = tensor.data;
  const dims = tensor.dims;

  const featuresFirst = dims[1] < dims[2];
  const numFeatures   = featuresFirst ? dims[1] : dims[2];
  const numBoxes      = featuresFirst ? dims[2] : dims[1];
  const numClasses    = numFeatures - 4;

  const detections = [];

  for (let i = 0; i < numBoxes; i++) {
    let cx, cy, w, h;
    const scores = new Array(numClasses);

    if (featuresFirst) {
      cx = data[0 * numBoxes + i];
      cy = data[1 * numBoxes + i];
      w  = data[2 * numBoxes + i];
      h  = data[3 * numBoxes + i];
      for (let c = 0; c < numClasses; c++) scores[c] = data[(4 + c) * numBoxes + i];
    } else {
      const b = i * numFeatures;
      cx = data[b]; cy = data[b + 1]; w = data[b + 2]; h = data[b + 3];
      for (let c = 0; c < numClasses; c++) scores[c] = data[b + 4 + c];
    }

    let maxScore = -Infinity, classId = 0;
    for (let c = 0; c < numClasses; c++) {
      if (scores[c] > maxScore) { maxScore = scores[c]; classId = c; }
    }

    if (maxScore < threshold) continue;

    detections.push({
      x: (cx - w / 2) / 640,
      y: (cy - h / 2) / 640,
      w: w / 640,
      h: h / 640,
      conf: maxScore,
      classId,
      className: classNames[classId] ?? `class_${classId}`,
    });
  }

  return nms(detections, 0.45);
}

function iou(a, b) {
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

function nms(dets, iouThr) {
  const sorted = [...dets].sort((a, b) => b.conf - a.conf);
  const kept = [], seen = new Set();
  for (let i = 0; i < sorted.length; i++) {
    if (seen.has(i)) continue;
    kept.push(sorted[i]);
    for (let j = i + 1; j < sorted.length; j++) {
      if (iou(sorted[i], sorted[j]) > iouThr) seen.add(j);
    }
  }
  return kept;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:     { minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'JetBrains Mono','Fira Code',monospace", padding: 24, boxSizing: 'border-box' },
  header:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #1e1e2e', paddingBottom: 14, flexWrap: 'wrap', gap: 8 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  badge:    { borderRadius: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', letterSpacing: 2, border: '1px solid' },
  title:    { margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: -0.5 },
  subtitle: { margin: 0, fontSize: 11, color: '#444' },

  // Model tabs
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 14px', background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 10, cursor: 'pointer', color: '#555', fontFamily: 'inherit', position: 'relative', transition: 'all 0.15s' },
  tabActive: { background: '#0d0d18' },
  tabLabel: { fontSize: 14, fontWeight: 700 },
  tabDesc:  { fontSize: 10, opacity: 0.7 },
  statusDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: '50%' },

  layout:        { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' },
  cameraSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  cameraContainer: { position: 'relative', background: '#05050a', borderRadius: 12, overflow: 'hidden', border: '1px solid', aspectRatio: '4/3', width: '100%', transition: 'border-color 0.3s' },
  video:   { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  overlay: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  camError: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 18, height: 18, borderStyle: 'solid', opacity: 0.5 },
  tl: { top: 8, left: 8, borderWidth: '2px 0 0 2px' },
  tr: { top: 8, right: 8, borderWidth: '2px 2px 0 0' },
  bl: { bottom: 8, left: 8, borderWidth: '0 0 2px 2px' },
  br: { bottom: 8, right: 8, borderWidth: '0 2px 2px 0' },
  liveBadge: { position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.75)', border: '1px solid #222', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  watermark: { position: 'absolute', bottom: 10, left: 12, fontSize: 11, fontWeight: 700, letterSpacing: 3, pointerEvents: 'none' },

  statsBar:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 10, overflow: 'hidden' },
  statItem:  { padding: '10px 14px', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 17, fontWeight: 700 },

  sidebar:   { display: 'flex', flexDirection: 'column', gap: 12 },
  card:      { background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 10, padding: 14 },
  cardTitle: { margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  cardHint:  { margin: 0, fontSize: 12, color: '#444', lineHeight: 1.6 },

  btn:         { width: '100%', padding: '9px 14px', background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, color: '#e0e0e0', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' },
  btnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  btnRow:      { display: 'flex', gap: 8 },
  errorText:   { margin: '8px 0 0', fontSize: 11, color: '#ff6b6b', lineHeight: 1.5 },
  ioBox:       { marginTop: 10, padding: 10, background: '#05050a', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4 },
  ioRow:       { margin: 0, fontSize: 11, color: '#555' },
  code:        { fontFamily: 'inherit', fontSize: 11 },

  log:       { overflowY: 'auto', maxHeight: 200, display: 'flex', flexDirection: 'column', gap: 6 },
  logEntry:  { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  logTime:   { fontSize: 10, color: '#333', minWidth: 68 },
  logModel:  { fontSize: 10, fontWeight: 700, minWidth: 40 },
  logTag:    { fontSize: 11, padding: '1px 7px', borderRadius: 4, border: '1px solid', fontWeight: 700 },

  checkRow:  { display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0' },

  classGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 },
  classChip: { textAlign: 'center', padding: '4px 3px', borderRadius: 4, border: '1px solid', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};