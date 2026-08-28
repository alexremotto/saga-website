import { motion, useReducedMotion } from "motion/react";
// Si usas la librería antigua, cambia el import por:  from "framer-motion"

/* ────────────────────────────────────────────────────────────
   SAGA · Cuentahílos que se dibuja solo (line-art)

   Geometría real extraída de Logo.svg (viewBox 0 0 360.61 415.56).
   Cada trazo se dibuja con pathLength (0→1), escalonado por --i,
   en el orden del storyboard: cuerpo → base → plato → costillas → lente.
   Ease-out: empieza acelerado y termina suave. Respeta reduced-motion.
   ──────────────────────────────────────────────────────────── */

// Trazos en orden de dibujo. (polilíneas y líneas convertidas a paths)
const SAGA_PATHS = [
  "M4.06 52.71 L141.08 136.47 L144.52 349.61 L162.76 380.77",   // 0 · espolón/espina (entra primero, se alarga)
  "M13.97 252.14 L144.52 349.61",                                // 1
  "M143.9 317.3 L63.78 258.56 L142.34 220.01",                   // 2 · pliegue base
  "M141.77,190.54s-43.3,20.58-48.55,23.06c-5.25,2.49-72.53,34.24-75.63,35.91-3.11,1.66-5.52,4.12-5.74,6.31-.22,2.18.27,9.77.23,10.9-.04,1.14.75,3.46,1.49,3.9.75.43,24.97,18.39,27.89,20.53,2.93,2.14,38.58,28.69,40.28,29.83,1.71,1.13,43.7,32.91,46.02,34.53,2.32,1.62,31.91,23.18,33.4,24.09,1.49.92,25.26,19.8,30.56,22.81,5.29,3.02,18.06,11.61,21.2,10.57,3.16-1.05,12.26-6.06,13.92-7.1,1.67-1.05,35.44-23.96,39.46-26.37,4.02-2.41,52.14-34.72,55.16-36.54,3.02-1.84,36.65-25.77,36.65-25.77,0,0,.26-7.19-2.41-12.96-2.67-5.77-7.04-13.16-11.48-15.83-2.64-1.59-43.04-27.76-43.04-27.76", // 3 · cuerpo inferior
  "M304.62,262.21c.06-3.35,1.15-163.1,1.15-163.1,0,0,12.32-4.41,14.94-10.88,2.62-6.47,1.36-13.62-1.17-17.91-2.54-4.27-5.66-9.98-14.93-9.63-5.69,2.19-16.54,6.9-16.54,6.9,0,0-86.26-44.59-94.13-48.7-7.87-4.1-25.45-12.93-27.73-14-2.27-1.03-5.86-2.39-8.83-2.39s-7.04,1.31-9.4,2.05c-2.36.75-50.94,16.31-56.38,18.28-5.45,1.96-79.57,26.55-82.39,27.41-2.82.85-6.75,1.96-6.71,6.38.04,4.42,0,17.92,0,18.91s.26,5.8,2.59,7.83c2.33,2.04,33.99,22.04,37.77,24.37,3.77,2.32,64.93,40.09,66.58,41.06,1.67.96,25.54,16.19,26.02,16.28.48.08,5.85-1.26,5.85-1.26", // 4 · estructura superior
  "M304.72,257.19l-41.46,24.21,37.91,28.45-57.19,34.26s-33.05-18.66-40.09-28.76l-48.36,28.76-1.53-185.68s3.37,7.34,16.53,1.53c13.16-5.81,135.23-60.84,135.23-60.84", // 5 · plato/detalle
  "M263.27 281.39 L203.9 315.35",                                // 6
  "M154.33,346.36s43.75,26.65,49.56,32.62c5.81,5.97,15.91,18.89,9.03,33.99", // 7 · costilla pie
  "M243.99,344.1s23.33,10,20.31,36.66",                          // 8 · costilla
  "M299.34,309.5s23.6,7.95,20.58,34.61",                         // 9 · costilla
  "M203.9,102.92s20.17,5.89,17.13,34.37",                        // 10 · costilla
  "M154.01,123.85s20.81,8.26,14,37.09",                          // 11 · costilla
  "M266.39,77.54s17,4.3,13.96,32.78",                            // 12 · costilla
  "M288.08,67.59s-131.87,55.34-137.71,57.79c-5.84,2.45-9.37,5.96-9.29,11.09", // 13 · borde lente
];

// La lente se dibuja la última ("ACABADO" del storyboard).
const LENS = { cx: 150.37, cy: 69.78, rx: 72.11, ry: 25.95 };

// Tempo
const STAGGER = 0.12;
const DRAW = 0.75;
const EASE = [0.16, 1, 0.3, 1]; // ease-out: acelera al inicio, suaviza al final

export default function SagaLogoDraw({
  size = 320,
  color = "var(--red, #DF0C16)",
  strokeWidth = 2.6,
  glow = true, // neón rojo alrededor del trazo
  className,
  onComplete,
}) {
  const reduce = useReducedMotion();
  const initial = reduce ? "shown" : "hidden";

  const stroke = {
    hidden: { pathLength: 0, opacity: 0 },
    shown: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: reduce
        ? { duration: 0 }
        : {
            pathLength: { delay: i * STAGGER, duration: DRAW, ease: EASE },
            opacity: { delay: i * STAGGER, duration: 0.15 },
          },
    }),
  };

  const common = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth };
  const height = (size * 415.56) / 360.61;

  return (
    <svg
      className={className}
      width={size}
      height={height}
      viewBox="0 0 360.61 415.56"
      role="img"
      aria-label="SAGA"
      style={
        glow
          ? { filter: "drop-shadow(0 0 3px rgba(223,12,22,.65)) drop-shadow(0 0 12px rgba(223,12,22,.35))" }
          : undefined
      }
    >
      {SAGA_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          {...common}
          custom={i}
          variants={stroke}
          initial={initial}
          animate="shown"
        />
      ))}
      <motion.ellipse
        {...common}
        cx={LENS.cx}
        cy={LENS.cy}
        rx={LENS.rx}
        ry={LENS.ry}
        custom={SAGA_PATHS.length}
        variants={stroke}
        initial={initial}
        animate="shown"
        onAnimationComplete={onComplete}
      />
    </svg>
  );
}
