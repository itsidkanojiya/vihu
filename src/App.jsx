import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL_FRAMES = 71;
const eventCards = [
  {
    title: "જવારા ની સ્થાપના",
    value: "તા.૨૨/૦૩/૨૦૨૬ રવિવાર\nસવારે ૧૦:૦૦ કલાકે",
  },
  {
    title: "માતાજીની પલ્લી",
    value: "તા.૨૬/૦૩/૨૦૨૬ ગુરુવાર\nસાંજે ૬:૦૦ કલાકે",
  },
  { title: "લઘુ-રુદ્ર યજ્ઞ", value: "તા.૩૦/૦૩/૨૦૨૬ સોમવાર\nસવારે ૮:૦૦ કલાકે" },
  {
    title: "શ્ર્રી ફળ હોમ, લઘુરુદ્ર યજ્ઞ આરતી",
    value: "તા.૩૦/૦૩/૨૦૨૬ સોમવાર\nસાંજે ૫:૦૦ કલાકે",
  },
  {
    title: "જવારા વળાવવાના",
    value: "તા.૩૧/૦૩/૨૦૨૬ ગુરુવાર\nસવારે ૯:૦૦ કલાકે",
  },
  {
    title: "ચૌલક્રિયા (બાબરી)",
    value: "તા.૩૧/૦૩/૨૦૨૬ મંગળવાર\nસવારે ૧૧:૦૦ કલાકે",
  },
  { title: "સ્વરુચી ભોજન", value: "તા.૩૧/૦૩/૨૦૨૬ મંગળવાર\nબપોરે ૧૨:૦૦ કલાકે" },
];

const contactNumbers = ["9574663819", "7359783819"];

/** frame 1 → frame_00_delay-0.111s.webp … frame 71 → frame_70_delay-0.111s.webp */
const frameUrl = (frame) =>
  `/frames/frame_${String(frame - 1).padStart(2, "0")}_delay-0.111s.webp`;

gsap.registerPlugin(ScrollTrigger);
ion;

function App() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const frameState = useRef({ current: 1, target: 1 });
  const rafRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const drawFrame = (frame) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frame - 1];
    if (!canvas || !image || !image.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    // object-fit: cover — fills canvas width/height; crops overflow (no side letterboxing on mobile)
    const ratio = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawFrame(Math.round(frameState.current.current));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    let loaded = 0;
    const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);
    const framePromises = frames.map((frame) => {
      const image = new Image();
      image.decoding = "async";
      image.src = frameUrl(frame);

      return new Promise((resolve) => {
        image.onload = () => {
          loaded += 1;
          setLoadingProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
          resolve(image);
        };
        image.onerror = () => {
          loaded += 1;
          setLoadingProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
          resolve(null);
        };
      });
    });

    Promise.all(framePromises).then((loadedImages) => {
      imagesRef.current = loadedImages;
      setIsLoaded(true);
      drawFrame(1);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded || !heroRef.current) return undefined;

    const animateToTarget = () => {
      const state = frameState.current;
      const delta = state.target - state.current;
      state.current += delta * 0.15;

      if (Math.abs(delta) < 0.2) {
        state.current = state.target;
      }

      drawFrame(Math.max(1, Math.min(TOTAL_FRAMES, Math.round(state.current))));

      if (Math.abs(state.target - state.current) > 0.01) {
        rafRef.current = requestAnimationFrame(animateToTarget);
      } else {
        rafRef.current = null;
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "+=2600",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        frameState.current.target =
          1 + Math.round(self.progress * (TOTAL_FRAMES - 1));
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(animateToTarget);
        }
      },
    });

    const revealItems = gsap.utils.toArray(".reveal");
    revealItems.forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            once: true,
          },
        },
      );
    });

    return () => {
      trigger.kill();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ScrollTrigger.getAll().forEach((instance) => instance.kill());
    };
  }, [isLoaded]);

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `ચિ. વિહાન સિંહ ની ચૌલક્રિયા (બાબરી) માટે આમંત્રણ\n${window.location.href}`,
  )}`;
  const mapCoordinates = "22.442706,73.155714";
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapCoordinates)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapCoordinates)}&z=16&output=embed`;

  return (
    <main className="bg-cream text-stone-800">
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 md:px-4"
      >
        <div className="absolute inset-0 gold-pattern opacity-30" />
        <div className="reveal relative z-10 mb-6 w-full px-4 text-center font-gujarati text-maroon">
          <p className="text-xl md:text-2xl">|| શ્રી યામુંડા માં ||</p>
          <p className="mt-1 text-xl md:text-2xl">|| શ્રી ગણેશાય નમઃ ||</p>
          <p className="mt-1 text-xl md:text-2xl">|| જય શ્રી મહોદેવી માં ||</p>
        </div>

        {/* Mobile: full viewport width canvas; md+: max width + rounded corners */}
        <div className="relative z-10 w-full md:mx-auto md:max-w-5xl">
          <canvas
            ref={canvasRef}
            className="h-[min(58vh,520px)] w-full border-y border-gold/70 bg-white/70 shadow-xl md:h-[70vh] md:rounded-3xl md:border md:border-gold/70"
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 md:rounded-3xl">
              <p className="font-gujarati text-lg text-maroon">
                ફ્રેમ લોડ થઈ રહી છે... {loadingProgress}%
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 z-10 animate-bounce text-sm text-maroon">
          Scroll Down
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="reveal rounded-3xl border border-gold/70 bg-white/70 p-6 shadow-lg md:p-10">
          <p className="font-gujarati text-xl leading-relaxed text-maroon md:text-2xl">
            શ્રીમાન/શ્રીમતી ને જય માતાજી
          </p>
          <p className="mt-4 font-gujarati text-lg leading-relaxed">
            અમોને આનંદ સાથે જણાવવાનું કે અમારા વહાલા પુત્રની ચૌલક્રિયા પ્રસંગે
            આપ તથા આપના પરિવારને સહર્ષ પધારવા હાર્દિક આમંત્રણ.
          </p>
          <h2 className="mt-6 font-gujarati text-3xl text-red-700 md:text-5xl">
            ચિ. વિહાન સિંહ ની ચૌલક્રિયા (બાબરી)
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <h3 className="reveal mb-6 text-center font-gujarati text-3xl text-maroon md:text-4xl">
          માંગલિક પ્રસંગો
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventCards.map((card) => (
            <article
              key={card.title}
              className="reveal rounded-2xl border-2 border-gold bg-white/80 p-5 shadow-md transition-transform duration-300 hover:-translate-y-1"
            >
              <h4 className="font-gujarati text-2xl text-maroon">
                {card.title}
              </h4>
              <p className="mt-2 whitespace-pre-line font-gujarati text-lg leading-relaxed text-stone-700">
                {card.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <div className="reveal rounded-3xl border border-gold/70 bg-white/80 p-6 shadow-md">
          <h3 className="font-gujarati text-3xl text-maroon">સંપર્ક</h3>
          <ul className="mt-4 space-y-2 font-gujarati text-lg text-stone-700">
            {contactNumbers.map((number) => (
              <li key={number}>{number}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <div className="reveal rounded-3xl border border-gold bg-maroon p-8 text-center text-cream shadow-xl">
          <h3 className="font-gujarati text-3xl md:text-4xl">શુભ સ્થળ</h3>
          <p className="mt-4 font-gujarati text-2xl md:text-3xl">
            શ્રી વેરાઈ માતાજી વાળું ફળિયું, વાસણા-કોતરીયા જી. વડોદરા
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold/60 bg-cream/90 p-2">
            <iframe
              title="Google Map Location"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full rounded-xl md:h-96"
            />
          </div>
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full border border-gold bg-cream px-6 py-3 font-semibold text-maroon transition hover:bg-yellow-100"
          >
            Google Map ખોલો
          </a>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-maroon transition hover:bg-yellow-300 md:mt-6"
          >
            WhatsApp પર શેર કરો
          </a>
        </div>
      </section>
    </main>
  );
}

export default App;
