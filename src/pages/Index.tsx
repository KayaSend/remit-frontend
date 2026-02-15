import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Send,
  Wallet,
  ArrowRight,
  Shield,
  CheckCircle,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Lightbulb,
  Droplets,
  Home,
  GraduationCap,
  UtensilsCrossed,
  Heart,
  Package,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { role, isLoading } = useRole();
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax effects - respect reduced motion
  const y1 = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -30]);
  const opacity = useTransform(smoothProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    if (!isLoading && role) {
      navigate(role === "sender" ? "/sender" : "/recipient");
    }
  }, [role, isLoading, navigate]);

  const handleRoleSelect = (selectedRole: "sender" | "recipient") => {
    navigate(`/login?role=${selectedRole}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Animation variants with reduced motion support
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  // Category data with app colors
  const categories = [
    { icon: Lightbulb, name: "Electricity", color: "bg-category-electricity", textColor: "text-category-electricity" },
    { icon: Droplets, name: "Water", color: "bg-category-water", textColor: "text-category-water" },
    { icon: Home, name: "Rent", color: "bg-category-rent", textColor: "text-category-rent" },
    { icon: UtensilsCrossed, name: "Food", color: "bg-category-food", textColor: "text-category-food" },
    { icon: Heart, name: "Medical", color: "bg-category-medical", textColor: "text-category-medical" },
    { icon: GraduationCap, name: "Education", color: "bg-category-education", textColor: "text-category-education" },
    { icon: Package, name: "Other", color: "bg-category-other", textColor: "text-category-other" },
  ];

  // How it works steps
  const steps = [
    {
      step: "01",
      title: "Create Remittance",
      description: "Set up categories and spending limits for your recipient",
      icon: Send,
      color: "bg-category-water",
    },
    {
      step: "02",
      title: "Secure Transfer",
      description: "Money is held securely until bills are paid",
      icon: Shield,
      color: "bg-primary",
    },
    {
      step: "03",
      title: "Bills Paid Directly",
      description: "Payments go straight to verified utility providers",
      icon: CheckCircle,
      color: "bg-category-rent",
    },
  ];

  // Stats data
  const stats = [
    { value: "$2M+", label: "Sent Globally", icon: TrendingUp },
    { value: "10k+", label: "Happy Families", icon: Users },
    { value: "99.9%", label: "Uptime", icon: Clock },
    { value: "4.9", label: "App Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fixed Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/70 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Remit</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => handleRoleSelect("sender")}
              className="rounded-full bg-primary/60 hover:bg-primary/80"
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4"
        style={{ opacity, y: y1 }}
      >
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-category-water/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-accent border border-primary/20 rounded-full px-4 py-2 mb-8"
              variants={fadeInUp}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Trusted by 10,000+ families worldwide
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              variants={fadeInUp}
            >
              Send Money Home,{" "}
              <span className="text-primary">Pay Bills Directly</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Skip the middleman. Your money goes directly to pay electricity, water, 
              rent, and school fees in Kenya. No cash changes hands.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              variants={fadeInUp}
            >
              <Button
                size="lg"
                onClick={() => handleRoleSelect("sender")}
                className="h-14 px-8 text-base rounded-full bg-primary/60 hover:bg-primary/80"
              >
                Start Sending
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleRoleSelect("recipient")}
                className="h-14 px-8 text-base"
              >
                I'm a Recipient
              </Button>
            </motion.div>

            {/* Category Pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={fadeInUp}
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 cursor-default hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                >
                  <div className={`w-6 h-6 rounded-full ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto max-w-5xl">
          <h2 className="sr-only">Key stats about Remit</h2>
          <Card className="card-elevated p-8 md:p-10">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  variants={scaleIn}
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-primary">HOW IT WORKS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Send money that actually helps. Every dollar goes exactly where you intend.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={scaleIn}
                className="relative"
              >
                {/* Connection line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
                )}
                
                <Card className="card-elevated p-8 h-full relative z-10">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>

                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Role Selection */}
      <motion.section
        className="py-20 px-4 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Choose Your Role
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Sender Card */}
            <motion.button
              type="button"
              onClick={() => handleRoleSelect("sender")}
              className="text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              variants={scaleIn}
              whileHover={prefersReducedMotion ? undefined : { y: -8, transition: { duration: 0.2 } }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <Card className="card-elevated overflow-hidden h-full">
                <div className="h-1.5 bg-category-water" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-category-water/10 flex items-center justify-center mb-6">
                    <Send className="w-7 h-7 text-category-water" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">I'm Sending Money</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Pay bills for family in Kenya. You choose what the money is used for. 
                    Set spending limits by category.
                  </p>
                  <div className="flex items-center text-category-water font-semibold">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
              </Card>
            </motion.button>

            {/* Recipient Card */}
            <motion.button
              type="button"
              onClick={() => handleRoleSelect("recipient")}
              className="text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              variants={scaleIn}
              whileHover={prefersReducedMotion ? undefined : { y: -8, transition: { duration: 0.2 } }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <Card className="card-elevated overflow-hidden h-full">
                <div className="h-1.5 bg-category-rent" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-category-rent/10 flex items-center justify-center mb-6">
                    <Wallet className="w-7 h-7 text-category-rent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">I'm Receiving Money</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Request bill payments from family abroad. Money goes directly to 
                    pay your utility bills. No cash needed.
                  </p>
                  <div className="flex items-center text-category-rent font-semibold">
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
              </Card>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Families Trust Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for security, transparency, and peace of mind
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Enterprise-grade encryption protects every transaction",
                color: "text-primary",
                bgColor: "bg-primary/10",
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description: "Bills paid in real-time to verified utility providers",
                color: "text-category-electricity",
                bgColor: "bg-category-electricity/10",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Send from anywhere. Pay bills across Kenya.",
                color: "text-category-water",
                bgColor: "bg-category-water/10",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={scaleIn}>
                <Card className="card-elevated p-8 h-full text-center">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Banner */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="summary-card text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              No Cash Changes Hands
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Bills are paid <strong>directly to verified providers</strong> in Kenya. 
              You see exactly where every shilling goes. Secure, transparent, and 
              always under your control.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-24 px-4 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              variants={fadeInUp}
            >
              Ready to Send Money That Matters?
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground mb-10"
              variants={fadeInUp}
            >
              Join thousands of families who trust us with their remittances
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button
                size="lg"
                onClick={() => handleRoleSelect("sender")}
                className="h-16 px-12 text-lg cursor-pointer rounded-full bg-primary/60 hover:bg-primary/80"
              >
                Start Sending Now
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Send className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Remit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Remit. Secure remittances for families.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
