import * as ort from 'onnxruntime-web';

// Konfigurasi onnxruntime agar menggunakan WebGL atau WASM dengan optimal
ort.env.wasm.numThreads = 2;

/**
 * Memuat model ONNX secara asinkron
 * @param {string} modelPath 
 */
export const loadModel = async (modelPath) => {
  try {
    const session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['webgl', 'wasm'],
    });
    return session;
  } catch (error) {
    console.error('Gagal memuat session ONNX:', error);
    throw error;
  }
};

/**
 * Preprocessing & Menjalankan Inferece YOLOv8
 * @param {ort.InferenceSession} session 
 * @param {HTMLVideoElement} videoElement 
 * @param {number} threshold 
 * @param {Array<string>} labels 
 */
export const runInference = async (session, videoElement, threshold = 0.5, labels = []) => {
  if (!session || !videoElement || videoElement.readyState < 2) return [];

  const modelWidth = 640;
  const modelHeight = 640;

  // 1. Preprocessing via Temporary Canvas
  const canvas = document.createElement('canvas');
  canvas.width = modelWidth;
  canvas.height = modelHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, modelWidth, modelHeight);

  const imgData = ctx.getImageData(0, 0, modelWidth, modelHeight);
  const { data } = imgData;

  // Mengubah format RGBA ke Float32Array Planar (CHW) & Normalisasi 0-1
  const floatBuffer = new Float32Array(modelWidth * modelHeight * 3);
  let rIndex = 0;
  let gIndex = modelWidth * modelHeight;
  let bIndex = modelWidth * modelHeight * 2;

  for (let i = 0; i < data.length; i += 4) {
    floatBuffer[rIndex++] = data[i] / 255.0;     // R
    floatBuffer[gIndex++] = data[i + 1] / 255.0; // G
    floatBuffer[bIndex++] = data[i + 2] / 255.0; // B
  }

  // 2. Jalankan Inference
  const inputTensor = new ort.Tensor('float32', floatBuffer, [1, 3, modelWidth, modelHeight]);
  const outputs = await session.run({ [session.inputNames[0]]: inputTensor });
  const outputTensor = outputs[session.outputNames[0]];
  
  // 3. Postprocessing (YOLOv8 Output format: [1, 4 + num_classes, 8400])
  const dims = outputTensor.dims;
  const numElements = dims[1]; // 4 koordinat + jumlah kelas
  const numBoxes = dims[2];    // 8400 prediktor pratinjau
  const outputData = outputTensor.data;

  let candidates = [];

  for (let boxIdx = 0; boxIdx < numBoxes; boxIdx++) {
    // Cari kelas dengan skor tertinggi untuk box ini
    let maxScore = 0;
    let classId = -1;

    for (let classIdx = 4; classIdx < numElements; classIdx++) {
      const score = outputData[classIdx * numBoxes + boxIdx];
      if (score > maxScore) {
        maxScore = score;
        classId = classIdx - 4;
      }
    }

    if (maxScore >= threshold) {
      // Ambil koordinat pusat (normalized/pixel space sesuai resolusi model 640)
      const cx = outputData[0 * numBoxes + boxIdx];
      const cy = outputData[1 * numBoxes + boxIdx];
      const w = outputData[2 * numBoxes + boxIdx];
      const h = outputData[3 * numBoxes + boxIdx];

      // Konversi ke format x_min, y_min, width, height
      const x = cx - w / 2;
      const y = cy - h / 2;

      candidates.push({
        box: [x, y, w, h],
        confidence: maxScore,
        classId: classId,
        className: labels[classId] || `Kelas ${classId}`
      });
    }
  }

  // 4. Non-Maximum Suppression (NMS) Sederhana untuk menyaring kotak bertumpuk
  candidates.sort((a, b) => b.confidence - a.confidence);
  const result = [];
  const nmsThreshold = 0.45;

  const calculateIoU = (boxA, boxB) => {
    const xA = Math.max(boxA[0], boxB[0]);
    const yA = Math.max(boxA[1], boxB[1]);
    const xB = Math.min(boxA[0] + boxA[2], boxB[0] + boxB[2]);
    const yB = Math.min(boxA[1] + boxA[3], boxB[1] + boxB[3]);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = boxA[2] * boxA[3];
    const boxBArea = boxB[2] * boxB[3];

    return interArea / (boxAArea + boxBArea - interArea);
  };

  while (candidates.length > 0) {
    const best = candidates.shift();
    result.push(best);
    candidates = candidates.filter(item => calculateIoU(best.box, item.box) < nmsThreshold);
  }

  return result;
};