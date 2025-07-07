import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';

const Index = () => {
  // Sample video URL - replace with your actual video
  const videoUrl = "/public/docin-mvp.mp4";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl lg:text-6xl font-bold text-foreground mb-6 font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Présentation du Produit
          </motion.h1>
          
          <motion.p
            className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Découvrez notre innovation à travers cette présentation vidéo exclusive
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto"
        >
          <VideoPlayer videoUrl={videoUrl} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Pour une expérience optimale, nous recommandons d'utiliser les dernières versions 
            de Chrome, Firefox ou Safari
          </p>
        </motion.div>
      </div>
      <footer className="w-full py-6 bg-background border-t border-border text-center text-xs text-muted-foreground mt-8">
        © 2025 Doc-in. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Index;