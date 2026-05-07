import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="loader">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p>Generating resume...</p>
    </div>
  );
}
