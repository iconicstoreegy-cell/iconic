import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary-200 border-t-primary-950 rounded-full mx-auto mb-4"
        />
        <p className="font-display text-lg tracking-widest text-primary-950">AL-SHAER</p>
      </motion.div>
    </div>
  );
}
