import { motion } from "motion/react";
import svgPaths from "../imports/svg-46d35a2hg7";

export default function AnimatedSparkles() {
  // Estrellas grandes
  const largeStars = [
    { path: svgPaths.p2fd10500, id: "Vector_3" },
    { path: svgPaths.p3c68cb80, id: "Vector_4" },
    { path: svgPaths.p2095600, id: "Vector_8" },
  ];

  // Estrellas medianas
  const mediumStars = [
    { path: svgPaths.p593de80, id: "Vector" },
    { path: svgPaths.p3c33d300, id: "Vector_2" },
    { path: svgPaths.p3d51f940, id: "Vector_7" },
  ];

  // Estrellas pequeñas
  const smallStars = [
    { path: svgPaths.p15a04940, id: "Vector_5" },
    { path: svgPaths.p28430480, id: "Vector_6" },
  ];

  return (
    <div className="relative size-full" data-name="Sparkles">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 141 100">
        <g id="Sparkles">
          {/* Estrellas grandes se vuelven pequeñas */}
          {largeStars.map((star) => (
            <motion.path
              key={star.id}
              d={star.path}
              fill="var(--fill-0, #29292B)"
              id={star.id}
              style={{ transformOrigin: "center" }}
              animate={{
                scale: [1, 0.4, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Estrellas medianas tienen animación suave */}
          {mediumStars.map((star) => (
            <motion.path
              key={star.id}
              d={star.path}
              fill="var(--fill-0, #29292B)"
              id={star.id}
              style={{ transformOrigin: "center" }}
              animate={{
                scale: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Estrellas pequeñas se vuelven grandes */}
          {smallStars.map((star) => (
            <motion.path
              key={star.id}
              d={star.path}
              fill="var(--fill-0, #29292B)"
              id={star.id}
              style={{ transformOrigin: "center" }}
              animate={{
                scale: [1, 2.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
