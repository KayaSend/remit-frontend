import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Send,
  Wallet,
  ArrowRight,
  Shield,
  CheckCircle,
  Zap,
  Globe,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useEffect } from "react";
import { AnimatedMeshBackground } from "@/components/AnimatedMeshBackground";
import { FloatingCards } from "@/components/FloatingCards";

const Index = () => {
  const navigate = useNavigate();
  const { role, setRole, isLoading } = useRole();

  useEffect(() => {
    if (!isLoading && role) {
      navigate(role === "sender" ? "/sender" : "/recipient");
    }
  }, [role, isLoading, navigate]);

  const handleRoleSelect = (selectedRole: "sender" | "recipient") => {
    setRole(selectedRole);
    navigate(selectedRole === "sender" ? "/sender" : "/recipient");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Hero title animation variants
  const heroTitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const heroSubtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2 },
    },
  };

  const roleCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.1 * i },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background overflow-hidden">
      {/* 3D Animated Background - Full screen backdrop */}
      <div className="fixed inset-0 -z-10 opacity-60">
        <AnimatedMeshBackground />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="fixed inset-0 -z-9 bg-gradient-to-b from-slate-950/40 via-slate-900/20 to-transparent" />

      {/* Hero Section with modern design */}
      <motion.div
        className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <motion.div className="text-left" variants={heroTitleVariants}>
              <motion.div
                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Global Remittance Platform
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Send Money
                <br />
                <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  That Matters
                </span>
              </h1>

              <motion.p
                className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed"
                variants={heroSubtitleVariants}
              >
                Skip the middleman. Send money directly to pay bills for family
                in Kenya. Fast, secure, and transparent—no cash, no hassle.
              </motion.p>

              <motion.div
                className="flex gap-4"
                variants={heroSubtitleVariants}
              >
                <motion.button
                  onClick={() => handleRoleSelect("sender")}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
                <motion.button
                  onClick={() => handleRoleSelect("recipient")}
                  className="px-8 py-3 border border-slate-500 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right side - Decorative element or spacer */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-slate-900/50 backdrop-blur rounded-3xl p-8 border border-slate-700/50">
                  <Zap className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  <p className="text-center text-slate-300 text-sm">
                    Real-time bill payments powered by blockchain security
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating Cards Section - How it works visually */}
      <motion.div
        className="relative py-16 md:py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How it Works
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Three simple steps to transform the way you send money home
            </p>
          </motion.div>

          <FloatingCards />
        </div>
      </motion.div>

      {/* Role Selection Section */}
      <motion.div
        className="relative py-16 md:py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            Choose Your Role
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sender Card */}
            <motion.button
              onClick={() => handleRoleSelect("sender")}
              className="text-left"
              variants={roleCardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: false }}
            >
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur border border-blue-500/30 rounded-2xl p-8 h-full hover:border-blue-500/50 transition-all">
                <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Send className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  I'm Sending Money
                </h3>
                <p className="text-slate-300 mb-6">
                  Pay bills for family in Kenya. You choose what the money is
                  used for. Fast, secure, and transparent.
                </p>
                <div className="flex items-center text-blue-400 font-medium">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </motion.button>

            {/* Recipient Card */}
            <motion.button
              onClick={() => handleRoleSelect("recipient")}
              className="text-left"
              variants={roleCardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: false }}
            >
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur border border-purple-500/30 rounded-2xl p-8 h-full hover:border-purple-500/50 transition-all">
                <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Wallet className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  I'm Receiving Money
                </h3>
                <p className="text-slate-300 mb-6">
                  Request bill payments. We send money directly to pay your
                  bills. No cash changes hands.
                </p>
                <div className="flex items-center text-purple-400 font-medium">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Features/Benefits Section */}
      <motion.div
        className="relative py-16 md:py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure",
                description: "Enterprise-grade encryption protects every transaction",
              },
              {
                icon: Zap,
                title: "Instant",
                description: "Bills paid in real-time to verified providers",
              },
              {
                icon: Globe,
                title: "Global",
                description: "Send money across borders with confidence",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.5 }}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center hover:bg-slate-800/70 transition-all"
                >
                  <Icon className="w-10 h-10 text-green-400 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Trust Section */}
      <motion.div
        className="relative py-16 md:py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div
            className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 backdrop-blur border border-green-500/30 rounded-2xl p-8 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-white text-lg">
              <strong className="text-green-400">No cash changes hands.</strong>
              <br />
              Bills are paid directly to verified providers in Kenya. Secure,
              transparent, and always under your control.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
