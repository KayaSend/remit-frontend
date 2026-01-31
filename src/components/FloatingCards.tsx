import { motion } from "framer-motion";
import { Send, DollarSign, CheckCircle } from "lucide-react";
import type { Variants } from "framer-motion";

interface FloatingCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  color: string;
}

const cards: FloatingCard[] = [
  {
    id: 1,
    title: "Send",
    description: "Initiate a secure money transfer",
    icon: <Send className="w-8 h-8" />,
    delay: 0,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Verify",
    description: "Instant payment verification",
    icon: <DollarSign className="w-8 h-8" />,
    delay: 0.2,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    title: "Receive",
    description: "Funds arrive safely",
    icon: <CheckCircle className="w-8 h-8" />,
    delay: 0.4,
    color: "from-purple-500 to-pink-500",
  },
];

/**
 * FloatingCards - Displays animated cards showing the remittance process
 * Cards float and rotate with staggered animations
 */
export const FloatingCards = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      className="grid md:grid-cols-3 gap-6 relative z-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          className="group"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              delay: card.delay,
              repeat: Infinity,
            }}
            className={`bg-gradient-to-br ${card.color} p-8 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full`}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="text-white mb-4"
            >
              {card.icon}
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <p className="text-white text-opacity-90 text-sm">
              {card.description}
            </p>

            {/* Animated border glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${card.color})`,
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
