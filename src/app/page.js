// src/app/page.js (for Next.js 13+ with the app directory structure)
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles/Home.module.css';
import highQualityImg from "../images/high-quality.webp"
import easyToUse from "../images/easytouse.jpg"
import fastProcessing from "../images/fastProcessing.jpg"

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>Video to Dataset Generator</h1>
        <p className={styles.subtitle}>
          Easily convert videos into image datasets for machine learning and AI applications.
        </p>
        <Link href="/dataset-generator">
          <button className={styles.ctaButton}>Get Started</button>
        </Link>
      </header>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2>Why use our Dataset Generator?</h2>
        <div className={styles.features}>
          <div className={styles.feature}>
            <Image
              src={fastProcessing}
              alt="Fast Processing"
              width={80}
              height={80}
            />
            <h3>Fast Processing</h3>
            <p>Convert videos to datasets quickly with our optimized algorithms.</p>
          </div>
          <div className={styles.feature}>
            <Image
              src={easyToUse}
              alt="Easy to Use"
              width={80}
              height={80}
            />
            <h3>Easy to Use</h3>
            <p>Simple interface, no technical skills required.</p>
          </div>
          <div className={styles.feature}>
            <Image
              src={highQualityImg}
              alt="High Quality"
              width={80}
              height={80}
            />
            <h3>High Quality</h3>
            <p>Extract frames in high resolution to maintain the integrity of your data.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.howItWorks}>
        <h2>How it Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <h3>1. Upload Video</h3>
            <p>Select a video from your computer to begin converting.</p>
          </div>
          <div className={styles.step}>
            <h3>2. Extract Frames</h3>
            <p>Our system extracts frames from your video and generates a zip file.</p>
          </div>
          <div className={styles.step}>
            <h3>3. Download Dataset</h3>
            <p>Download your image dataset in one click.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Dataset Generator. All rights reserved.</p>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
