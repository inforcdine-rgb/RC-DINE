const loadImage = (file) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image could not be loaded'));
        };
        image.src = url;
    });

const canvasToBlob = (canvas, quality) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed'))),
            'image/webp',
            quality
        );
    });

export const compressImageToWebp = async (
    file,
    {
        width = 800,
        height = 600,
        minKb = 100,
        maxKb = 150,
        square = false
    } = {}
) => {
    if (!file) throw new Error('Image file is required');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Only JPG, PNG and WebP images are allowed');
    }

    const image = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const targetRatio = square ? 1 : width / height;
    const sourceRatio = image.width / image.height;
    let sx = 0;
    let sy = 0;
    let sw = image.width;
    let sh = image.height;

    if (sourceRatio > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
    } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
    }

    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);
    const maxBytes = maxKb * 1024;
    const minBytes = minKb * 1024;

    while (blob.size > maxBytes && quality > 0.35) {
        quality -= 0.07;
        blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size < minBytes && quality < 0.95) {
        quality = Math.min(0.95, quality + 0.08);
        blob = await canvasToBlob(canvas, quality);
    }

    const baseName = String(file.name || 'image').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, {
        type: 'image/webp',
        lastModified: Date.now()
    });
};

export const compressHotelLogo = (file) =>
    compressImageToWebp(file, {
        width: 512,
        height: 512,
        minKb: 30,
        maxKb: 80,
        square: true
    });

export const compressFoodImage = (file) =>
    compressImageToWebp(file, {
        width: 800,
        height: 600,
        minKb: 100,
        maxKb: 150
    });

export const compressComboImage = (file) =>
    compressImageToWebp(file, {
        width: 1200,
        height: 675,
        minKb: 200,
        maxKb: 300
    });
