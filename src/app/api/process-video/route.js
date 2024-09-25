// src/app/api/process-video/route.js
import JSZip from 'jszip';
import { createCanvas } from 'canvas';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false, // Disable the default body parser
    },
};

// Helper function to parse form data
const parseFormData = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

export async function POST(req) {
    try {
        const { files } = await parseFormData(req);
        const videoFile = files.video.filepath;

        const zip = new JSZip();
        const frameCount = 10;
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');

        for (let i = 0; i < frameCount; i++) {
            ctx.fillStyle = `rgb(${i * 25}, ${i * 15}, 200)`;
            ctx.fillRect(0, 0, 640, 480);
            const buffer = canvas.toBuffer('image/png');
            zip.file(`frame_${i}.png`, buffer);
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        return new Response(zipContent, {
            headers: {
                'Content-Disposition': 'attachment; filename=image_dataset.zip',
                'Content-Type': 'application/zip',
            },
        });
    } catch (err) {
        console.error('Error processing video:', err);
        return new Response(JSON.stringify({ error: 'Error processing video' }), { status: 500 });
    }
}

export async function GET() {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
