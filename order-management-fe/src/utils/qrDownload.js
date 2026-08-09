const QR_EXPORT_SIZE = 1024;
const TEMPLATE_WIDTH = 1748;
const TEMPLATE_HEIGHT = 2480;

const slugify = (value, fallback) => {
    const slug = String(value || fallback)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 70);
    return slug || fallback;
};

export const buildQrFilename = (cafeName, tableLabel) => {
    const cafeSlug = slugify(cafeName, 'cafe');
    const tableSlug = slugify(String(tableLabel || 'table').replace(/^table-/i, 'table'), 'table');
    return `${cafeSlug}-${tableSlug}.png`;
};

export const buildQrTemplateFilename = (cafeName, tableLabel, templateName) => {
    const base = buildQrFilename(cafeName, tableLabel).replace(/\.png$/i, '');
    return `${base}-${slugify(templateName, 'template')}.png`;
};

const getQrSvg = (container) => container?.querySelector('svg');

const svgToImage = (svg, size) =>
    new Promise((resolve, reject) => {
        if (!svg) {
            reject(new Error('QR code is not ready yet'));
            return;
        }

        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(size));
        clone.setAttribute('height', String(size));

        const svgString = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const objectUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('QR image could not be created'));
        };
        image.src = objectUrl;
    });

const triggerCanvasDownload = (canvas, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

const roundedRect = (context, x, y, width, height, radius) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
};

const hexToRgba = (hex, alpha) => {
    const normalized = String(hex || '#000000').replace('#', '');
    const value =
        normalized.length === 3
            ? normalized
                .split('')
                .map((item) => item + item)
                .join('')
            : normalized;
    const number = Number.parseInt(value, 16);
    if (!Number.isFinite(number)) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
};

const drawDotPattern = (context, template, variant = 'dots') => {
    const spacing = variant === 'stars' ? 120 : 92;
    context.fillStyle = hexToRgba(template.accent, variant === 'confetti' ? 0.4 : 0.22);
    for (let y = 70; y < TEMPLATE_HEIGHT; y += spacing) {
        for (let x = 60; x < TEMPLATE_WIDTH; x += spacing) {
            const offset = (Math.floor(y / spacing) % 2) * (spacing / 2);
            context.save();
            context.translate(x + offset, y);
            if (variant === 'confetti') context.rotate(((x + y) % 90) * (Math.PI / 180));
            if (variant === 'beans') {
                context.beginPath();
                context.ellipse(0, 0, 10, 17, Math.PI / 5, 0, Math.PI * 2);
                context.fill();
            } else if (variant === 'stars') {
                context.fillRect(-2, -11, 4, 22);
                context.fillRect(-11, -2, 22, 4);
            } else if (variant === 'petals') {
                context.beginPath();
                context.ellipse(0, 0, 8, 18, Math.PI / 4, 0, Math.PI * 2);
                context.fill();
            } else if (variant === 'bubbles') {
                context.strokeStyle = hexToRgba(template.accent, 0.32);
                context.lineWidth = 3;
                context.beginPath();
                context.arc(0, 0, 10 + ((x + y) % 18), 0, Math.PI * 2);
                context.stroke();
            } else if (variant === 'confetti') {
                context.fillRect(-3, -12, 6, 24);
            } else {
                context.beginPath();
                context.arc(0, 0, 4, 0, Math.PI * 2);
                context.fill();
            }
            context.restore();
        }
    }
};

const drawLinePattern = (context, template, variant) => {
    context.strokeStyle = hexToRgba(template.accent, 0.2);
    context.lineWidth = variant === 'chrome' ? 4 : 2;

    if (['grid', 'tiles', 'checker'].includes(variant)) {
        const gap = variant === 'tiles' ? 116 : 92;
        for (let x = 0; x <= TEMPLATE_WIDTH; x += gap) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, TEMPLATE_HEIGHT);
            context.stroke();
        }
        for (let y = 0; y <= TEMPLATE_HEIGHT; y += gap) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(TEMPLATE_WIDTH, y);
            context.stroke();
        }
        return;
    }

    for (let index = -TEMPLATE_HEIGHT; index < TEMPLATE_WIDTH; index += 130) {
        context.beginPath();
        context.moveTo(index, 0);
        context.lineTo(index + TEMPLATE_HEIGHT, TEMPLATE_HEIGHT);
        context.stroke();
    }
};

const drawWavePattern = (context, template, variant) => {
    context.strokeStyle = hexToRgba(template.accent, variant === 'leaves' ? 0.34 : 0.22);
    context.lineWidth = 4;
    for (let row = 0; row < 5; row += 1) {
        const y = 260 + row * 460;
        context.beginPath();
        context.moveTo(-100, y);
        context.bezierCurveTo(380, y - 180, 650, y + 190, 1010, y);
        context.bezierCurveTo(1270, y - 150, 1500, y + 100, 1880, y - 80);
        context.stroke();
    }
};

const drawRadialPattern = (context, template) => {
    context.save();
    context.translate(TEMPLATE_WIDTH - 80, TEMPLATE_HEIGHT - 70);
    context.strokeStyle = hexToRgba(template.accent, 0.23);
    context.lineWidth = 6;
    for (let radius = 140; radius < 920; radius += 105) {
        context.beginPath();
        context.arc(0, 0, radius, Math.PI, Math.PI * 1.5);
        context.stroke();
    }
    context.restore();
};

const drawBackground = (context, template) => {
    const gradient = context.createLinearGradient(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    gradient.addColorStop(0, template.background[0]);
    gradient.addColorStop(1, template.background[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

    const dotPatterns = ['dots', 'confetti', 'stars', 'beans', 'petals', 'bubbles'];
    const linePatterns = ['grid', 'tiles', 'checker', 'chrome', 'receipt', 'line', 'steps'];
    const wavePatterns = ['waves', 'leaves', 'mist', 'roast'];

    if (dotPatterns.includes(template.pattern)) drawDotPattern(context, template, template.pattern);
    if (linePatterns.includes(template.pattern)) drawLinePattern(context, template, template.pattern);
    if (wavePatterns.includes(template.pattern)) drawWavePattern(context, template, template.pattern);
    if (['rays', 'sun', 'orbit', 'aura'].includes(template.pattern)) drawRadialPattern(context, template);

    context.strokeStyle = hexToRgba(template.accent, 0.66);
    context.lineWidth = template.layout === 'framed' ? 8 : 3;
    roundedRect(context, 65, 65, TEMPLATE_WIDTH - 130, TEMPLATE_HEIGHT - 130, template.layout === 'organic' ? 70 : 24);
    context.stroke();
};

const fitFontSize = (context, value, maxWidth, initialSize, minSize = 44) => {
    let size = initialSize;
    while (size > minSize) {
        context.font = `900 ${size}px Arial, sans-serif`;
        if (context.measureText(value).width <= maxWidth) break;
        size -= 4;
    }
    return size;
};

const drawTemplateContent = (context, image, template, cafeName, tableName) => {
    const centerX = TEMPLATE_WIDTH / 2;
    const displayCafeName = String(cafeName || 'YOUR CAFE')
        .trim()
        .toUpperCase();
    const displayTableName = String(tableName || 'TABLE')
        .trim()
        .toUpperCase();

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = template.muted;
    context.font = '800 32px Arial, sans-serif';
    context.letterSpacing = '8px';
    context.fillText('CAFE  •  KITCHEN  •  GOOD TIMES', centerX, 245);

    context.fillStyle = template.foreground;
    const cafeFontSize = fitFontSize(context, displayCafeName, TEMPLATE_WIDTH - 300, 126);
    context.font = `900 ${cafeFontSize}px Arial, sans-serif`;
    context.fillText(displayCafeName, centerX, 390);

    const tableWidth = Math.min(760, Math.max(350, context.measureText(displayTableName).width + 130));
    roundedRect(context, centerX - tableWidth / 2, 505, tableWidth, 108, 54);
    context.fillStyle = hexToRgba(template.accent, 0.18);
    context.fill();
    context.strokeStyle = hexToRgba(template.accent, 0.8);
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = template.foreground;
    context.font = '900 42px Arial, sans-serif';
    context.fillText(displayTableName, centerX, 560);

    const panelSize = 1160;
    const panelX = (TEMPLATE_WIDTH - panelSize) / 2;
    const panelY = 735;
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.22)';
    context.shadowBlur = 55;
    context.shadowOffsetY = 24;
    roundedRect(context, panelX, panelY, panelSize, panelSize, template.layout === 'arched' ? 180 : 70);
    context.fillStyle = template.qrPanel;
    context.fill();
    context.restore();

    context.strokeStyle = hexToRgba(template.accent, 0.72);
    context.lineWidth = 7;
    roundedRect(context, panelX, panelY, panelSize, panelSize, template.layout === 'arched' ? 180 : 70);
    context.stroke();

    const qrSize = 910;
    context.drawImage(image, centerX - qrSize / 2, panelY + (panelSize - qrSize) / 2, qrSize, qrSize);

    context.fillStyle = template.foreground;
    context.font = '900 65px Arial, sans-serif';
    context.fillText('SCAN. ORDER. ENJOY.', centerX, 2070);

    context.fillStyle = template.muted;
    context.font = '700 31px Arial, sans-serif';
    context.fillText('Point your camera at the QR code to open the menu', centerX, 2145);

    context.strokeStyle = hexToRgba(template.accent, 0.75);
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(centerX - 240, 2240);
    context.lineTo(centerX - 45, 2240);
    context.moveTo(centerX + 45, 2240);
    context.lineTo(centerX + 240, 2240);
    context.stroke();
    context.fillStyle = template.accent;
    context.beginPath();
    context.arc(centerX, 2240, 10, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = template.muted;
    context.font = '800 27px Arial, sans-serif';
    context.fillText('Powered by RC DINE', centerX, 2350);
};

/** Converts the rendered QRCodeSVG element to a PNG and triggers a browser download. */
export const downloadSvgQrAsPng = async (container, filename) => {
    const image = await svgToImage(getQrSvg(container), QR_EXPORT_SIZE);
    const canvas = document.createElement('canvas');
    canvas.width = QR_EXPORT_SIZE;
    canvas.height = QR_EXPORT_SIZE;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, QR_EXPORT_SIZE, QR_EXPORT_SIZE);
    context.drawImage(image, 0, 0, QR_EXPORT_SIZE, QR_EXPORT_SIZE);
    triggerCanvasDownload(canvas, filename);
};

export const downloadQrTemplateAsPng = async ({ container, filename, template, cafeName, tableName }) => {
    if (!template) throw new Error('Please select a QR template');

    const image = await svgToImage(getQrSvg(container), 1024);
    const canvas = document.createElement('canvas');
    canvas.width = TEMPLATE_WIDTH;
    canvas.height = TEMPLATE_HEIGHT;
    const context = canvas.getContext('2d');

    drawBackground(context, template);
    drawTemplateContent(context, image, template, cafeName, tableName);
    triggerCanvasDownload(canvas, filename);
};
