import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from './supabaseClient';

import {
  Banknote,
  ShieldCheck,
  Settings,
  QrCode,
  BellRing,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  MapPin,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface District {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  district_id: number;
  name: string;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gymName, setGymName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Database states
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [zoneId, setZoneId] = useState<number | ''>('');
  
  // Loading states
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(true);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch districts on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { data, error } = await supabase
          .from('districts')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        if (data) {
          setDistricts(data);
          // Set Malappuram as default district
          const malappuram = data.find(d => d.name.toLowerCase() === 'malappuram');
          if (malappuram) {
            setDistrictId(malappuram.id);
          }
        }
      } catch (error: any) {
        console.error('Error fetching districts:', error);
        if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          setFetchError('Failed to connect to database. Please check your Supabase URL, Anon Key, and CORS settings.');
        }
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    
    fetchDistricts();
  }, []);

  // Fetch zones when district changes
  useEffect(() => {
    const fetchZones = async () => {
      if (districtId === '') {
        setZones([]);
        return;
      }
      
      setIsLoadingZones(true);
      try {
        const { data, error } = await supabase
          .from('zones')
          .select('*')
          .eq('district_id', districtId)
          .order('name', { ascending: true });
          
        if (error) throw error;
        if (data) setZones(data);
      } catch (error) {
        console.error('Error fetching zones:', error);
      } finally {
        setIsLoadingZones(false);
      }
    };
    
    fetchZones();
  }, [districtId]);

  // Phone validation
  const isPhoneValid = useMemo(() => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(whatsapp);
  }, [whatsapp]);

  const showPhoneError = whatsapp.length > 0 && !isPhoneValid;

  const isFormValid = fullName && gymName && isPhoneValid && districtId !== '' && zoneId !== '';

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrictId(val === '' ? '' : parseInt(val, 10));
    setZoneId(''); // Reset zone when district changes
  };

  const scrollToWaitlist = () => {
    const element = document.getElementById('waitlist-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const selectedDistrict = districts.find(d => d.id === districtId)?.name || '';
      const selectedZone = zones.find(z => z.id === zoneId)?.name || '';

      const { error } = await supabase
        .from('gym_leads')
        .insert([
          {
            gym_name: gymName,
            owner_name: fullName,
            phone_number: whatsapp,
            district: selectedDistrict,
            zone: selectedZone,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      
      setSubmitStatus('success');
      setFullName('');
      setGymName('');
      setWhatsapp('');
      setDistrictId('');
      setZoneId('');
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        setFetchError('Failed to connect to database. Please check your Supabase URL, Anon Key, and CORS settings.');
      }
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-blue selection:text-white overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <span className="font-display font-bold text-2xl tracking-tight">
                Flex<span className="text-brand-blue">Fit</span> <span className="text-white/70 font-medium text-xl">Partner</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
              <button 
                onClick={scrollToWaitlist}
                className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)]"
              >
                Join Waitlist
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-white">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-black border-b border-white/5 px-4 pt-2 pb-6 space-y-4">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">How it Works</a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToWaitlist();
              }}
              className="w-full bg-brand-blue text-white px-6 py-3 rounded-full font-medium mt-4"
            >
              Join Waitlist
            </button>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-volt/10 border border-brand-volt/20 mb-8"
          >
            <span className="text-brand-volt text-sm font-bold tracking-wide">🚀 EXCLUSIVE MALAPPURAM LAUNCH</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]"
          >
            Stop Losing Money on <span className="text-brand-blue">Empty Gym Slots.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
          >
            Turn your idle gym hours into guaranteed revenue. FlexFit brings daily walk-in customers to your gym with zero marketing costs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={scrollToWaitlist}
              className="w-full sm:w-auto bg-brand-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-[0_0_30px_rgba(0,82,255,0.4)] hover:shadow-[0_0_40px_rgba(0,82,255,0.6)] flex items-center justify-center gap-2"
            >
              Become a Partner <ArrowRight size={20} />
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              See How it Works
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-400"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-volt" /> 0% Commission</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-volt" /> Instant Payouts</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-volt" /> Zero Hardware</span>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-brand-dark border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Partner with FlexFit?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">We built FlexFit to put gym owners first. No hidden fees, no complicated setups.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Banknote className="w-8 h-8 text-brand-blue" />,
                  title: "You Keep 100% of the Profit.",
                  desc: "We don't take a commission from your earnings. You set the price, you keep the money. We simply add a small markup to the user."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-brand-blue" />,
                  title: "No 'Credit' - Only Cash.",
                  desc: "Every user pays via the app before they enter. Funds are settled to your bank account weekly."
                },
                {
                  icon: <Settings className="w-8 h-8 text-brand-blue" />,
                  title: "You Are the Boss.",
                  desc: "You set the price per hour. You decide the timings. You verify every check-in via our Gym Owner Dashboard."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to start earning from empty slots.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10"></div>

              {[
                {
                  step: "01",
                  icon: <QrCode className="w-8 h-8 text-white" />,
                  title: "User Scans",
                  desc: "User walks in and scans your FlexFit QR code at the desk."
                },
                {
                  step: "02",
                  icon: <BellRing className="w-8 h-8 text-white" />,
                  title: "You Verify",
                  desc: "You get an instant alert on your dashboard: 'Active Session Started'."
                },
                {
                  step: "03",
                  icon: <Wallet className="w-8 h-8 text-white" />,
                  title: "You Earn",
                  desc: "Money is locked in your wallet instantly."
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-brand-black border border-white/10 flex items-center justify-center mb-6 relative shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Offer Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] p-[1px] overflow-hidden"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-volt via-brand-volt/20 to-brand-blue/50 opacity-50"></div>
            
            <div className="relative bg-brand-black rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_0_50px_rgba(204,255,0,0.1)]">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 flex items-center gap-3">
                  <span className="text-brand-volt">🚀</span> Malappuram Founding Partner Offer
                </h2>
                <p className="text-lg text-slate-300 mb-6">
                  Join the waitlist in the next <span className="text-white font-bold">14 Days</span> to get FREE 'Featured Gym' Status.
                </p>
                <ul className="space-y-3">
                  {[
                    "Rank at the top of search results",
                    "Get 2x more walk-ins",
                    "Lifetime 0% Commission"
                  ].map((bullet, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-brand-volt flex-shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-auto">
                <button 
                  onClick={scrollToWaitlist}
                  className="w-full md:w-auto bg-brand-volt hover:bg-[#b3e600] text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] whitespace-nowrap"
                >
                  Claim Offer Now
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Waitlist Form Section */}
        <section id="waitlist-section" className="py-24 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Reserve Your Spot</h2>
              <p className="text-slate-400">Spots are limited for the Malappuram launch. Register your gym today.</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl"
            >
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-brand-volt/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-brand-volt" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2">You're on the list!</h3>
                  <p className="text-slate-400">We've received your details and will contact you shortly.</p>
                  <button 
                    onClick={() => setSubmitStatus('idle')}
                    className="mt-8 px-6 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                  >
                    Submit Another Gym
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {fetchError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-4 rounded-xl text-sm">
                      <p className="font-bold mb-2 flex items-center gap-2">
                        <AlertCircle size={16} /> Connection Error
                      </p>
                      <p className="mb-2">{fetchError}</p>
                      <ul className="list-disc pl-5 space-y-1 text-red-400/80">
                        <li>Ensure <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> are set in your Environment Variables.</li>
                        <li>Ensure this app's URL is added to your Supabase project's <strong>Authentication &gt; URL Configuration &gt; Site URL / Redirect URLs</strong> (or API Settings &gt; CORS Origins).</li>
                      </ul>
                    </div>
                  )}
                  {submitStatus === 'error' && !fetchError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                      There was an error submitting your details. Please try again.
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">Owner Name</label>
                      <input 
                        type="text" 
                        id="fullName" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="gymName" className="block text-sm font-medium text-slate-300">Gym Name</label>
                      <input 
                        type="text" 
                        id="gymName" 
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        placeholder="Iron Paradise"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="district" className="block text-sm font-medium text-slate-300">District</label>
                      <div className="relative">
                        <select 
                          id="district" 
                          value={districtId}
                          onChange={handleDistrictChange}
                          disabled={isLoadingDistricts}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="" className="bg-brand-black">
                            {isLoadingDistricts ? "Loading districts..." : "Select District"}
                          </option>
                          {districts.map(d => (
                            <option key={d.id} value={d.id} className="bg-brand-black">{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zone" className="block text-sm font-medium text-slate-300">Zone</label>
                      <div className="relative">
                        <select 
                          id="zone" 
                          value={zoneId}
                          onChange={(e) => setZoneId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          disabled={districtId === '' || isLoadingZones}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="" className="bg-brand-black">
                            {isLoadingZones ? "Loading zones..." : "Select Zone"}
                          </option>
                          {zones.map(z => (
                            <option key={z.id} value={z.id} className="bg-brand-black">{z.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300">WhatsApp Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-slate-400 sm:text-sm">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        id="whatsapp" 
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`flex-1 min-w-0 block w-full bg-black/50 border ${showPhoneError ? 'border-red-500' : 'border-white/10'} rounded-none rounded-r-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 ${showPhoneError ? 'focus:ring-red-500/50' : 'focus:ring-brand-blue'} focus:border-brand-blue transition-all`}
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                    {showPhoneError && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        Please enter a valid 10-digit WhatsApp number
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full bg-brand-blue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)] mt-4 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Reserve My Spot"
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">
                    By joining, you agree to our <a href="https://pollen-jaborosa-8f6.notion.site/Terms-Conditions-2ec5ca6f72a48004a930e7b134c33fcb" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Terms of Service</a> and <a href="https://pollen-jaborosa-8f6.notion.site/Privacy-Policy-2ec5ca6f72a48051b94df2dfd4005863" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <span className="font-display font-bold text-2xl tracking-tight mb-4 block">
                Flex<span className="text-brand-blue">Fit</span> <span className="text-white/70 font-medium text-xl">Partner</span>
              </span>
              <p className="text-slate-400 max-w-sm">
                Empowering gym owners in Kerala to maximize their revenue with zero upfront costs.
              </p>
            </div>
            <div className="flex flex-col md:items-end justify-center space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <a href="https://pollen-jaborosa-8f6.notion.site/Terms-Conditions-2ec5ca6f72a48004a930e7b134c33fcb" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
                <a href="https://pollen-jaborosa-8f6.notion.site/Privacy-Policy-2ec5ca6f72a48051b94df2dfd4005863" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
                <a href="https://wa.me/918113003620" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Support</a>
                <a href="mailto:flexfit.lab.app@gmail.com" className="hover:text-white transition-colors">Email Us</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} FlexFit Technologies. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                🔒 MSME Registered (UDYAM-KL-04-0077228)
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                🛡️ Secured by Razorpay
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                📍 Made in Kerala
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
