const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/xvIvKqIrz/';
const storageKey = 'petvision-theme';

const themeToggleBtn = document.getElementById('theme-toggle');
const imageUploadInput = document.getElementById('image-upload');
const startCameraBtn = document.getElementById('start-camera-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');
const modelStatus = document.getElementById('model-status');
const topResult = document.getElementById('top-result');
const labelContainer = document.getElementById('label-container');
const webcamContainer = document.getElementById('webcam-container');
const uploadedPreview = document.getElementById('uploaded-preview');
const previewStage = document.getElementById('preview-stage');
const emptyState = document.getElementById('empty-state');

let model;
let webcam;
let maxPredictions = 0;
let animationFrameId;

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
}

function setTheme(theme) {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
}

async function loadModel() {
    if (model) {
        return model;
    }

    modelStatus.textContent = '모델 로딩 중...';

    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    modelStatus.textContent = '모델 준비 완료';
    modelStatus.classList.add('ready');
    topResult.textContent = '이미지를 업로드하거나 웹캠을 시작해 주세요.';
    return model;
}

function setPreviewState(hasImage) {
    previewStage.classList.toggle('empty', !hasImage);
    emptyState.hidden = hasImage;
}

function renderPredictions(predictions) {
    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
    const bestPrediction = sortedPredictions[0];

    topResult.textContent = `${bestPrediction.className}일 확률이 ${(bestPrediction.probability * 100).toFixed(1)}% 입니다.`;

    labelContainer.innerHTML = '';

    sortedPredictions.forEach((prediction) => {
        const item = document.createElement('div');
        item.className = 'prediction-item';

        const head = document.createElement('div');
        head.className = 'prediction-head';
        head.innerHTML = `<strong>${prediction.className}</strong><span>${(prediction.probability * 100).toFixed(1)}%</span>`;

        const bar = document.createElement('div');
        bar.className = 'prediction-bar';

        const fill = document.createElement('div');
        fill.className = 'prediction-fill';
        fill.style.width = `${Math.max(4, prediction.probability * 100)}%`;

        bar.appendChild(fill);
        item.appendChild(head);
        item.appendChild(bar);
        labelContainer.appendChild(item);
    });
}

async function predictFromElement(element) {
    const loadedModel = await loadModel();
    const predictions = await loadedModel.predict(element);
    renderPredictions(predictions);
}

function stopWebcam() {
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (webcam) {
        webcam.stop();
        webcam = null;
    }

    webcamContainer.innerHTML = '';
    stopCameraBtn.disabled = true;
}

async function loop() {
    if (!webcam) {
        return;
    }

    webcam.update();
    await predictFromElement(webcam.canvas);
    animationFrameId = window.requestAnimationFrame(loop);
}

async function startWebcam() {
    try {
        await loadModel();
        stopWebcam();

        webcam = new tmImage.Webcam(320, 320, true);
        await webcam.setup();
        await webcam.play();

        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        uploadedPreview.removeAttribute('src');
        setPreviewState(true);
        stopCameraBtn.disabled = false;
        topResult.textContent = '웹캠으로 분석 중입니다.';
        animationFrameId = window.requestAnimationFrame(loop);
    } catch (error) {
        modelStatus.textContent = '웹캠 접근 실패';
        topResult.textContent = '브라우저 권한 또는 HTTPS 환경을 확인해 주세요.';
        console.error(error);
    }
}

async function handleImageUpload(event) {
    const [file] = event.target.files;

    if (!file) {
        return;
    }

    stopWebcam();
    await loadModel();

    const imageURL = URL.createObjectURL(file);
    uploadedPreview.onload = async () => {
        setPreviewState(true);
        await predictFromElement(uploadedPreview);
        URL.revokeObjectURL(imageURL);
    };
    uploadedPreview.src = imageURL;
}

themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
});

imageUploadInput.addEventListener('change', handleImageUpload);
startCameraBtn.addEventListener('click', startWebcam);
stopCameraBtn.addEventListener('click', () => {
    stopWebcam();
    setPreviewState(false);
    topResult.textContent = '웹캠이 중지되었습니다. 이미지를 업로드하거나 다시 시작할 수 있습니다.';
});

applyTheme(getPreferredTheme());
setPreviewState(false);
stopCameraBtn.disabled = true;
loadModel().catch((error) => {
    modelStatus.textContent = '모델 로딩 실패';
    topResult.textContent = '모델 파일을 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.';
    console.error(error);
});
