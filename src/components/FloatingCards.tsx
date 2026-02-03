import { motion } from "framer-motion";
import { Send, DollarSign, CheckCircle, ArrowRight } from "lucide-react";
import type { Variants } from "framer-motion";

interface FloatingCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  color: string;
  step: string;
}

const cards: FloatingCard[] = [
  {
    id: 1,
    title: "Create & Send",
    description: "Set up your remittance with specific bill categories and amounts",
    icon: <Send className="w-8 h-8" />,
    delay: 0,
    color: "from-blue-500 to-cyan-500",
    step: "01",
  },
  {
    id: 2,
    title: "Verify & Process",
    description: "Instant verification with blockchain-secured transactions",
    icon: <DollarSign className="w-8 h-8" />,
    delay: 0.2,
    color: "from-green-500 to-emerald-500",
    step: "02",
  },
  {
    id: 3,
    title: "Bills Paid",
    description: "Money directly pays verified utility providers in Kenya",
    icon: <CheckCircle className="w-8 h-8" />,
    delay: 0.4,
    color: "from-purple-500 to-pink-500",
    step: "03",
  },
];

/**
 * FloatingCards - Displays animated cards showing the remittance process
 * Enhanced with glass morphism and sophisticated animations
 */
export const FloatingCards = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className="grid md:grid-cols-3 gap-8 relative"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Connection Lines */}
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />

      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          variants={cardVariants}
          className="relative group"
          style={{ perspective: 1000 }}
        >
          {/* Connection Arrow */}
          {index < cards.length - 1 && (
            <motion.div
              className="hidden md:block absolute top-1/2 -right-4 z-20"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
            >
              <ArrowRight className="w-6 h-6 text-primary/60" />
            </motion.div>
          )}

          <motion.div
            className="relative"
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4 + index,
              delay: card.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            {/* Step Number Badge */}
            <motion.div
              className="absolute -top-4 -left-4 z-30"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.6, type: "spring" }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-white font-bold text-sm">{card.step}</span>
              </div>
            </motion.div>

            {/* Main Card */}
            <motion.div
              className={`glass border border-white/10 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-primary/30 transition-all duration-500`}
              whileHover={{
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                scale: 1.02,
              }}
            >
              {/* Gradient Overlay on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10`}
                initial={false}
                transition={{ duration: 0.5 }}
              />

              {/* Animated Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                animate={{
                  translateX: ["100%", "-100%"],
                }}
                transition={{
                  duration: 3,
                  delay: index * 0.5,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              />

              <div className="relative z-10">
                {/* Icon Container */}
                <motion.div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="text-white"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: card.delay,
                    }}
                  >
                    {card.icon}
                  </motion.div>
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {card.description}
                </p>

                {/* Decorative Elements */}
                <div className="mt-6 flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-1 rounded-full bg-gradient-to-r ${card.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: i === 0 ? "40%" : i === 1 ? "30%" : "20%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2 + i * 0.1, duration: 0.8 }}
                    />
                  ))}
                </div>
              </div>

              {/* Corner Accent */}
              <motion.div
                className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-tl-3xl`}
                initial={{ scale: 0, rotate: 45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
