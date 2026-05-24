import * as ort from 'onnxruntime-web';

const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe',
  'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis',
  'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

let session = null;

export const loadONNXModel = async (modelPath) => {
  try {
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
    });
    console.log('ONNX model loaded successfully');
    return session;
  } catch (err) {
    console.error('Failed to load ONNX model:', err);
    throw err;
  }
};

export const preprocessImage = (canvas, inputSize = 640) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  canvas.width = inputSize;
  canvas.height = inputSize;

  const normalized = new Float32Array(inputSize * inputSize * 3);
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    normalized[idx] = data[i] / 255.0;
    normalized[idx + inputSize * inputSize] = data[i + 1] / 255.0;
    normalized[idx + 2 * inputSize * inputSize] = data[i + 2] / 255.0;
  }

  return new ort.Tensor('float32', normalized, [1, 3, inputSize, inputSize]);
};

export const runInference = async (imageData, inputSize = 640) => {
  if (!session) {
    throw new Error('Model not loaded. Call loadONNXModel first.');
  }
  try {
    const feeds = { images: imageData };
    const results = await session.run(feeds);
    return results;
  } catch (err) {
    console.error('Inference error:', err);
    throw err;
  }
};

export const postprocessOutput = (
  output,
  originalWidth,
  originalHeight,
  confidenceThreshold = 0.5
) => {
  // FIX: output sudah tensor langsung, bukan { output0: tensor }
  const tensor = output;
  const data = tensor.data;
  const dims = tensor.dims; // [1, 30, 8400]

  const featuresFirst = dims[1] < dims[2];
  const numFeatures = featuresFirst ? dims[1] : dims[2];
  const numBoxes    = featuresFirst ? dims[2] : dims[1];
  const numClasses  = numFeatures - 4;

  const detections = [];

  for (let i = 0; i < numBoxes; i++) {
    let cx, cy, w, h;
    const classScores = [];

    if (featuresFirst) {
      cx = data[0 * numBoxes + i];
      cy = data[1 * numBoxes + i];
      w  = data[2 * numBoxes + i];
      h  = data[3 * numBoxes + i];
      for (let c = 0; c < numClasses; c++) {
        classScores[c] = data[(4 + c) * numBoxes + i];
      }
    } else {
      const offset = i * numFeatures;
      cx = data[offset];
      cy = data[offset + 1];
      w  = data[offset + 2];
      h  = data[offset + 3];
      for (let c = 0; c < numClasses; c++) {
        classScores[c] = data[offset + 4 + c];
      }
    }

    let maxScore = -Infinity;
    let classId = 0;
    for (let c = 0; c < numClasses; c++) {
      if (classScores[c] > maxScore) {
        maxScore = classScores[c];
        classId = c;
      }
    }

    if (maxScore < confidenceThreshold) continue;

    detections.push({
      x:          ((cx - w / 2) / 640) * originalWidth,
      y:          ((cy - h / 2) / 640) * originalHeight,
      width:      (w / 640) * originalWidth,
      height:     (h / 640) * originalHeight,
      confidence: maxScore,
      classId,
      className:  String.fromCharCode(65 + classId), // 0=A, 1=B, dst
    });
  }

  return nms(detections, 0.45);
};

function iou(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width,  b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

function nms(dets, iouThr) {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const kept = [];
  const seen = new Set();
  for (let i = 0; i < sorted.length; i++) {
    if (seen.has(i)) continue;
    kept.push(sorted[i]);
    for (let j = i + 1; j < sorted.length; j++) {
      if (iou(sorted[i], sorted[j]) > iouThr) seen.add(j);
    }
  }
  return kept;
}

export { COCO_CLASSES };