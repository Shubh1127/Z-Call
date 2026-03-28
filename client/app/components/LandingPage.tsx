// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Video, 
  Users, 
  Shield, 
  Zap, 
  MessageSquare, 
  Monitor, 
  Mic, 
  Camera,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Feature data
const features = [
  {
    icon: <Video className="w-6 h-6" />,
    title: "Crystal Clear HD",
    description: "1080p video quality with adaptive bitrate streaming for smooth calls in any network condition."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Up to 100 Participants",
    description: "Host large meetings, webinars, or virtual events with enterprise-grade stability."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "End-to-End Encryption",
    description: "Your conversations are secured with AES-256 encryption. Privacy first, always."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Join",
    description: "No downloads required. Join calls directly from your browser in seconds."
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Live Chat & Reactions",
    description: "Real-time messaging, emoji reactions, and file sharing during calls."
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "Screen Sharing",
    description: "Share your entire screen or specific windows with one click."
  }
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at TechCorp",
    content: "The best video calling experience we've had. The quality is unmatched and our team loves the intuitive interface.",
    avatar: "SC"
  },
  {
    name: "Marcus Johnson",
    role: "CEO of StartupXYZ",
    content: "We switched from Zoom and never looked back. The browser-based approach saves so much hassle for our clients.",
    avatar: "MJ"
  },
  {
    name: "Emily Rodriguez",
    role: "Remote Team Lead",
    content: "Finally, a video app that actually works on unstable connections. Game changer for our distributed team.",
    avatar: "ER"
  }
];

// Pricing tiers
const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for personal use",
    features: ["Up to 4 participants", "40-minute meetings", "Screen sharing", "Basic chat"],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$12",
    description: "For professionals and small teams",
    features: ["Up to 50 participants", "Unlimited meeting time", "Cloud recording", "Custom backgrounds", "Priority support"],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: ["Up to 1000 participants", "SSO & Admin controls", "API access", "Dedicated support", "Custom branding"],
    cta: "Contact Sales",
    popular: false
  }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [meetingId, setMeetingId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim()) {
      window.location.href = `/room/${meetingId}`;
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ConnectFlow
              </span>
            </motion.div>

            {/* Desktop Nav */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-8"
            >
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Testimonials</a>
              <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">About</a>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-4"
            >
              <button onClick={handleGoogleSignIn} className="text-sm text-slate-300 hover:text-white transition-colors">
                Log in
              </button>
              <button onClick={handleGoogleSignIn} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95">
                Start for Free
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-slate-800"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-slate-400 hover:text-white py-2">Features</a>
                <a href="#pricing" className="block text-slate-400 hover:text-white py-2">Pricing</a>
                <a href="#testimonials" className="block text-slate-400 hover:text-white py-2">Testimonials</a>
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                  <button onClick={handleGoogleSignIn} className="w-full py-2 text-slate-300 hover:text-white">Log in</button>
                  <button onClick={handleGoogleSignIn} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Start for Free</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%234f46e5%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Now with AI-powered noise cancellation
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
              >
                Video calls that feel{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  effortless
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Crystal-clear video meetings in your browser. No downloads, no hassle. 
                Just instant, secure connections with the people who matter.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <button onClick={handleGoogleSignIn} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25">
                  <Video className="w-5 h-5" />
                  Start New Meeting
                </button>
                <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-1.5 backdrop-blur-sm">
                  <form onSubmit={handleJoinMeeting} className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Enter meeting code"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="bg-transparent border-none outline-none text-white placeholder-slate-500 px-3 py-2 w-full sm:w-48"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      Join
                    </button>
                  </form>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Free forever plan</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur shadow-2xl shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80 z-10" />
              
              {/* Mock Video Grid */}
              <div className="p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-video bg-slate-800 rounded-xl relative overflow-hidden group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        i % 3 === 0 ? 'from-indigo-600/20 to-purple-600/20' :
                        i % 3 === 1 ? 'from-emerald-600/20 to-teal-600/20' :
                        'from-orange-600/20 to-red-600/20'
                      }`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-400">
                          {String.fromCharCode(64 + i)}
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <span className="text-xs text-slate-300 bg-slate-950/50 px-2 py-1 rounded">User {i}</span>
                        {i % 2 === 0 && <Mic className="w-3 h-3 text-slate-400" />}
                      </div>
                      {i === 1 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded font-medium animate-pulse">
                          LIVE
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Control Bar */}
                <div className="mt-4 flex items-center justify-center gap-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    <Monitor className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for{' '}
              <span className="text-indigo-400">perfect calls</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to make your video meetings seamless, secure, and productive.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "10M+", label: "Daily Meetings" },
              { value: "150+", label: "Countries" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Loved by teams worldwide
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-400 text-lg">
              See what our users have to say about their experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-400 text-lg">
              Choose the plan that works best for you.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricing.map((tier, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`relative p-6 rounded-2xl border ${
                  tier.popular 
                    ? 'bg-indigo-600/10 border-indigo-500/50 scale-105' 
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">{tier.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-slate-500">/month</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                    tier.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
              Ready to transform your meetings?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join millions of users who have switched to better video calls. 
              Start your first meeting in seconds.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleGoogleSignIn} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ConnectFlow</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                Making video communication simple, secure, and accessible for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              © 2026 ConnectFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}