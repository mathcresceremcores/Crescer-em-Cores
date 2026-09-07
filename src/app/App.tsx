import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import logoImg from "@/imports/logo.webp";
import leafImg from "@/imports/leaf.png";
import leafImg2 from "@/imports/leaf2.png";
import handprintImg from "@/imports/handprint.webp";
import jacquelineImg from "@/imports/jacqueline.jpeg";
import leafDropImg from "@/imports/leaf-drop.png";
import sensoryAreiasImg from "@/imports/sensory-areias.jpg";
import sensoryArrozImg from "@/imports/sensory-arroz.jpg";
import sensoryMassinhaImg from "@/imports/sensory-massinha.jpg";
import sensoryDinoImg from "@/imports/sensory-dino.jpeg";
import sensoryCriancaDinoImg from "@/imports/sensory-crianca-dino.jpeg";
import sensoryTorreImg from "@/imports/sensory-torre.webp";
import cozinhaNoJardimImg from "@/imports/cozinha-no-jardim.webp";
import brincarLivreImg from "@/imports/brincar-livre.jpg";
import experienciasTematicasImg from "@/imports/experiencias-tematicas.jpg";
import paintSplashImg from "@/imports/paint-splash.png";
import paintCloudImg from "@/imports/paint-cloud.png";
import {
  MapPin,
  Clock,
  Calendar,
  Instagram,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Search,
  Star,
  Heart,
} from "lucide-react";

// ── types ──────────────────────────────────────────────────────────────────

type Workshop = {
  id: string;
  date: string;
  time: string;
  location: string;
  address: string;
  spots: number;
  theme: string;
  color: string;
};

type Testimonial = {
  id: string;
  name: string;
  email: string;
  text: string;
  stars: number;
  approved?: boolean;
  hidden?: boolean;
};

type CatalogItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  imagePath: string;
  actionLabel: string;
};

type CatalogVisibility = {
  products: boolean;
  ebooks: boolean;
};

// ── seed data ──────────────────────────────────────────────────────────────

const SEED_WORKSHOPS: Workshop[] = [
  {
    id: "1",
    date: "2026-07-28",
    time: "10:00",
    location: "Espaço Semente – Pinheiros",
    address: "Rua Teodoro Sampaio, 1234 – São Paulo",
    spots: 8,
    theme: "Exploração Tátil com Massinha Natural",
    color: "#e89349",
  },
  {
    id: "2",
    date: "2026-07-30",
    time: "09:30",
    location: "Casa da Criança – Vila Madalena",
    address: "Rua Purpurina, 456 – São Paulo",
    spots: 6,
    theme: "Tintas Comestíveis e Sabores",
    color: "#db0e54",
  },
  {
    id: "3",
    date: "2026-08-02",
    time: "10:00",
    location: "Ateliê Broto – Moema",
    address: "Av. Ibirapuera, 789 – São Paulo",
    spots: 10,
    theme: "Som, Movimento e Ritmo",
    color: "#5ea85b",
  },
];

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Mariana S.",
    email: "mariana@example.com",
    text: "Minha filha de 1 ano amou! Ficou completamente encantada com a massinha colorida. Voltaremos com certeza!",
    stars: 5,
  },
  {
    id: "2",
    name: "Rafael e Camila",
    email: "rafael.camila@example.com",
    text: "Experiência incrível. A Crescer em Cores tem um cuidado imenso com cada detalhe. Recomendo de olhos fechados.",
    stars: 5,
  },
  {
    id: "3",
    name: "Letícia M.",
    text: "Ambiente acolhedor, materiais de qualidade e uma proposta muito especial. Nosso bebê adorou cada momento!",
    stars: 5,
  },
];

const COLORS = ["#db0e54", "#e89349", "#5ea85b", "#5aaec8", "#735273", "#f09cb4"];
const PDF_PALETTE = ["#db0e54", "#5ea85b", "#e89349", "#735273", "#5aaec8", "#f09cb4"];
const TESTIMONIAL_COOLDOWN_MS = 30_000;
const LAST_TESTIMONIAL_KEY = "crescer-last-testimonial-at";
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCK_MS = 60_000;

const EMPTY_CATALOG_ITEM: Omit<CatalogItem, "id"> = {
  title: "",
  description: "",
  price: "",
  image: "",
  imagePath: "",
  actionLabel: "",
};

const DEFAULT_CATALOG_VISIBILITY: CatalogVisibility = {
  products: true,
  ebooks: true,
};

const BLANK: Omit<Workshop, "id"> = {
  date: "",
  time: "",
  location: "",
  address: "",
  spots: 8,
  theme: "",
  color: COLORS[0],
};

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const MOJIBAKE_REPLACEMENTS: Array<[string, string]> = [
  ["ðŸ‘¨â€ðŸ‘©â€ðŸ‘§", "👨‍👩‍👧"],
  ["ðŸ–ï¸", "🖐️"],
  ["ðŸ›¡ï¸", "🛡️"],
  ["â¤ï¸", "❤️"],
  ["ðŸ§ ", "🧠"],
  ["ðŸ’ž", "💞"],
  ["ðŸ’¬", "💬"],
  ["ðŸŽ¨", "🎨"],
  ["ðŸŒ¿", "🌿"],
  ["ðŸŒˆ", "🌈"],
  ["ðŸ‘", "👐"],
  ["ðŸ§’", "🧒"],
  ["ðŸ˜Š", "😊"],
  ["âœ¨", "✨"],
  ["â­", "⭐"],
  ["â˜…", "★"],
  ["Ã¡", "á"],
  ["Ã ", "à"],
  ["Ã¢", "â"],
  ["Ã£", "ã"],
  ["Ã©", "é"],
  ["Ãª", "ê"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ã´", "ô"],
  ["Ãµ", "õ"],
  ["Ãº", "ú"],
  ["Ã§", "ç"],
  ["Ã", "Á"],
  ["Ã€", "À"],
  ["Ã‚", "Â"],
  ["Ãƒ", "Ã"],
  ["Ã‰", "É"],
  ["ÃŠ", "Ê"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ã”", "Ô"],
  ["Ã•", "Õ"],
  ["Ãš", "Ú"],
  ["Ã‡", "Ç"],
  ["â€“", "–"],
  ["â€”", "—"],
  ["â€¢", "•"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["â€˜", "‘"],
  ["â€™", "’"],
];

function repairTextEncoding(value: string) {
  return MOJIBAKE_REPLACEMENTS.reduce(
    (repaired, [broken, correct]) => repaired.split(broken).join(correct),
    value,
  );
}

function repairStoredEncoding<T>(value: T): T {
  if (typeof value === "string") return repairTextEncoding(value) as T;
  if (Array.isArray(value)) return value.map(repairStoredEncoding) as T;

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, repairStoredEncoding(item)]),
    ) as T;
  }

  return value;
}

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? repairStoredEncoding(JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function createCatalogId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `catalog-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeCatalogRow(row: any): CatalogItem {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    price: String(row.price || ""),
    image: String(row.image_url || ""),
    imagePath: String(row.image_path || ""),
    actionLabel: String(row.action_label || ""),
  };
}

function formatCatalogPrice(value: string) {
  const cleaned = cleanSingleLine(value, 40);
  if (!cleaned) return "";
  if (cleaned.toLocaleLowerCase() === "gratuito") return "Gratuito";

  const numericValue = cleaned
    .replace(/^r\$\s*/i, "")
    .replace(/\s/g, "");
  const separators = [...numericValue.matchAll(/[,.]/g)];
  const lastSeparator = separators.at(-1);
  const hasDecimalPart = Boolean(lastSeparator
    && numericValue.slice(lastSeparator.index! + 1).replace(/\D/g, "").length <= 2);
  const decimalPart = hasDecimalPart && lastSeparator
    ? numericValue.slice(lastSeparator.index! + 1).replace(/\D/g, "").padEnd(2, "0")
    : "00";
  const wholePart = (hasDecimalPart && lastSeparator
    ? numericValue.slice(0, lastSeparator.index)
    : numericValue
  ).replace(/\D/g, "");
  if (!wholePart) return cleaned;

  const amount = Number(`${wholePart}.${decimalPart}`);
  if (!Number.isFinite(amount)) return cleaned;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount).replace(/\u00a0/g, " ");
}

function getCatalogImageUrl(item: CatalogItem) {
  if (item.imagePath) {
    return supabase.storage.from("catalog-images").getPublicUrl(item.imagePath).data.publicUrl;
  }
  return item.image;
}

function CatalogImage({ item, isEbook, className }: { item: CatalogItem; isEbook: boolean; className: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getCatalogImageUrl(item);

  useEffect(() => setFailed(false), [imageUrl]);

  if (imageUrl && !failed) {
    return <img src={imageUrl} alt={item.title} className={className} onError={() => setFailed(true)} />;
  }

  return <div className={`flex items-center justify-center bg-gradient-to-br from-[#f6e2c2] via-[#f8edf7] to-[#e5f3fb] text-4xl ${className}`}>{isEbook ? "📖" : "🎁"}</div>;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file: File) {
  return new Promise<{ blob: Blob; dataUrl: string }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Não foi possível preparar a imagem."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          reject(new Error("Não foi possível comprimir a imagem."));
          return;
        }
        readImageFile(new File([blob], file.name, { type: "image/webp" }))
          .then((dataUrl) => resolve({ blob, dataUrl }))
          .catch(reject);
      }, "image/webp", 0.82);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível carregar a imagem."));
    };
    image.src = objectUrl;
  });
}

function cleanSingleLine(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMultiline(value: string, maxLength: number) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value) && value.length <= 120;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]}, ${d} de ${MONTHS[m - 1]}`;
}

// ── Paint texture splatters (SVG, scattered per section) ───────────────────

const SPLATTERS = [
  // top-left blob
  { cx: 8, cy: 12, r: 7, color: "#5aaec8", opacity: 0.18, rotate: -20 },
  { cx: 92, cy: 8, r: 5, color: "#db0e54", opacity: 0.15, rotate: 30 },
  { cx: 50, cy: 95, r: 6, color: "#5ea85b", opacity: 0.14, rotate: 10 },
  { cx: 80, cy: 50, r: 4, color: "#e89349", opacity: 0.18, rotate: -15 },
];

function PaintTexture({
  colors = ["#5aaec8", "#db0e54", "#e89349", "#5ea85b", "#735273", "#db0e54"],
  count = 8,
  className = "",
}: {
  colors?: string[];
  count?: number;
  className?: string;
}) {
  // Deterministic positions based on index to avoid hydration issues
  const spots = Array.from({ length: count }, (_, i) => ({
    x: ((i * 137.5) % 100),
    y: ((i * 97.3 + 23) % 100),
    r: 20 + ((i * 47) % 60),
    color: colors[i % colors.length],
    opacity: 0.07 + ((i * 0.013) % 0.08),
    skew: (i % 2 === 0 ? 1 : -1) * ((i * 7) % 18),
  }));

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {spots.map((s, i) => (
        <ellipse
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          rx={s.r}
          ry={s.r * 0.65}
          fill={s.color}
          opacity={s.opacity}
          transform={`rotate(${s.skew}, ${s.x * 4}, ${s.y * 4})`}
        />
      ))}
      {/* handprint silhouettes scattered */}
      {[
        { x: "5%", y: "70%", size: 40, color: "#db0e54", opacity: 0.08, rot: -30 },
        { x: "88%", y: "20%", size: 36, color: "#5ea85b", opacity: 0.08, rot: 20 },
        { x: "55%", y: "88%", size: 32, color: "#735273", opacity: 0.07, rot: 10 },
      ].map((h, i) => (
        <text
          key={i}
          x={h.x}
          y={h.y}
          fontSize={h.size}
          fill={h.color}
          opacity={h.opacity}
          transform={`rotate(${h.rot})`}
          style={{
            userSelect: "none",
            fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif",
          }}
        >
          🖐
        </text>
      ))}
    </svg>
  );
}

type PaintMark = {
  image: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  size: string;
  rotate: number;
  opacity: number;
  showOnMobile: boolean;
};

const PAINT_MARKS: PaintMark[] = [
  {
    image: paintSplashImg,
    top: "-7%",
    left: "-5%",
    size: "clamp(8rem, 17vw, 17rem)",
    rotate: -18,
    opacity: 0.16,
    showOnMobile: true,
  },
  {
    image: paintCloudImg,
    top: "8%",
    right: "-7%",
    size: "clamp(11rem, 21vw, 23rem)",
    rotate: 14,
    opacity: 0.13,
    showOnMobile: true,
  },
  {
    image: paintSplashImg,
    top: "42%",
    left: "4%",
    size: "clamp(5rem, 9vw, 9rem)",
    rotate: 28,
    opacity: 0.14,
    showOnMobile: true,
  },
  {
    image: paintCloudImg,
    top: "60%",
    right: "4%",
    size: "clamp(7rem, 13vw, 14rem)",
    rotate: -24,
    opacity: 0.12,
    showOnMobile: true,
  },
  {
    image: paintSplashImg,
    bottom: "-10%",
    left: "34%",
    size: "clamp(10rem, 18vw, 19rem)",
    rotate: 42,
    opacity: 0.14,
    showOnMobile: false,
  },
  {
    image: paintCloudImg,
    top: "25%",
    left: "43%",
    size: "clamp(5rem, 8vw, 8rem)",
    rotate: -8,
    opacity: 0.1,
    showOnMobile: false,
  },
];

function PaintSplashBackdrop({ variant = 0 }: { variant?: number }) {
  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden="true">
      {PAINT_MARKS.map((mark, index) => {
        const maskImage = `url("${mark.image}")`;
        const flip = (index + variant) % 2 === 0 ? 1 : -1;

        return (
          <span
            key={`${variant}-${index}`}
            className={`absolute ${mark.showOnMobile ? "block" : "hidden sm:block"}`}
            style={{
              top: mark.top,
              right: mark.right,
              bottom: mark.bottom,
              left: mark.left,
              width: mark.size,
              aspectRatio: "1 / 1",
              backgroundColor: PDF_PALETTE[(index + variant) % PDF_PALETTE.length],
              opacity: mark.opacity,
              transform: `rotate(${mark.rotate + variant * 7}deg) scaleX(${flip})`,
              WebkitMaskImage: maskImage,
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskImage,
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Plant animation overlay ────────────────────────────────────────────────

function PlantOverlay() {
  const introScale = 5.2;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 md:z-[60] overflow-hidden">
      {/* Top-left plant — image_2.png */}
      <motion.img
        src={leafImg2}
        alt=""
        className="absolute top-16 sm:top-0 left-0 w-40 sm:w-56 md:w-72 origin-top-left"
        initial={{ scale: introScale, opacity: 0.95 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.35, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
      />

      {/* Top-right plant — image.png */}
      <motion.img
        src={leafImg}
        alt=""
        className="absolute top-16 sm:top-0 right-0 w-40 sm:w-56 md:w-72 origin-top-right"
        initial={{ scale: introScale, opacity: 0.95 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.35, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 }}
      />
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────




function FallingLeaf({
  left,
  start,
  end,
  drift,
  rotateFrom,
  rotateTo,
  className,
}: {
  left: string;
  start: number;
  end: number;
  drift: number;
  rotateFrom: number;
  rotateTo: number;
  className: string;
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [start, end], ["-16vh", "108vh"]);
  const x = useTransform(scrollYProgress, [start, (start + end) / 2, end], [-drift, drift, drift * -0.45]);
  const rotate = useTransform(scrollYProgress, [start, end], [rotateFrom, rotateTo]);
  const opacity = useTransform(scrollYProgress, [start, start + 0.018, end - 0.018, end], [0, 0.68, 0.68, 0]);

  return (
    <motion.img
      src={leafDropImg}
      alt=""
      className={`absolute top-0 ${className} drop-shadow-sm mix-blend-multiply`}
      style={{ left, y, x, rotate, opacity }}
    />
  );
}

function ScrollDecorations() {
  const { scrollYProgress } = useScroll();
  const handsOpacity = useTransform(scrollYProgress, [0.12, 0.65], [0, 0.13]);

  const handprints = [
    { left: "3%", top: "30%", rotate: -18, filter: "hue-rotate(285deg) saturate(1.8)", flip: true },
    { left: "85%", top: "36%", rotate: 16, filter: "hue-rotate(95deg) saturate(1.6)", flip: false },
    { left: "8%", top: "68%", rotate: 12, filter: "hue-rotate(210deg) saturate(1.5)", flip: false },
    { left: "80%", top: "76%", rotate: -22, filter: "hue-rotate(35deg) saturate(1.7)", flip: true },
  ];

  const leaves = [
    { left: "10%", start: 0.04, end: 0.15, drift: 16, rotateFrom: -35, rotateTo: 78, className: "w-4 md:w-8" },
    { left: "62%", start: 0.10, end: 0.22, drift: 20, rotateFrom: 18, rotateTo: -88, className: "w-5 md:w-9" },
    { left: "82%", start: 0.16, end: 0.28, drift: 14, rotateFrom: 30, rotateTo: -96, className: "w-4 md:w-7" },
    { left: "24%", start: 0.23, end: 0.35, drift: 22, rotateFrom: -18, rotateTo: 92, className: "w-5 md:w-8" },
    { left: "45%", start: 0.30, end: 0.42, drift: 16, rotateFrom: 16, rotateTo: -74, className: "w-4 md:w-9" },
    { left: "72%", start: 0.37, end: 0.49, drift: 24, rotateFrom: -28, rotateTo: 105, className: "w-5 md:w-10" },
    { left: "15%", start: 0.44, end: 0.56, drift: 18, rotateFrom: 25, rotateTo: -82, className: "w-4 md:w-8" },
    { left: "54%", start: 0.51, end: 0.63, drift: 21, rotateFrom: -32, rotateTo: 86, className: "w-5 md:w-9" },
    { left: "88%", start: 0.58, end: 0.70, drift: 15, rotateFrom: 20, rotateTo: -94, className: "w-4 md:w-7" },
    { left: "31%", start: 0.65, end: 0.77, drift: 23, rotateFrom: -24, rotateTo: 98, className: "w-5 md:w-9" },
    { left: "68%", start: 0.72, end: 0.84, drift: 17, rotateFrom: 34, rotateTo: -104, className: "w-4 md:w-8" },
    { left: "19%", start: 0.79, end: 0.91, drift: 19, rotateFrom: -30, rotateTo: 88, className: "w-5 md:w-9" },
    { left: "48%", start: 0.86, end: 0.98, drift: 24, rotateFrom: 15, rotateTo: -105, className: "w-4 md:w-8" },
    { left: "78%", start: 0.90, end: 1, drift: 18, rotateFrom: -22, rotateTo: 84, className: "w-5 md:w-10" },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[6] overflow-hidden" aria-hidden="true">
        {handprints.map((hand, index) => (
          <motion.img
            key={`hand-${index}`}
            src={handprintImg}
            alt=""
            className="absolute w-16 md:w-32 opacity-0 mix-blend-multiply"
            style={{
              left: hand.left,
              top: hand.top,
              opacity: handsOpacity,
              filter: hand.filter,
              transform: `${hand.flip ? "scaleX(-1)" : ""} rotate(${hand.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden" aria-hidden="true">
        {leaves.map((leaf, index) => (
          <FallingLeaf key={`falling-leaf-${index}`} {...leaf} />
        ))}
      </div>
    </>
  );
}

function Navbar({ catalogVisibility }: { catalogVisibility: CatalogVisibility }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Início", href: "#hero" },
    { label: "Sobre", href: "#sobre" },
    { label: "Quem Somos", href: "#quem-somos" },
    { label: "Agenda", href: "#agenda" },
    ...(catalogVisibility.products ? [{ label: "Produtos", href: "#produtos" }] : []),
    ...(catalogVisibility.ebooks ? [{ label: "E-books", href: "#ebooks" }] : []),
    { label: "Contato", href: "#contato" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2">
          <img src={logoImg} alt="Crescer em Cores" className="h-12 w-12 object-contain" />
          <span style={{ fontFamily: "'Baloo 2', cursive" }} className="text-lg font-bold text-[#db0e54] leading-tight hidden sm:block">
            Crescer em Cores
          </span>
        </a>
        <ul className="hidden md:flex gap-6">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                style={{ fontFamily: "'Nunito', sans-serif" }}
                className="text-[#532737] font-semibold hover:text-[#db0e54] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="https://wa.me/5511917455484"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 bg-[#25d366] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <WhatsAppIcon sx={{ fontSize: 14 }} /> WhatsApp
        </a>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[#532737]">
          {open ? <X size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: "'Nunito', sans-serif" }}
              className="rounded-xl px-3 py-2.5 text-[#532737] font-semibold hover:bg-[#fff8ef] hover:text-[#db0e54]"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}


function Hero() {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-5 sm:px-4 pt-20 pb-16 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #fff8ef 0%, #f6e2c2 50%, #f8edf7 100%)" }}>
      <PaintTexture count={10} colors={["#5aaec8", "#db0e54", "#e89349", "#5ea85b", "#735273"]} />
      <PaintSplashBackdrop variant={0} />
      <img src={handprintImg} alt="" className="absolute bottom-8 left-4 w-20 opacity-10 rotate-[-20deg] pointer-events-none select-none" />
      <img src={handprintImg} alt="" className="absolute top-24 right-6 w-16 opacity-10 rotate-[25deg] pointer-events-none select-none" style={{ filter: "hue-rotate(120deg)" }} />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
        <motion.img src={logoImg} alt="Crescer em Cores logo" className="w-80 h-80 sm:w-92 sm:h-92 object-contain drop-shadow-xl" initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 1.4 }} />
        <motion.h1 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#db0e54] leading-tight" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 1.6 }}>
          Crescer em Cores
        </motion.h1>
        <motion.p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-lg sm:text-xl text-[#735273] font-semibold max-w-md" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 1.75 }}>
          Oficinas sensoriais para primeira infância, bebês e crianças de 6 meses a 6 anos - experiências que estimulam, encantam e conectam.
        </motion.p>
        <motion.div className="flex w-full flex-col gap-3 justify-center mt-2 sm:w-auto sm:flex-row sm:flex-wrap" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 1.9 }}>
          <a href="#agenda" style={{ fontFamily: "'Baloo 2', cursive" }} className="w-full bg-[#db0e54] text-white px-6 sm:px-7 py-3 rounded-full text-base sm:text-lg font-bold shadow-lg hover:bg-[#bb3f4e] transition-all hover:scale-105 sm:w-auto">Ver Agenda</a>
        </motion.div>
      </div>
    </section>
  );
}

function RevealImage({ src, alt, className = "", delay = 0 }: { src: string; alt: string; className?: string; delay?: number }) {
  return (
    <motion.img src={src} alt={alt} className={`rounded-[2rem] object-cover shadow-lg border-4 border-white ${className}`} initial={{ opacity: 0, y: 70, scale: 0.94, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 5, scale: 1, filter: "blur(0px)" }} viewport={{ once: false, amount: 0.28 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }} />
  );
}

function About() {
  const accordionExperiences = [
    {
      icon: "🌿",
      title: "Cozinha no Jardim",
      description: [
        "Uma experiência de brincar livre, sensorial e cheia de descobertas.",
        "Convidamos as crianças a transformarem elementos da natureza em verdadeiras obras de imaginação. Folhas, flores, gravetos, sementes, terra, água e utensílios de cozinha tornam-se ingredientes para receitas inventadas, poções mágicas, bolos, sopas e chás preparados com criatividade e liberdade.",
        "Mais do que “cozinhar”, essa proposta convida a criança a explorar, experimentar, criar hipóteses, simbolizar e construir histórias a partir do contato com a natureza.",
      ],
      objectives: [
        "Estimular a imaginação e o faz de conta.",
        "Favorecer a autonomia e a criatividade.",
        "Ampliar as experiências sensoriais por meio de diferentes texturas, aromas e cores.",
        "Incentivar a exploração da natureza com respeito e curiosidade.",
        "Desenvolver habilidades sociais, linguagem, coordenação motora e resolução de problemas durante o brincar.",
      ],
      closing: "Na Cozinha no Jardim não existe receita certa. Existe tempo, liberdade e encantamento para que cada criança seja protagonista de suas próprias descobertas.",
      image: cozinhaNoJardimImg,
      imageAlt: "Cozinha no Jardim",
    },
    {
      icon: "🌈",
      title: "Brincar Heurístico",
      description: [
        "O brincar heurístico é uma experiência de exploração livre, na qual a criança investiga, manipula e descobre as possibilidades dos objetos por meio da curiosidade e da experimentação.",
        "Nesta proposta, oferecemos materiais não estruturados e de diferentes tamanhos, pesos, texturas, formas e sons, como colheres de madeira, argolas, rolhas, tecidos, pinhas, potes, tampas, bambus, cestos e outros elementos naturais e do cotidiano.",
        "Sem um jeito “certo” de brincar, cada criança cria suas próprias investigações: empilha, encaixa, enche, esvazia, compara, transporta, combina e transforma os objetos conforme seus interesses.",
      ],
      objectives: [
        "Estimular a curiosidade e a capacidade de investigação.",
        "Favorecer a autonomia e a livre escolha.",
        "Desenvolver a concentração e a atenção.",
        "Ampliar o raciocínio, a criatividade e a resolução de problemas.",
        "Fortalecer a coordenação motora fina e ampla.",
        "Incentivar descobertas por meio da experimentação e da exploração sensorial.",
      ],
      closing: "No brincar heurístico, organizamos um ambiente rico em possibilidades e acompanhamos a criança com um olhar atento e respeitoso, intervindo o mínimo possível para que ela seja protagonista de suas descobertas.",
      image: sensoryArrozImg,
      imageAlt: "Materiais para brincar heurístico",
    },
    {
      icon: "🪁",
      title: "Brincar Livre",
      description: [
        "O brincar livre é um convite para que a criança conduza sua própria experiência, seguindo seus interesses, curiosidades e necessidades. Sem roteiros, sem resultados esperados e sem a necessidade de um “jeito certo” de brincar.",
        "Em um ambiente preparado com materiais diversos e seguros, a criança escolhe como, com quem e por quanto tempo deseja brincar. É nesse espaço de liberdade que ela cria, imagina, experimenta, resolve problemas, estabelece relações e constrói aprendizagens significativas.",
        "Como adultos, temos o papel de observar, acolher e garantir um ambiente rico em possibilidades, seguro, respeitando o tempo e a autonomia de cada criança.",
      ],
      objectives: [
        "Promover a autonomia e o protagonismo infantil.",
        "Estimular a criatividade, a imaginação e a iniciativa.",
        "Favorecer a socialização e a resolução de conflitos de forma respeitosa.",
        "Desenvolver habilidades cognitivas, motoras, emocionais e sociais.",
        "Incentivar a curiosidade, a exploração e a confiança em si.",
        "Valorizar o brincar como linguagem fundamental da infância.",
      ],
      closing: "No brincar livre, cada escolha da criança é uma oportunidade de aprender, criar vínculos, expressar emoções e descobrir o mundo no seu próprio tempo.",
      image: brincarLivreImg,
      imageAlt: "Brincar Livre",
    },
    {
      icon: "🎨",
      title: "Experiências Temáticas",
      description: [
        "As experiências temáticas são convites para mergulhar em diferentes universos por meio do brincar, da imaginação e da exploração sensorial. Cada encontro é cuidadosamente planejado com um tema que desperta a curiosidade das crianças e amplia suas possibilidades de aprendizagem.",
        "A partir de cenários, materiais, histórias e elementos sensoriais, as crianças exploram livremente o ambiente, criam hipóteses, fazem descobertas e constroem conhecimentos de forma lúdica e significativa.",
        "As propostas podem abordar temas como natureza, fundo do mar, dinossauros, fazendinha, espaço, cores, estações do ano, culinária, arte, experiências científicas, entre muitos outros.",
      ],
      objectives: [
        "Despertar a curiosidade e o interesse por novos conhecimentos.",
        "Estimular a criatividade, a imaginação e o faz de conta.",
        "Favorecer a exploração sensorial e a aprendizagem por meio da experimentação.",
        "Desenvolver habilidades cognitivas, motoras, sociais e emocionais.",
        "Incentivar a linguagem, a resolução de problemas e a cooperação.",
        "Proporcionar vivências significativas que respeitem o tempo e o protagonismo de cada criança.",
      ],
      closing: "Cada tema é uma oportunidade para brincar, explorar, criar e aprender de forma prazerosa, transformando a curiosidade em descobertas e memórias afetivas.",
      image: experienciasTematicasImg,
      imageAlt: "Experiências Temáticas",
    },
  ];
  const [openExperience, setOpenExperience] = useState<number | null>(null);
  const [selectedExperienceImage, setSelectedExperienceImage] = useState<{ src: string; alt: string } | null>(null);
  const benefits = [
    { icon: "🖐️", title: "Coordenação motora", desc: "Movimentos livres e exploração de materiais." },
    { icon: "🧠", title: "Desenvolvimento cognitivo", desc: "Curiosidade, investigação e descobertas." },
    { icon: "💞", title: "Vínculo afetivo", desc: "Presença, acolhimento e segurança." },
    { icon: "👣", title: "Incentivo à autonomia", desc: "Poder de escolha, respeito ao tempo e independência." },
    { icon: "💬", title: "Estímulo da linguagem", desc: "Expressão, comunicação e nomeação." },
  ];
  const experiences = ["Cozinha no Jardim", "Brincar Heurístico", "Brincar Livre", "Experiências Temáticas"];
  return (
    <section id="sobre" className="py-16 sm:py-20 px-4 relative overflow-hidden bg-white">
      <PaintTexture count={6} colors={["#5aaec8", "#e89349", "#db0e54", "#5ea85b"]} className="opacity-80" />
      <PaintSplashBackdrop variant={1} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-[#f6e2c2] text-[#db0e54] px-4 py-1 rounded-full text-sm font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Sobre as oficinas</span>
          <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#532737]">{"Brincar livre, afeto e desenvolvimento integral"}</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-4 text-[#735273] text-lg max-w-2xl mx-auto">Experiências ricas por meio do brincar livre, respeitando o tempo da criança e fortalecendo autonomia, vínculo e desenvolvimento.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center mb-14">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <RevealImage src={sensoryTorreImg} alt="Crianca montando torre" className="h-44 sm:h-52 md:h-64" />
            <RevealImage src={sensoryMassinhaImg} alt="Massinhas naturais" className="h-44 sm:h-52 md:h-64 mt-4 sm:mt-8" delay={0.08} />
            <RevealImage src={sensoryDinoImg} alt="Brinquedos de dinossauros" className="h-44 sm:h-52 md:h-64" delay={0.12} />
            <RevealImage src={sensoryCriancaDinoImg} alt="Crianca brincando com dinossauros" className="h-44 sm:h-52 md:h-64 mt-4 sm:mt-8" delay={0.18} />
          </div>
          <motion.div className="rounded-[2rem] bg-[#fff8ef] border border-border shadow-sm p-5 sm:p-7" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.32 }} transition={{ duration: 0.7 }}>
            <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-2xl font-extrabold text-[#db0e54] mb-4">Vivências Sensoriais</h3>
            <div className="space-y-3">
              {accordionExperiences.map((item, index) => {
                const isOpen = openExperience === index;

                return (
                  <motion.div key={item.title} className="overflow-hidden rounded-2xl bg-white border border-border" initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.45, delay: index * 0.03 }}>
                    <button type="button" onClick={() => setOpenExperience(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff8ef]">
                      <span className="emoji">{item.icon}</span>
                      <span style={{ fontFamily: "'Nunito', sans-serif" }} className="flex-1 font-semibold text-[#532737]">{item.title}</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6e2c2] text-[#db0e54]">
                        <Plus size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                          <div className="border-t border-[#f0e4d7] px-4 pb-4 pt-3">
                            {item.image && (
                              <button type="button" onClick={() => setSelectedExperienceImage({ src: item.image, alt: item.imageAlt })} className="mb-4 block w-full cursor-zoom-in text-left" aria-label={`Ampliar imagem: ${item.imageAlt}`}>
                                <img src={item.image} alt={item.imageAlt} className="h-44 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.02] sm:h-52" />
                              </button>
                            )}
                            <div style={{ fontFamily: "'Nunito', sans-serif" }} className="space-y-3 text-sm leading-relaxed text-[#735273]">
                              {item.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                              <div>
                                <p className="font-extrabold text-[#532737]">Objetivos da proposta:</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                  {item.objectives.map((objective) => <li key={objective}>{objective}</li>)}
                                </ul>
                              </div>
                              <p className="font-semibold text-[#532737]">{item.closing}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          <motion.div className="hidden rounded-[2rem] bg-[#fff8ef] border border-border shadow-sm p-5 sm:p-7" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.32 }} transition={{ duration: 0.7 }}>
            <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-2xl font-extrabold text-[#db0e54] mb-4">Vivências Sensoriais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {experiences.map((item, index) => (
                <motion.div key={item} className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white border border-border" initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.45, delay: index * 0.03 }}>
                  <span className="emoji">{["🌿", "🌈", "🪁", "🎨"][index]}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif" }} className="font-semibold text-[#532737]">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benefits.map((b, i) => (
            <motion.div key={b.title} className="rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-sm border border-border" style={{ background: ["#fff8ef", "#eef8e8", "#eef7f7", "#f8edf7", "#fff4e8"][i] }} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.55, delay: i * 0.08 }}>
              <span className="emoji text-3xl">{b.icon}</span>
              <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#532737] text-lg">{b.title}</h3>
              <p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-[#735273] text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {selectedExperienceImage && (
            <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#532737]/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Imagem ampliada" onClick={() => setSelectedExperienceImage(null)}>
              <button type="button" onClick={() => setSelectedExperienceImage(null)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#db0e54] shadow-lg" aria-label="Fechar imagem">
                <X size={22} />
              </button>
              <motion.img src={selectedExperienceImage.src} alt={selectedExperienceImage.alt} className="max-h-[88vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(event) => event.stopPropagation()} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function QuemSomosSection() {
  const pillars = [
    { icon: "🧸", label: "Brincar como direito", color: "#db0e54", bg: "#fde8f0" },
    { icon: "🌱", label: "Desenvolvimento integral", color: "#3c9b35", bg: "#e9f8e4" },
    { icon: "⭐", label: "Protagonista infantil", color: "#e87316", bg: "#fff0df" },
    { icon: "🍃", label: "Contato com a natureza", color: "#27845f", bg: "#e5f6ef" },
    { icon: "💞", label: "Vínculo e afeto", color: "#735273", bg: "#f0e8f4" },
    { icon: "🌈", label: "Inclusão e respeito à diversidade", color: "#1478b8", bg: "#e5f3fb" },
    { icon: "🤝", label: "Acolhimento e escuta qualificada", color: "#b55a17", bg: "#fff0df" },
  ];
  return (
    <section id="quem-somos" className="py-16 sm:py-20 px-4 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #fff8ef 0%, #f6e2c2 52%, #f8edf7 100%)" }}>
      <PaintTexture count={7} colors={["#db0e54", "#5ea85b", "#e89349", "#735273"]} />
      <PaintSplashBackdrop variant={2} />
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-7 sm:gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -40, filter: "blur(8px)" }} whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="relative">
          <img src={jacquelineImg} alt="Jacqueline" className="w-full max-h-[460px] sm:max-h-[560px] object-cover rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-white" />
          <img src={leafDropImg} alt="" className="absolute -bottom-5 -right-4 w-20 rotate-12 drop-shadow-md" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.75 }} className="bg-white/85 backdrop-blur-sm border border-white rounded-[2rem] p-5 sm:p-7 md:p-9 shadow-xl">
          <span className="inline-block bg-[#f6e2c2] text-[#db0e54] px-4 py-1 rounded-full text-sm font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Quem Somos</span>
          <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#532737] mb-5">Quem sou eu?</h2>
          <div style={{ fontFamily: "'Nunito', sans-serif" }} className="space-y-4 text-[#735273] leading-relaxed">
            <p>Sou <strong className="text-[#532737]">Jacqueline</strong>, tenho 35 anos, <strong className="text-[#532737]">psicóloga</strong> dedicada à promoção dos direitos humanos e <strong className="text-[#532737]">especialista em aleitamento materno</strong>.</p>
            <p>Com duas décadas de atuação na área da infância e juventude, construí uma <strong className="text-[#532737]">trajetória marcada pelo cuidado, proteção e desenvolvimento integral</strong> de crianças e adolescentes.</p>
            <p>Além da minha atuação profissional, sou <strong className="text-[#532737]">mãe do Jorge</strong>, papel que fortalece ainda mais meu olhar sensível e comprometido com o bem-estar e o futuro das novas gerações.</p>
          </div>
          <div className="rounded-3xl bg-[#fff8ef] border border-border px-4 sm:px-6 py-5 mt-6">
            <p style={{ fontFamily: "'Baloo 2', cursive" }} className="text-2xl font-extrabold text-[#db0e54]">Minha missão</p>
            <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-3 text-[#735273] leading-relaxed">Minha missão é promover experiências de brincar que respeitem a infância em sua essência, <strong className="text-[#532737]">oferecendo ambientes acolhedores, criativos e seguros.</strong></p>
          </div>
          <div className="mt-7">
            <p style={{ fontFamily: "'Baloo 2', cursive" }} className="text-xl font-extrabold text-[#532737] mb-4">Meus pilares:</p>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pillars.map((pillar, index) => (
                <motion.div key={pillar.label} className="flex min-h-32 min-w-0 flex-col items-center justify-center text-center gap-2 rounded-3xl bg-white border border-border px-3 py-4 shadow-sm" initial={{ opacity: 0, y: 20, scale: 0.92 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.45, delay: index * 0.06 }}>
                  <span className="emoji w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 border-dashed" style={{ color: pillar.color, background: pillar.bg, borderColor: pillar.color }}>{pillar.icon}</span>
                  <span
                    style={{ fontFamily: "'Nunito', sans-serif", color: pillar.color }}
                    className={`max-w-full font-extrabold leading-snug text-balance break-normal hyphens-none [overflow-wrap:normal] [word-break:normal] ${
                      pillar.label === "Desenvolvimento integral" ? "text-[10px] tracking-[-0.02em]" : "text-xs"
                    }`}
                  >
                    {pillar.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AgendaSection({ workshops }: { workshops: Workshop[] }) {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const upcomingWorkshops = workshops
    .filter((workshop) => workshop.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const [showAllDays, setShowAllDays] = useState(false);
  const visibleWorkshops = showAllDays ? upcomingWorkshops : upcomingWorkshops.slice(0, 6);
  return (
    <section id="agenda" className="py-16 sm:py-20 px-4 relative overflow-hidden" style={{ background: "#fff8ef" }}>
      <PaintTexture count={7} colors={["#e89349", "#db0e54", "#5ea85b", "#5aaec8", "#735273"]} className="opacity-100" />
      <PaintSplashBackdrop variant={3} />
      <img src={leafImg2} alt="" className="absolute -bottom-6 right-0 w-48 opacity-15 pointer-events-none select-none" style={{ transform: "scaleX(-1)" }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#f6e2c2] text-[#db0e54] px-4 py-1 rounded-full text-sm font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Agenda</span>
          <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#532737]">Próximas Oficinas</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-3 text-[#735273] text-lg">Confira quando e onde acontecerão as próximas experiências!</p>
        </div>
        {upcomingWorkshops.length === 0 ? (
          <div className="text-center py-16 text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}><span className="emoji text-5xl">📅</span><p className="mt-4 text-lg font-semibold">Novas datas em breve!</p></div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWorkshops.map((w, index) => (
              <div key={w.id} className={`${!showAllDays && index >= 3 ? "hidden md:flex" : "flex"} flex-col bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow`}>
                <div className="h-2" style={{ background: w.color }} />
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full w-fit" style={{ fontFamily: "'Nunito', sans-serif", background: w.color + "22", color: w.color }}>OFICINA</span>
                  <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-xl font-bold text-[#532737] leading-tight">{w.theme}</h3>
                  <div className="flex flex-col gap-1.5 text-sm text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    <span className="flex items-center gap-1.5"><Calendar size={14} style={{ color: w.color }} />{formatDate(w.date)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} style={{ color: w.color }} />{w.time}h</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} style={{ color: w.color }} /><span><strong className="text-[#532737]">{w.location}</strong><br />{w.address}</span></span>
                  </div>
                  <div className="mt-auto pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {w.spots > 0 ? (
                      <span className="text-xs text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}><span className="emoji">🪑</span> {w.spots} vagas</span>
                    ) : (
                      <span className="rounded-full bg-[#fde8f0] px-3 py-1 text-xs font-extrabold text-[#db0e54]" style={{ fontFamily: "'Nunito', sans-serif" }}>Indisponível</span>
                    )}
                    {w.spots > 0 && (
                      <a href={`https://wa.me/5511917455484?text=Ol%C3%A1! Quero me inscrever na oficina \"${w.theme}\" no dia ${formatDate(w.date)}.`} target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm font-bold px-4 py-2 rounded-full text-white transition-all hover:scale-105 sm:w-auto sm:py-1.5" style={{ fontFamily: "'Baloo 2', cursive", background: w.color }}>Inscrever-se</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!showAllDays && upcomingWorkshops.length > 3 && (
            <button type="button" onClick={() => setShowAllDays(true)} className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-[#db0e54] px-5 py-2.5 font-bold text-[#db0e54] transition-colors hover:bg-[#db0e54] hover:text-white md:hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <ChevronDown size={18} /> Mostrar mais dias
            </button>
          )}
          {!showAllDays && upcomingWorkshops.length > 6 && (
            <button type="button" onClick={() => setShowAllDays(true)} className="mx-auto mt-8 hidden items-center gap-2 rounded-full border border-[#db0e54] px-5 py-2.5 font-bold text-[#db0e54] transition-colors hover:bg-[#db0e54] hover:text-white md:flex" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <ChevronDown size={18} /> Mostrar mais dias
            </button>
          )}
          {showAllDays && (
            <button type="button" onClick={() => setShowAllDays(false)} className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-[#735273] px-5 py-2.5 font-bold text-[#735273] transition-colors hover:bg-[#735273] hover:text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <ChevronDown size={18} className="rotate-180" /> Mostrar menos dias
            </button>
          )}
          </>
        )}
      </div>
    </section>
  );
}

function CatalogSection({ kind, items }: { kind: "products" | "ebooks"; items: CatalogItem[] }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const isEbook = kind === "ebooks";
  const filteredItems = items.filter((item) =>
    `${item.title} ${item.description} ${item.price}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim()),
  );
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 3);
  const title = isEbook ? "E-books" : "Produtos";
  const subtitle = isEbook
    ? "Conteúdo para transformar brincadeiras em descobertas."
    : "Conheça nossos produtos para continuar a experiência em casa.";

  return (
    <section id={isEbook ? "ebooks" : "produtos"} className="relative overflow-hidden bg-white px-4 py-16 sm:py-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full bg-[#f6e2c2] px-4 py-1 text-sm font-bold text-[#db0e54]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {title}
            </span>
            <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl font-extrabold text-[#532737] sm:text-4xl">{title}</h2>
            <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-2 max-w-xl text-base text-[#735273] sm:text-lg">{subtitle}</p>
          </div>
          {items.length > 0 && (
            <label className="relative block w-full sm:max-w-xs" aria-label={`Pesquisar em ${title.toLocaleLowerCase()}`}>
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#735273]" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setShowAll(false); }}
                placeholder={`Pesquisar ${isEbook ? "e-books" : "produtos"}`}
                className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-[#532737] outline-none transition focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </label>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#e5d5c4] bg-[#fff8ef] px-5 py-10 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <p className="font-semibold text-[#532737]">Novidades em breve.</p>
            <p className="mt-1 text-sm text-[#735273]">O admin poderá adicionar {isEbook ? "e-books" : "produtos"} por aqui.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="rounded-3xl bg-[#fff8ef] px-5 py-10 text-center text-sm text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}>Nenhum item encontrado.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-border bg-[#fff8ef] shadow-sm transition-transform hover:-translate-y-1">
                  <CatalogImage item={item} isEbook={isEbook} className="h-48 w-full object-cover sm:h-52" />
                  <div className="p-5">
                    <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-xl font-extrabold text-[#532737]">{item.title}</h3>
                    {item.description && <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#735273]">{item.description}</p>}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span style={{ fontFamily: "'Nunito', sans-serif" }} className="font-extrabold text-[#db0e54]">{formatCatalogPrice(item.price) || "A consultar"}</span>
                      <a
                        href={`https://wa.me/5511917455484?text=${encodeURIComponent(`Olá! Tenho interesse em ${isEbook ? "o e-book" : "o produto"} \"${item.title}\".`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#db0e54] px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-[#bb3f4e]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        Adquirir
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredItems.length > 3 && (
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => setShowAll((value) => !value)} className="flex items-center gap-2 rounded-full border-2 border-[#db0e54] px-6 py-2.5 text-sm font-bold text-[#db0e54] transition hover:bg-[#db0e54] hover:text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {showAll ? "Mostrar menos" : isEbook ? "Ver todos os e-books" : "Ver todos os produtos"}
                  <ChevronDown size={17} className={showAll ? "rotate-180" : ""} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function CatalogManager({
  products,
  setProducts,
  ebooks,
  setEbooks,
  visibility,
  setVisibility,
}: {
  products: CatalogItem[];
  setProducts: Dispatch<SetStateAction<CatalogItem[]>>;
  ebooks: CatalogItem[];
  setEbooks: Dispatch<SetStateAction<CatalogItem[]>>;
  visibility: CatalogVisibility;
  setVisibility: Dispatch<SetStateAction<CatalogVisibility>>;
}) {
  const [catalogType, setCatalogType] = useState<"products" | "ebooks">("products");
  const [form, setForm] = useState<Omit<CatalogItem, "id">>(EMPTY_CATALOG_ITEM);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState("");
  const items = catalogType === "products" ? products : ebooks;
  const setItems = catalogType === "products" ? setProducts : setEbooks;

  async function resetForm(discardPendingImage = false) {
    const pendingImagePath = discardPendingImage && form.imagePath !== originalImagePath
      ? form.imagePath
      : "";

    if (pendingImagePath) {
      await supabase.storage.from("catalog-images").remove([pendingImagePath]);
    }

    setForm(EMPTY_CATALOG_ITEM);
    setFormOpen(false);
    setEditingId(null);
    setOriginalImagePath("");
  }

  function startEdit(item: CatalogItem) {
    const { id, ...itemForm } = item;
    setForm(itemForm);
    setEditingId(id);
    setOriginalImagePath(item.imagePath);
    setFormOpen(true);
  }

  async function handleSave() {
    const safeItem = {
      title: cleanSingleLine(form.title, 120),
      description: cleanMultiline(form.description, 500),
      price: formatCatalogPrice(form.price),
      image: form.image,
    };
    if (!safeItem.title) return;

    const payload = {
      kind: catalogType,
      title: safeItem.title,
      description: safeItem.description,
      price: safeItem.price,
      image_url: safeItem.image,
      image_path: form.imagePath,
      action_label: "Adquirir",
      visible: true,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("catalog_items")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (error || !data) {
        window.alert("Não foi possível salvar este item.");
        return;
      }
      setItems((current) => current.map((item) => item.id === editingId ? normalizeCatalogRow(data) : item));

      if (originalImagePath && originalImagePath !== form.imagePath) {
        await supabase.storage.from("catalog-images").remove([originalImagePath]);
      }
    } else {
      const { data, error } = await supabase
        .from("catalog_items")
        .insert(payload)
        .select()
        .single();
      if (error || !data) {
        window.alert("Não foi possível adicionar este item.");
        return;
      }
      setItems((current) => [...current, normalizeCatalogRow(data)]);
    }
    await resetForm();
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Tem certeza que deseja remover este item do catálogo?")) return;
    const item = items.find((current) => current.id === id);
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) {
      window.alert("Não foi possível remover este item.");
      return;
    }
    if (item?.imagePath) await supabase.storage.from("catalog-images").remove([item.imagePath]);
    setItems((current) => current.filter((catalogItem) => catalogItem.id !== id));
    if (editingId === id) await resetForm(true);
  }

  async function handleImageChange(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 50 * 1024 * 1024) {
      window.alert("Escolha uma imagem de até 50 MB.");
      return;
    }
    const pendingImagePath = form.imagePath !== originalImagePath ? form.imagePath : "";
    try {
      const compressed = await compressImageFile(file);
      const imagePath = `${catalogType}/${createCatalogId()}.webp`;
      const { error } = await supabase.storage
        .from("catalog-images")
        .upload(imagePath, compressed.blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) {
        window.alert("Não foi possível enviar a imagem.");
        return;
      }
      const { data } = supabase.storage.from("catalog-images").getPublicUrl(imagePath);

      if (pendingImagePath) {
        await supabase.storage.from("catalog-images").remove([pendingImagePath]);
      }

      setForm((current) => ({ ...current, image: data.publicUrl, imagePath }));
    } catch {
      window.alert("Não foi possível preparar a imagem.");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-[#fff8ef] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-xl font-bold text-[#532737]">Catálogos</h3>
          <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-1 text-sm text-[#735273]">Adicione fotos, nomes e preços. As imagens ficam no Storage e os dados no Supabase.</p>
        </div>
        <div className="flex flex-wrap gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {(["products", "ebooks"] as const).map((type) => {
            const active = catalogType === type;
            const visible = visibility[type];
            return (
              <div key={type} className="flex items-center gap-1 rounded-full border border-border bg-white p-1">
                <button type="button" onClick={() => setCatalogType(type)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-[#db0e54] text-white" : "text-[#735273]"}`}>
                  {type === "products" ? "Produtos" : "E-books"}
                </button>
                <button type="button" onClick={async () => {
                  const next = { ...visibility, [type]: !visible };
                  const { error } = await supabase.from("catalog_settings").update({ products_visible: next.products, ebooks_visible: next.ebooks, updated_at: new Date().toISOString() }).eq("id", true);
                  if (error) window.alert("Não foi possível alterar a visibilidade.");
                  else setVisibility(next);
                }} className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold ${visible ? "text-[#3c9b35]" : "text-[#735273]"}`} aria-pressed={visible}>
                  {visible ? "Visível" : "Oculto"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-sm font-semibold text-[#532737]">{catalogType === "products" ? "Produtos" : "E-books"} cadastrados: {items.length}</p>
        {!formOpen && <button type="button" onClick={() => { setForm(EMPTY_CATALOG_ITEM); setEditingId(null); setOriginalImagePath(""); setFormOpen(true); }} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#db0e54] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#bb3f4e] sm:w-auto" style={{ fontFamily: "'Nunito', sans-serif" }}><Plus size={16} /> Adicionar item</button>}
      </div>

      {formOpen && (
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2">
          <p style={{ fontFamily: "'Baloo 2', cursive" }} className="col-span-full text-lg font-bold text-[#532737]">{editingId ? "Editar item" : "Novo item"}</p>
          <div className="flex flex-col gap-1 sm:col-span-2"><label className="text-xs font-semibold text-[#735273]">Nome</label><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} maxLength={120} className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-[#735273]">Preço</label><input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} onBlur={(event) => setForm((current) => ({ ...current, price: formatCatalogPrice(event.target.value) }))} inputMode="decimal" placeholder="Ex.: 100 ou 100,50" maxLength={40} className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]" /><span className="text-[11px] text-[#735273]">O valor será salvo como R$ 100,00 automaticamente.</span></div>
          <div className="flex flex-col gap-1 sm:col-span-2"><label className="text-xs font-semibold text-[#735273]">Descrição</label><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} maxLength={500} rows={3} className="resize-y rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-[#735273]">Foto ou capa <span className="font-normal">(máximo de 50 MB, com compressão automática)</span></label><input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0])} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#f6e2c2] file:px-3 file:py-1 file:text-xs file:font-bold" />{form.image && <img src={form.image} alt="Prévia do item" className="mt-2 h-20 w-20 rounded-xl object-cover" />}</div>
          <div className="col-span-full flex flex-col gap-2 sm:flex-row"><button type="button" onClick={handleSave} className="w-full rounded-full bg-[#db0e54] px-5 py-2 text-sm font-bold text-white hover:bg-[#bb3f4e] sm:w-auto">{editingId ? "Salvar alterações" : "Salvar item"}</button><button type="button" onClick={() => void resetForm(true)} className="w-full rounded-full border border-border px-5 py-2 text-sm font-semibold text-[#735273] sm:w-auto">Cancelar</button></div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-white p-3">
            {item.image ? <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#f6e2c2] text-2xl">{catalogType === "ebooks" ? "📖" : "🎁"}</div>}
            <div className="min-w-0 flex-1"><p className="truncate font-bold text-[#532737]">{item.title}</p><p className="text-xs text-[#735273]">{item.price || "Sem preço"}</p><div className="mt-2 flex gap-3 text-xs"><button type="button" onClick={() => startEdit(item)} className="font-semibold text-[#1478b8]">Editar</button><button type="button" onClick={() => handleRemove(item.id)} className="font-semibold text-red-500">Remover</button></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSection({
  workshops,
  setWorkshops,
  testimonials,
  setTestimonials,
  products,
  setProducts,
  ebooks,
  setEbooks,
  catalogVisibility,
  setCatalogVisibility,
  onClose,
}: {
  workshops: Workshop[];
  setWorkshops: Dispatch<SetStateAction<Workshop[]>>;
  testimonials: Testimonial[];
  setTestimonials: Dispatch<SetStateAction<Testimonial[]>>;
  products: CatalogItem[];
  setProducts: Dispatch<SetStateAction<CatalogItem[]>>;
  ebooks: CatalogItem[];
  setEbooks: Dispatch<SetStateAction<CatalogItem[]>>;
  catalogVisibility: CatalogVisibility;
  setCatalogVisibility: Dispatch<SetStateAction<CatalogVisibility>>;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passError, setPassError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [form, setForm] = useState<Omit<Workshop, "id">>(BLANK);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...workshops].sort((a, b) => a.date.localeCompare(b.date));
  const loginLocked = lockUntil > currentTime;

  useEffect(() => {
    if (!loginLocked) return;

    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [loginLocked]);

  useEffect(() => {
    if (lockUntil > 0 && !loginLocked) {
      setLockUntil(0);
      setPassError(false);
    }
  }, [lockUntil, loginLocked]);

  // Se já houver sessão salva (admin logou antes), restaura o acesso.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setAuthenticated(true);
        await loadAllTestimonials();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAllTestimonials() {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTestimonials(data as Testimonial[]);
  }

  async function handleLogin() {
    if (loginLocked || loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: adminPass,
    });
    setLoading(false);

    if (!error) {
      setAuthenticated(true);
      setPassError(false);
      setFailedAttempts(0);
      setLockUntil(0);
      setAdminPass("");
      await loadAllTestimonials();
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setPassError(true);
      setAdminPass("");

      if (nextAttempts >= ADMIN_MAX_ATTEMPTS) {
        setLockUntil(Date.now() + ADMIN_LOCK_MS);
        setCurrentTime(Date.now());
        setFailedAttempts(0);
      }
    }
  }

  async function handleSave() {
    const safeWorkshop = {
      date: form.date,
      time: form.time,
      theme: cleanSingleLine(form.theme, 120),
      location: cleanSingleLine(form.location, 100),
      address: cleanSingleLine(form.address, 160),
      spots: Math.max(0, Math.min(999, Math.floor(Number(form.spots) || 0))),
      color: COLORS.includes(form.color) ? form.color : COLORS[0],
    };

    if (!safeWorkshop.date || !safeWorkshop.time || !safeWorkshop.location || !safeWorkshop.theme) return;

    if (editingId) {
      const { data, error } = await supabase
        .from("workshops")
        .update(safeWorkshop)
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setWorkshops((prev) =>
          prev.map((workshop) => (workshop.id === editingId ? (data as Workshop) : workshop)),
        );
      }
    } else {
      const { data, error } = await supabase
        .from("workshops")
        .insert(safeWorkshop)
        .select()
        .single();
      if (!error && data) {
        setWorkshops((prev) => [...prev, data as Workshop]);
      }
    }

    setForm(BLANK);
    setFormOpen(false);
    setEditingId(null);
  }

  function handleEdit(workshop: Workshop) {
    setForm({
      date: workshop.date,
      time: workshop.time,
      location: workshop.location,
      address: workshop.address,
      spots: workshop.spots,
      theme: workshop.theme,
      color: workshop.color,
    });
    setEditingId(workshop.id);
    setFormOpen(true);
  }

  function handleCancelForm() {
    setFormOpen(false);
    setForm(BLANK);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja remover esta oficina?")) return;
    const { error } = await supabase.from("workshops").delete().eq("id", id);
    if (!error) setWorkshops((prev) => prev.filter((w) => w.id !== id));
    if (editingId === id) handleCancelForm();
  }

  async function handleDeleteComment(id: string) {
    if (!window.confirm("Tem certeza que deseja remover este depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) setTestimonials((prev) => prev.filter((comment) => comment.id !== id));
  }

  async function handleApproveComment(id: string) {
    const { error } = await supabase
      .from("testimonials")
      .update({ approved: true, hidden: false })
      .eq("id", id);
    if (!error) {
      setTestimonials((prev) =>
        prev.map((comment) =>
          comment.id === id ? { ...comment, approved: true, hidden: false } : comment,
        ),
      );
    }
  }

  async function handleToggleCommentVisibility(id: string) {
    const current = testimonials.find((comment) => comment.id === id);
    const nextHidden = !current?.hidden;
    const { error } = await supabase
      .from("testimonials")
      .update({ hidden: nextHidden })
      .eq("id", id);
    if (!error) {
      setTestimonials((prev) =>
        prev.map((comment) =>
          comment.id === id ? { ...comment, hidden: nextHidden } : comment,
        ),
      );
    }
  }

  return (
    <section
      className="fixed inset-0 z-[90] bg-[#532737]/55 backdrop-blur-sm px-2 py-2 sm:px-4 sm:py-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Painel Admin"
    >
      <div className="max-w-6xl mx-auto relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white shadow-2xl p-4 sm:p-8">
        <PaintTexture count={6} colors={["#db0e54", "#735273", "#5aaec8", "#e89349"]} />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-white border border-border p-2 text-[#532737] shadow-sm hover:text-[#db0e54]"
          aria-label="Fechar painel Admin"
        >
          <X size={20} />
        </button>
        <div className="relative z-10">
          <div className="text-center mb-7 sm:mb-10 px-8 sm:px-0">
            <span
              className="inline-block bg-[#f6e2c2] text-[#db0e54] px-4 py-1 rounded-full text-sm font-bold mb-3"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Admin
            </span>
            <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#532737]">
              Painel do Site
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mt-3 text-[#735273] text-sm sm:text-lg">
              Acesse pela URL <strong>/admin</strong> para gerenciar oficinas, aprovar, ocultar ou remover depoimentos.
            </p>
          </div>

          {!authenticated ? (
            <div className="bg-white border border-border rounded-2xl p-6 w-full max-w-sm mx-auto shadow-md flex flex-col gap-3">
              <p style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#532737] text-center">
                Acesso do administrador
              </p>
              <input
                type="email"
                placeholder="E-mail"
                aria-label="E-mail do administrador"
                autoComplete="username"
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                disabled={loginLocked || loading}
                className="border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
              <input
                type="password"
                placeholder="Senha"
                aria-label="Senha do administrador"
                autoComplete="current-password"
                maxLength={128}
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                disabled={loginLocked || loading}
                className="border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
              {loginLocked ? (
                <p role="status" className="text-[#e87316] text-xs text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Muitas tentativas. Aguarde {Math.max(1, Math.ceil((lockUntil - currentTime) / 1_000))} segundos.
                </p>
              ) : passError ? (
                <p className="text-red-500 text-xs text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Senha incorreta. Tente novamente.
                </p>
              ) : null}
              <button
                onClick={handleLogin}
                disabled={loginLocked || loading}
                className="bg-[#db0e54] text-white rounded-xl py-2 font-bold hover:bg-[#bb3f4e] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {loading ? "Entrando…" : "Entrar"}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Acesso protegido por autenticação do Supabase. Só o administrador cadastrado consegue entrar.
              </p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              <div className="bg-[#fff8ef] border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col items-stretch gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
                  <span style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#db0e54] text-lg">
                    Oficinas
                  </span>
                  {!formOpen && (
                    <button
                      onClick={() => { setForm(BLANK); setEditingId(null); setFormOpen(true); }}
                      className="flex w-full items-center justify-center gap-2 bg-[#db0e54] text-white px-5 py-2 rounded-full font-bold hover:bg-[#bb3f4e] transition-colors sm:w-auto"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                      <Plus size={16} /> Adicionar oficina
                    </button>
                  )}
                </div>

                {formOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <p style={{ fontFamily: "'Baloo 2', cursive" }} className="col-span-full font-bold text-[#532737] text-lg">
                      {editingId ? "Editar oficina" : "Nova oficina"}
                    </p>
                    {[
                      { label: "Tema da oficina", key: "theme", type: "text", col: "col-span-full" },
                      { label: "Data", key: "date", type: "date", col: "" },
                      { label: "Horário", key: "time", type: "time", col: "" },
                      { label: "Local / espaço", key: "location", type: "text", col: "" },
                      { label: "Endereço", key: "address", type: "text", col: "" },
                      { label: "Vagas", key: "spots", type: "number", col: "" },
                    ].map(({ label, key, type, col }) => (
                      <div key={key} className={`flex flex-col gap-1 ${col}`}>
                        <label className="text-xs text-[#735273] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          value={(form as any)[key]}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              [key]: type === "number" ? Number(e.target.value) : e.target.value,
                            }))
                          }
                          className="border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#db0e54]"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        />
                      </div>
                    ))}
                    <div className="col-span-full flex flex-col gap-1">
                      <label className="text-xs text-[#735273] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Cor do card
                      </label>
                      <div className="flex gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setForm((f) => ({ ...f, color: c }))}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ background: c, borderColor: form.color === c ? "#532737" : "transparent" }}
                            aria-label={`Usar cor ${c}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        onClick={handleSave}
                        className="w-full bg-[#db0e54] text-white px-5 py-2 rounded-full font-bold hover:bg-[#bb3f4e] transition-colors sm:w-auto"
                        style={{ fontFamily: "'Baloo 2', cursive" }}
                      >
                        {editingId ? "Salvar alterações" : "Salvar oficina"}
                      </button>
                      <button
                        onClick={handleCancelForm}
                        className="w-full border border-border px-5 py-2 rounded-full text-[#735273] font-semibold hover:bg-muted transition-colors sm:w-auto"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {sorted.length === 0 ? (
                    <p className="text-[#735273] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Nenhuma oficina cadastrada.</p>
                  ) : (
                    sorted.map((w) => (
                      <div key={w.id} className="flex flex-col items-stretch gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <p style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#532737] leading-tight">{w.theme}</p>
                          <p className="text-sm text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            {formatDate(w.date)} às {w.time}h • {w.location}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-4 sm:justify-start sm:gap-3">
                          <button onClick={() => handleEdit(w)} className="flex items-center gap-1 text-xs text-[#5aaec8] hover:text-[#1478b8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            <Pencil size={12} /> Editar
                          </button>
                          <button onClick={() => handleDelete(w.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="mb-5">
                  <h3 style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#532737] text-xl">Elogios e sugestões</h3>
                  <p className="text-sm text-[#735273] mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Aprove, oculte temporariamente ou remova os comentários impróprios.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {testimonials.length === 0 ? (
                    <p className="text-[#735273] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Nenhum elogio ou sugestão cadastrado.</p>
                  ) : (
                    testimonials.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <p style={{ fontFamily: "'Baloo 2', cursive" }} className="font-bold text-[#532737] leading-tight">{comment.name}</p>
                            {comment.email && (
                              <p className="text-xs text-[#735273] mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>{comment.email}</p>
                            )}
                            <p className="emoji text-xs text-[#e89349] font-bold mt-1">{'★'.repeat(comment.stars)}</p>
                            <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${comment.approved === false ? "bg-[#fff0df] text-[#e87316]" : comment.hidden ? "bg-[#f0e8f4] text-[#735273]" : "bg-[#e9f8e4] text-[#3c9b35]"}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                              {comment.approved === false ? "Aguardando aprovação" : comment.hidden ? "Oculto" : "Publicado"}
                            </span>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                            {comment.approved === false && (
                              <button onClick={() => handleApproveComment(comment.id)} className="rounded-full bg-[#3c9b35] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#327f2d]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                Aprovar
                              </button>
                            )}
                            {comment.approved !== false && (
                              <button onClick={() => handleToggleCommentVisibility(comment.id)} className="rounded-full border border-[#735273]/30 px-3 py-1.5 text-xs font-bold text-[#735273] hover:bg-[#f0e8f4]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                {comment.hidden ? "Exibir" : "Ocultar"}
                              </button>
                            )}
                            <button onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600" style={{ fontFamily: "'Nunito', sans-serif" }}>
                              <Trash2 size={12} /> Remover
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-[#735273] mt-3" style={{ fontFamily: "'Nunito', sans-serif" }}>{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <CatalogManager
              products={products}
              setProducts={setProducts}
              ebooks={ebooks}
              setEbooks={setEbooks}
              visibility={catalogVisibility}
              setVisibility={setCatalogVisibility}
            />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Testimonials({
  testimonials,
  onAddTestimonial,
}: {
  testimonials: Testimonial[];
  onAddTestimonial: (testimonial: Omit<Testimonial, "id">) => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    text: "",
    stars: 5,
    website: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const approvedTestimonials = testimonials.filter(
    (testimonial) => testimonial.approved !== false && testimonial.hidden !== true,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setSubmitError("");

    if (form.website) {
      setSubmitted(true);
      return;
    }

    const name = cleanSingleLine(form.name, 80);
    const email = cleanSingleLine(form.email, 120).toLowerCase();
    const text = cleanMultiline(form.text, 600);
    const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0;
    const lastSubmission = Number(loadStored(LAST_TESTIMONIAL_KEY, 0));

    if (Date.now() - lastSubmission < TESTIMONIAL_COOLDOWN_MS) {
      setSubmitError("Aguarde alguns segundos antes de enviar outro depoimento.");
      return;
    }

    if (name.length < 2 || text.length < 10 || !isValidEmail(email)) {
      setSubmitError("Revise seu nome, e-mail e comentário antes de enviar.");
      return;
    }

    if (!Number.isInteger(form.stars) || form.stars < 1 || form.stars > 5) {
      setSubmitError("Escolha uma avaliação entre uma e cinco estrelas.");
      return;
    }

    if (links > 2) {
      setSubmitError("O comentário possui links demais. Remova alguns e tente novamente.");
      return;
    }

    if (!form.consent) {
      setSubmitError("Confirme que você concorda com o uso dos dados informados.");
      return;
    }

    try {
      await onAddTestimonial({ name, email, text, stars: form.stars });
    } catch {
      setSubmitError("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }
    saveStored(LAST_TESTIMONIAL_KEY, Date.now());
    setForm({ name: "", email: "", text: "", stars: 5, website: "", consent: false });
    setSubmitted(true);
  }

  return (
    <section className="py-16 sm:py-20 px-4 relative overflow-hidden bg-white">
      <PaintTexture count={5} colors={["#735273", "#5aaec8", "#e89349"]} />
      <PaintSplashBackdrop variant={4} />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <span className="inline-block bg-[#f6e2c2] text-[#db0e54] px-4 py-1 rounded-full text-sm font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>Depoimentos</span>
        <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#532737] mb-4">O que as famílias dizem</h2>
        <p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-[#735273] text-lg mb-8">
          Compartilhe um elogio ou sugestão com a Crescer em Cores.
        </p>

        <button type="button" onClick={() => setShowForm((current) => !current)} className="mb-8 rounded-full bg-[#db0e54] px-6 py-3 font-bold text-white transition-colors hover:bg-[#bb3f4e]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          {showForm ? "Fechar formulário" : "Deixar depoimento"}
        </button>
        {showForm && (
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-12 rounded-[2rem] border border-border bg-[#fff8ef] p-5 sm:p-7 text-left shadow-sm">
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="testimonial-website">Website</label>
            <input
              id="testimonial-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="testimonial-name" className="text-sm font-bold text-[#532737]" style={{ fontFamily: "'Nunito', sans-serif" }}>Nome</label>
              <input
                id="testimonial-name"
                required
                name="name"
                autoComplete="name"
                maxLength={80}
                value={form.name}
                onChange={(event) => { setForm((current) => ({ ...current, name: event.target.value })); setSubmitted(false); setSubmitError(""); }}
                className="rounded-xl border border-border bg-white px-4 py-3 text-[#532737] outline-none focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="testimonial-email" className="text-sm font-bold text-[#532737]" style={{ fontFamily: "'Nunito', sans-serif" }}>E-mail</label>
              <input
                id="testimonial-email"
                type="email"
                required
                name="email"
                inputMode="email"
                autoComplete="email"
                maxLength={120}
                value={form.email}
                onChange={(event) => { setForm((current) => ({ ...current, email: event.target.value })); setSubmitted(false); setSubmitError(""); }}
                className="rounded-xl border border-border bg-white px-4 py-3 text-[#532737] outline-none focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-sm font-bold text-[#532737]" style={{ fontFamily: "'Nunito', sans-serif" }}>Sua avaliação</span>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Avaliação de uma a cinco estrelas">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={form.stars === star}
                    aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
                    onClick={() => { setForm((current) => ({ ...current, stars: star })); setSubmitted(false); setSubmitError(""); }}
                    className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#db0e54]"
                  >
                    <Star size={28} fill={star <= form.stars ? "#e89349" : "transparent"} color="#e89349" />
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="testimonial-text" className="text-sm font-bold text-[#532737]" style={{ fontFamily: "'Nunito', sans-serif" }}>Comentário</label>
              <textarea
                id="testimonial-text"
                required
                name="comment"
                maxLength={600}
                value={form.text}
                onChange={(event) => { setForm((current) => ({ ...current, text: event.target.value })); setSubmitted(false); setSubmitError(""); }}
                className="min-h-28 resize-y rounded-xl border border-border bg-white px-4 py-3 text-[#532737] outline-none focus:ring-2 focus:ring-[#db0e54]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-white px-4 py-3">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(event) => { setForm((current) => ({ ...current, consent: event.target.checked })); setSubmitted(false); setSubmitError(""); }}
                  className="mt-1 h-4 w-4 accent-[#db0e54]"
                />
                <span className="text-xs leading-relaxed text-[#735273]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Concordo que meu nome e comentário possam ser publicados após aprovação. Meu e-mail não será exibido publicamente.
                </span>
              </label>
              <details className="mt-3 rounded-xl border border-border bg-white px-4 py-3 text-xs text-[#735273]">
                <summary className="cursor-pointer font-bold text-[#532737]">Como usamos seus dados</summary>
                <p className="mt-2 leading-relaxed">
                  Nome, e-mail e comentário são usados para moderar o depoimento e entrar em contato ou agradecer pelo envio. Você pode solicitar correção ou exclusão pelo WhatsApp da Crescer em Cores.
                </p>
              </details>
            </div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" className="w-full rounded-full bg-[#db0e54] px-6 py-3 font-bold text-white transition-colors hover:bg-[#bb3f4e] sm:w-auto" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Enviar depoimento
            </button>
            {submitted && (
              <p role="status" className="text-sm font-semibold text-[#3c9b35]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Obrigado pelo seu depoimento!
              </p>
            )}
            {submitError && (
              <p role="alert" className="text-sm font-semibold text-red-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {submitError}
              </p>
            )}
          </div>
        </form>
        )}

        {approvedTestimonials.length === 0 ? (
          <p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-[#735273] text-lg">Novos elogios e sugestões em breve.</p>
        ) : (
          <div className="testimonial-marquee">
            <div className="testimonial-marquee-track">
              {[false, true].map((duplicate) => (
                <div key={duplicate ? "duplicate" : "original"} className="testimonial-marquee-group" aria-hidden={duplicate}>
                  {approvedTestimonials.map((testimonial, index) => (
                    <article
                      key={`${duplicate ? "duplicate" : "original"}-${testimonial.id}`}
                      className="testimonial-marquee-card rounded-2xl border border-border p-6 text-left shadow-sm"
                      style={{ background: ["#fff8ef", "#eef8e8", "#eef7f7"][index % 3] }}
                    >
                      <div className="mb-3 flex gap-0.5">
                        {Array.from({ length: testimonial.stars }).map((_, starIndex) => (
                          <Star key={starIndex} size={14} fill="#e89349" stroke="none" />
                        ))}
                      </div>
                      <p style={{ fontFamily: "'Nunito', sans-serif" }} className="mb-4 text-sm leading-relaxed text-[#532737]">"{testimonial.text}"</p>
                      <p style={{ fontFamily: "'Baloo 2', cursive" }} className="text-sm font-bold text-[#db0e54]"><span className="emoji">❤️</span> {testimonial.name}</p>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contato"
      className="py-16 sm:py-20 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fff9e6 0%, #fde9c5 100%)" }}
    >
      <PaintTexture count={8} colors={["#db0e54", "#5ea85b", "#e89349", "#5aaec8", "#735273"]} />
      <PaintSplashBackdrop variant={5} />
      <img src={leafImg} alt="" className="absolute -top-8 left-0 w-52 opacity-15 pointer-events-none select-none" />
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
        <Heart size={40} className="text-[#e91e8c]" fill="#e91e8c" />
        <h2 style={{ fontFamily: "'Baloo 2', cursive" }} className="text-3xl sm:text-4xl font-extrabold text-[#2d1a0e]">
          Vamos conversar?
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif" }} className="text-[#7a5c3a] text-lg max-w-lg">
          Tire suas dúvidas, reserve uma vaga ou saiba mais sobre as oficinas. Estamos aqui com muito carinho!
        </p>
        <div className="flex w-full flex-col gap-3 justify-center sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
          <a
            href="https://wa.me/5511917455484"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 bg-[#25d366] text-white px-7 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-[#1ebe5d] transition-all hover:scale-105 sm:w-auto"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} /> WhatsApp
          </a>
          <a
            href="https://www.instagram.com/cresceremcores"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 text-white px-7 py-3 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-all sm:w-auto"
            style={{
              fontFamily: "'Baloo 2', cursive",
              background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            }}
          >
            <Instagram size={18} /> Instagram
          </a>
        </div>

        <div className="leaf-pile flex justify-center items-end gap-1 flex-wrap max-w-lg mx-auto pt-4" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, index) => (
            <img
              key={index}
              src={leafDropImg}
              alt=""
              className="w-8 h-8 object-contain opacity-80"
              style={{
                transform: 'rotate(' + ((index % 7) * 18 - 45) + 'deg)',
                marginTop: index % 3,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#532737] text-white py-8 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 text-left">
          <img src={logoImg} alt="Crescer em Cores" className="w-12 h-12 rounded-full object-cover bg-white" />
          <div>
            <p style={{ fontFamily: "'Baloo 2', cursive" }} className="font-extrabold text-lg">Crescer em Cores</p>
            <p className="text-white/70 text-sm">Infâncias mais saudáveis, felizes e protegidas.</p>
          </div>
        </div>
        <p className="text-center text-white/70 text-sm sm:text-right">© 2026 Crescer em Cores</p>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const contactSection = document.getElementById("contato");
    if (!contactSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(contactSection);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence initial={false}>
      {visible && (
    <motion.a
      href="https://wa.me/5511917455484"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Crescer em Cores pelo WhatsApp"
      className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-transform hover:scale-110 md:hidden"
      initial={{ opacity: 0, y: 18, scale: 0.75 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.75 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <WhatsAppIcon sx={{ fontSize: 24 }} />
    </motion.a>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [ebooks, setEbooks] = useState<CatalogItem[]>([]);
  const [catalogVisibility, setCatalogVisibility] = useState<CatalogVisibility>({ products: false, ebooks: false });
  const [routePath, setRoutePath] = useState(() => (typeof window !== "undefined" ? window.location.pathname : "/"));

  // Carrega oficinas e depoimentos do Supabase ao abrir o site.
  // (visitante enxerga só depoimentos aprovados — garantido pelo RLS no banco)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: ws } = await supabase
        .from("workshops")
        .select("*")
        .order("date", { ascending: true });
      if (active && ws) setWorkshops(ws as Workshop[]);

      const { data: ts } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (active && ts) setTestimonials(ts as Testimonial[]);

      const [{ data: catalogRows }, { data: catalogSettings }] = await Promise.all([
        supabase.from("catalog_items").select("*").order("created_at", { ascending: true }),
        supabase.from("catalog_settings").select("*").eq("id", true).maybeSingle(),
      ]);
      if (active && catalogRows) {
        setProducts(catalogRows.filter((row) => row.kind === "products").map(normalizeCatalogRow));
        setEbooks(catalogRows.filter((row) => row.kind === "ebooks").map(normalizeCatalogRow));
      }
      if (active && catalogSettings) {
        setCatalogVisibility({
          products: catalogSettings.products_visible !== false,
          ebooks: catalogSettings.ebooks_visible !== false,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncRoute = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const isAdminRoute = routePath.replace(/\/$/, "") === "/admin";

  async function closeAdmin() {
    // sair encerra a sessão do admin e recarrega só os depoimentos públicos
    await supabase.auth.signOut();
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setTestimonials((data as Testimonial[]) ?? []);
    window.history.pushState(null, "", "/");
    setRoutePath("/");
  }

  async function handleAddTestimonial(testimonial: Omit<Testimonial, "id">) {
    // grava como PENDENTE (approved/hidden ficam false por padrão no banco).
    // não aparece publicamente até o admin aprovar no /admin.
    const { error } = await supabase.from("testimonials").insert({
      name: testimonial.name,
      email: testimonial.email,
      text: testimonial.text,
      stars: testimonial.stars,
    });
    if (error) throw error;
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <PlantOverlay />
      <ScrollDecorations />
      <Navbar catalogVisibility={catalogVisibility} />
      <FloatingWhatsApp />
      <Hero />
      <About />
      <QuemSomosSection />
      <AgendaSection workshops={workshops} />
      {catalogVisibility.products && <CatalogSection kind="products" items={products} />}
      {catalogVisibility.ebooks && <CatalogSection kind="ebooks" items={ebooks} />}
      <Testimonials testimonials={testimonials} onAddTestimonial={handleAddTestimonial} />
      <Contact />
      <Footer />
      {isAdminRoute && (
        <AdminSection
          workshops={workshops}
          setWorkshops={setWorkshops}
          testimonials={testimonials}
          setTestimonials={setTestimonials}
          products={products}
          setProducts={setProducts}
          ebooks={ebooks}
          setEbooks={setEbooks}
          catalogVisibility={catalogVisibility}
          setCatalogVisibility={setCatalogVisibility}
          onClose={closeAdmin}
        />
      )}
    </div>
  );
}

