// pages/index.js (Next.js app)
'use client'; // Ensure this runs in the client

import { useState, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styles from "../styles/VideoToImageConverter.module.css";

const VideoToImageConverter = () => {
    const [video, setVideo] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [debug, setDebug] = useState("");
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    const addDebugInfo = (info) => {
        setDebug((prev) => prev + info + "\n");
    };

    const handleVideoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setVideo(file);
            setError(null);
            setFileInfo({
                name: file.name,
                type: file.type,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            });
            setVideoInfo(null);
            setDebug("");
            addDebugInfo(`File selected: ${file.name}`);
        } else {
            setError("No file selected");
            setFileInfo(null);
            setVideoInfo(null);
            setDebug("");
        }
    };

    const checkVideoCompatibility = () => {
        const video = videoRef.current;
        if (video) {
            const videoInfo = {
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration,
                canPlayType: {
                    mp4: video.canPlayType("video/mp4"),
                    webm: video.canPlayType("video/webm"),
                    ogg: video.canPlayType("video/ogg"),
                },
            };
            setVideoInfo(videoInfo);
            addDebugInfo(`Video info: ${JSON.stringify(videoInfo)}`);

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                setError(
                    "The video dimensions could not be determined. The file may be corrupted or use an unsupported codec."
                );
                return false;
            }
            if (video.duration === Infinity || isNaN(video.duration)) {
                setError(
                    "The video duration could not be determined. The file may be corrupted or use an unsupported codec."
                );
                return false;
            }
            if (
                video.canPlayType("video/mp4") === "" &&
                video.canPlayType("video/webm") === "" &&
                video.canPlayType("video/ogg") === ""
            ) {
                setError(
                    "This video format is not supported by your browser. Try converting it to MP4, WebM, or Ogg format."
                );
                return false;
            }
        }
        return true;
    };

    const testFrameExtraction = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        video.currentTime = 0;
        return new Promise((resolve, reject) => {
            video.onseeked = () => {
                try {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    if (imageData.data.some((channel) => channel !== 0)) {
                        addDebugInfo("Successfully extracted a frame");
                        resolve();
                    } else {
                        reject(new Error("Extracted frame is blank"));
                    }
                } catch (err) {
                    reject(err);
                }
            };
        });
    };

    const extractFrames = async () => {
        if (!video) {
            setError("Please upload a video first.");
            return;
        }

        setError(null);
        setProgress(0);
        addDebugInfo("Starting frame extraction process");

        const videoElement = videoRef.current;
        videoElement.src = URL.createObjectURL(video);

        videoElement.onerror = (e) => {
            console.error("Video error:", e);
            addDebugInfo(
                `Video error: ${e.target.error ? e.target.error.message : "Unknown error"
                }`
            );
            setError(
                `Error loading video: ${e.target.error ? e.target.error.message : "Unknown error"
                }`
            );
        };

        try {
            await new Promise((resolve, reject) => {
                videoElement.onloadedmetadata = () => {
                    addDebugInfo("Video metadata loaded");

                    // Set canvas dimensions to match the video resolution
                    const canvas = canvasRef.current;
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;

                    if (checkVideoCompatibility()) {
                        resolve();
                    } else {
                        reject(new Error("Video compatibility check failed"));
                    }
                };
                videoElement.onerror = (e) =>
                    reject(
                        new Error(e.target.error ? e.target.error.message : "Unknown error")
                    );
            });

            await testFrameExtraction();
        } catch (err) {
            console.error("Video processing error:", err);
            addDebugInfo(`Video processing error: ${err.message}`);
            setError(
                `Error processing video: ${err.message}. Please try a different file or convert to a widely supported format like H.264 MP4.`
            );
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const zip = new JSZip();

        const totalFrames = Math.floor(videoElement.duration * 30); // Assuming 30 fps
        let currentFrame = 0;

        const extractFrame = () => {
            if (currentFrame >= totalFrames) {
                addDebugInfo("Frame extraction complete. Generating zip file.");
                zip
                    .generateAsync({ type: "blob" })
                    .then((content) => {
                        saveAs(content, "image_dataset.zip");
                        setProgress(100);
                        addDebugInfo("Zip file generated and download initiated.");
                    })
                    .catch((err) => {
                        console.error("Zip creation error:", err);
                        addDebugInfo(`Zip creation error: ${err.message}`);
                        setError("Error creating zip file. Please try again.");
                    });
                return;
            }

            videoElement.currentTime = currentFrame / 30;
            videoElement.onseeked = () => {
                try {
                    // Ensure the drawn frame matches the original video dimensions
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        zip.file(`frame_${currentFrame}.png`, blob);
                        currentFrame++;
                        setProgress((currentFrame / totalFrames) * 100);
                        extractFrame();
                    }, "image/png");
                } catch (err) {
                    console.error("Frame processing error:", err);
                    addDebugInfo(`Frame processing error: ${err.message}`);
                    setError("Error processing video frame. The video may be corrupted.");
                }
            };
        };

        extractFrame();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Video to Image Dataset Converter</h1>
            <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className={styles.inputFile}
            />
            {fileInfo && (
                <div className={styles.fileInfo}>
                    <p className="font-semibold">File: {fileInfo.name}</p>
                    <p>Type: {fileInfo.type}</p>
                    <p>Size: {fileInfo.size}</p>
                </div>
            )}
            {videoInfo && (
                <div className={styles.videoInfo}>
                    <p className="font-semibold">Video Information:</p>
                    <ul className={styles.infoList}>
                        <li>Width: {videoInfo.width}px</li>
                        <li>Height: {videoInfo.height}px</li>
                        <li>Duration: {videoInfo.duration.toFixed(2)}s</li>
                    </ul>
                </div>
            )}

            <button
                onClick={extractFrames}
                disabled={!video}
                className={styles.convertButton}
            >
                Convert to Image Dataset
            </button>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {progress > 0 && (
                <div className={styles.progressBar}>
                    <div className={styles.progressBg}>
                        <div
                            className={styles.progress}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-center          ">
                        {progress.toFixed(2)}% Complete
                    </p>
                </div>
            )}
            <div className={styles.debug}>
                <h3 className={styles.debugHeader}>Debug Information</h3>
                <textarea
                    readOnly
                    className={styles.debugTextarea}
                    value={debug}
                    rows={10}
                />
            </div>
            <video ref={videoRef} className={styles.hidden} />
            <canvas ref={canvasRef} className={styles.hidden} />
        </div>
    );
};

export default VideoToImageConverter;

