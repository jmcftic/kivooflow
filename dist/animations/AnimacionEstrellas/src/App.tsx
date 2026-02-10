import { motion } from "motion/react";
import Frame from "./imports/Frame10";
import AnimatedSparkles from "./components/AnimatedSparkles";

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8">
      <div className="relative w-[400px] h-[300px] flex items-center justify-center">
        {/* Estrellas de fondo con animación de escala invertida */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedSparkles />
        </div>

        {/* Logo con animación de movimiento vertical */}
        <motion.div
          className="relative z-10 scale-150"
          animate={{
            y: [-15, 15, -15],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Frame />
        </motion.div>
      </div>
    </div>
  );
}