import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Sparkles, 
  Code2, 
  Terminal as TerminalIcon, 
  Cpu, 
  Layers, 
  Compass, 
  Coffee, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeBackground from '../components/ThreeBackground';
import AlgorithmBackground from '../components/AlgorithmBackground';

gsap.registerPlugin(ScrollTrigger);

const TECH_STACK = [
  { name: 'C++', category: 'Competitive Programming', color: '#64B5F6' },
  { name: 'JavaScript', category: 'Web Ecosystem', color: '#F7A258' },
  { name: 'React', category: 'Frontend Architecture', color: '#64B5F6' },
  { name: 'Node.js', category: 'Backend Systems', color: '#86E18B' },
  { name: 'Python', category: 'Scripting & AI', color: '#C6F432' },
  { name: 'Tailwind CSS', category: 'UI Architecture', color: '#64B5F6' },
  { name: 'GSAP', category: 'Creative Motion', color: '#86E18B' },
  { name: 'Three.js', category: '3D Web Experiences', color: '#F4F4F0' },
  { name: 'MongoDB', category: 'Data Stores', color: '#86E18B' },
  { name: 'Git', category: 'Version Control', color: '#F7A258' }
];

export default function Creator() {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const containerRef = useRef(null);

  // Animation Section Refs
  const heroRef = useRef(null);
  const scrollSectionRef = useRef(null);
  const codeLeftRef = useRef(null);
  const codeRightRef = useRef(null);
  const parallaxBgRef = useRef(null);
  const terminalWindowRef = useRef(null);
  const mottoContainerRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const techSectionRef = useRef(null);
  const terminalSectionRef = useRef(null);

  // Scroll to Code Signature Section
  const scrollToSignature = () => {
    scrollSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // GSAP Animations and ScrollTriggers
  useLayoutEffect(() => {
    // Ensure document and body allow natural vertical scrolling
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // 1. HERO ENTRANCE TIMELINE
      const heroTl = gsap.timeline();
      heroTl
        .from('.hero-badge', {
          opacity: 0,
          y: -25,
          duration: 0.8,
          ease: 'power3.out'
        })
        .from('.hero-title-word', {
          opacity: 0,
          y: 70,
          stagger: 0.12,
          duration: 1.1,
          ease: 'power4.out'
        }, '-=0.4')
        .from('.hero-text', {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-actions', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.4');

      // 2. SIGNATURE CODE SCROLL ANIMATION PINNED TIMELINE
      // Sequences through SCROLL 1, 2, 3, 4 with scrub
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSectionRef.current,
          start: 'top top',
          end: '+=2500', // Pinned scroll track for rich multi-stage scrub
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });

      // SCROLL 1: Code lines appear from left and right edges
      scrollTl
        .fromTo(
          codeLeftRef.current,
          { x: -400, opacity: 0, rotationY: 25 },
          { x: 0, opacity: 1, rotationY: 0, duration: 1.5, ease: 'power2.out' },
          'stage1'
        )
        .fromTo(
          codeRightRef.current,
          { x: 400, opacity: 0, rotationY: -25 },
          { x: 0, opacity: 1, rotationY: 0, duration: 1.5, ease: 'power2.out' },
          'stage1'
        );

      // SCROLL 2: Code fragments move vertically and horizontally (parallax depth)
      scrollTl
        .to(codeLeftRef.current, {
          y: -120,
          x: -60,
          scale: 0.9,
          opacity: 0.4,
          duration: 2,
          ease: 'none'
        }, 'stage2')
        .to(codeRightRef.current, {
          y: -100,
          x: 60,
          scale: 0.9,
          opacity: 0.4,
          duration: 2,
          ease: 'none'
        }, 'stage2')
        .fromTo('.floating-token', {
          y: 100,
          opacity: 0
        }, {
          y: -150,
          opacity: 0.8,
          stagger: 0.2,
          duration: 2,
          ease: 'none'
        }, 'stage2');

      // SCROLL 3: Large animated terminal window comes into focus
      scrollTl.fromTo(
        terminalWindowRef.current,
        { scale: 0.6, opacity: 0, y: 250, rotationX: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 2.5,
          ease: 'power3.out'
        },
        'stage3'
      );

      // SCROLL 4: Code characters assemble into "BUILD. BREAK. LEARN. REPEAT."
      scrollTl
        .to(terminalWindowRef.current, {
          scale: 0.92,
          opacity: 0.35,
          y: -80,
          duration: 1.5
        }, 'stage4')
        .fromTo(
          mottoContainerRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1 },
          'stage4'
        )
        .fromTo(
          '.motto-char',
          {
            opacity: 0.05,
            y: 40,
            color: '#292D34',
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.04,
            duration: 2,
            ease: 'back.out(2)'
          },
          'stage4'
        );

      // 3. ABOUT ME CARDS STAGGERED REVEAL
      gsap.from('.about-card', {
        opacity: 0,
        y: 80,
        scale: 0.95,
        stagger: 0.25,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutSectionRef.current,
          start: 'top 75%'
        }
      });

      // 4. TECH STACK FLOATING TAGS REVEAL
      gsap.from('.tech-tag', {
        opacity: 0,
        scale: 0.7,
        y: 35,
        stagger: 0.07,
        duration: 0.7,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: techSectionRef.current,
          start: 'top 80%'
        }
      });

      // 5. TERMINAL COMMANDS REVEAL
      gsap.from('.terminal-cmd-block', {
        opacity: 0,
        x: -30,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: terminalSectionRef.current,
          start: 'top 75%'
        }
      });
    }, containerRef);

    // Refresh ScrollTrigger after DOM measurement
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('pranavraj.dev@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#080B0A] text-[#F4F4F0] font-sans selection:bg-[#C6F432] selection:text-[#080B0A] relative overflow-x-hidden"
    >
      {/* Interactive Three.js Background Canvas */}
      <ThreeBackground />

      {/* Atmospheric Coding & Mathematical Algorithm Background Typing Engine */}
      <AlgorithmBackground />

      {/* Top Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#292D34]/60 bg-[#080B0A]/85 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-mono font-bold text-[#929B95] hover:text-[#C6F432] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <img src="/oa-logo.jpg" alt="OA Logo" className="h-6 w-auto object-contain rounded" />
            <span className="hidden sm:inline">OA IDE</span>
          </button>
          <span className="text-[#292D34]">/</span>
          <span className="text-xs font-mono font-bold tracking-wider text-[#F4F4F0]">
            CREATOR EXPERIENCE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111418] border border-[#292D34] text-[11px] font-mono text-[#929B95]">
            <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>Building Next-Gen Web</span>
          </div>

          <Link
            to="/"
            className="text-xs font-mono font-bold px-3.5 py-1.5 rounded bg-[#C6F432] text-[#080B0A] hover:bg-[#b4e326] transition-all flex items-center gap-1 shadow-sm shadow-[#C6F432]/25"
          >
            <span>LAUNCH IDE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section 
        ref={heroRef}
        className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-20 pb-16 relative z-10 max-w-7xl mx-auto"
      >
        {/* Top Tagline Badge */}
        <div className="hero-badge inline-flex items-center gap-2 mb-6 self-start">
          <span className="px-3.5 py-1.5 rounded-full bg-[#111418] border border-[#292D34] text-[11px] font-mono tracking-wider uppercase text-[#C6F432] flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C6F432]" />
            OA / CREATOR · A LITTLE SOMETHING ABOUT THE HUMAN BEHIND THE CODE
          </span>
        </div>

        {/* Main Oversized Headline */}
        <div className="space-y-1 mb-6">
          <div className="overflow-hidden">
            <h1 className="hero-title-word text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none text-[#F4F4F0]">
              YO, I'M
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="hero-title-word text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#C6F432] via-[#86E18B] to-[#64B5F6] drop-shadow-sm">
              PRANAV.
            </h1>
          </div>
        </div>

        {/* Humorous & Deep Subtitles */}
        <div className="max-w-2xl space-y-3 mb-10">
          <p className="hero-text text-lg sm:text-2xl text-[#F4F4F0] font-medium leading-relaxed">
            "I build things for the web, break things, fix things, and occasionally wonder why the code worked yesterday."
          </p>
          <p className="hero-text text-sm sm:text-base text-[#929B95] font-normal leading-relaxed">
            I'm Pranav — a developer, designer and builder exploring the intersection of technology, creativity and the internet.
          </p>
        </div>

        {/* Action Buttons & Status */}
        <div className="hero-actions flex flex-wrap items-center gap-4">
          <button
            onClick={scrollToSignature}
            className="px-6 py-3.5 rounded bg-[#C6F432] hover:bg-[#b4e326] active:scale-95 text-[#080B0A] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#C6F432]/25 cursor-pointer"
          >
            <span>EXPLORE MY WORLD</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>

          <Link
            to="/"
            className="px-6 py-3.5 rounded bg-[#111418] hover:bg-[#171B20] active:scale-95 text-[#F4F4F0] border border-[#292D34] hover:border-[#C6F432]/60 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>BACK TO OA IDE</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C6F432]" />
          </Link>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#292D34] bg-[#111418]/80 text-xs font-mono text-[#929B95]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6F432] animate-ping" />
            <span className="text-[11px] font-semibold text-[#F4F4F0]">
              CURRENTLY BUILDING SOMETHING COOL.
            </span>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE PINNED GSAP SCROLLTRIGGER SHOWCASE (SCROLL 1, 2, 3, 4) */}
      <section 
        ref={scrollSectionRef}
        className="h-screen w-full relative z-20 flex flex-col justify-center items-center px-6 md:px-16 overflow-hidden bg-[#080B0A]/95 border-y border-[#292D34]/40"
      >
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#C6F432] flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3 h-3 text-[#C6F432]" />
            SCROLL TRIGGERED CODEFLOW (SCROLL DOWN)
          </span>
        </div>

        {/* Background Floating Parallax Tokens */}
        <div ref={parallaxBgRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="floating-token absolute top-[20%] left-[8%] text-[#64B5F6]/40 font-mono text-sm">
            &lt;div className="cyber-flow"&gt;
          </div>
          <div className="floating-token absolute top-[65%] right-[10%] text-[#C6F432]/40 font-mono text-sm">
            import &#123; createReality &#125; from 'imagination';
          </div>
          <div className="floating-token absolute top-[35%] right-[15%] text-[#F7A258]/35 font-mono text-xs">
            while(alive) &#123; code(); build(); &#125;
          </div>
          <div className="floating-token absolute bottom-[15%] left-[12%] text-[#86E18B]/40 font-mono text-xs">
            export default function Future() &#123; ... &#125;
          </div>
        </div>

        {/* STAGE 1 & 2: Animated Code Fragments gliding from Left and Right */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Left Fragment: const pranav = { ... } */}
          <div 
            ref={codeLeftRef}
            className="p-5 rounded-2xl bg-[#111418]/95 border border-[#292D34] shadow-2xl font-mono text-xs text-[#929B95] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#292D34] mb-3 text-[11px]">
              <span className="text-[#C6F432] font-bold">pranav.config.js</span>
              <span className="text-[#929B95]/60">UTF-8 · JavaScript</span>
            </div>
            <pre className="text-[#F4F4F0] leading-relaxed whitespace-pre-wrap font-mono">
              <span className="text-[#C6F432]">const</span> <span className="text-[#64B5F6]">pranav</span> = {'{\n'}
              {'  '}name: <span className="text-[#86E18B]">"Pranav"</span>,{'\n'}
              {'  '}role: <span className="text-[#86E18B]">"Developer"</span>,{'\n'}
              {'  '}interests: [{'\n'}
              {'    '}<span className="text-[#86E18B]">"Web Development"</span>,{'\n'}
              {'    '}<span className="text-[#86E18B]">"Competitive Programming"</span>,{'\n'}
              {'    '}<span className="text-[#86E18B]">"AI & ML"</span>,{'\n'}
              {'    '}<span className="text-[#86E18B]">"Building Cool Stuff"</span>{'\n'}
              {'  '}],{'\n'}
              {'  '}currently: <span className="text-[#86E18B]">"Turning ideas into reality"</span>{'\n'}
              {'};'}
            </pre>
          </div>

          {/* Right Fragment: function buildSomething() { ... } */}
          <div 
            ref={codeRightRef}
            className="p-5 rounded-2xl bg-[#111418]/95 border border-[#292D34] shadow-2xl font-mono text-xs text-[#929B95] backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#292D34] mb-3 text-[11px]">
                <span className="text-[#64B5F6] font-bold">pipeline.ts</span>
                <span className="text-[#929B95]/60">Async Function</span>
              </div>
              <pre className="text-[#F4F4F0] leading-relaxed whitespace-pre-wrap font-mono">
                <span className="text-[#C6F432]">function</span> <span className="text-[#F7A258]">buildSomething</span>() {'{\n'}
                {'  '}<span className="text-[#C6F432]">return</span> <span className="text-[#86E18B]">"Something interesting is loading..."</span>;{'\n'}
                {'}'}
              </pre>
            </div>
            <div className="pt-4 border-t border-[#292D34] text-[11px] text-[#929B95] flex items-center justify-between">
              <span>Status: Execution Pipe</span>
              <span className="text-[#C6F432] font-semibold">● Live Output</span>
            </div>
          </div>
        </div>

        {/* STAGE 3: Large Animated Terminal Window */}
        <div 
          ref={terminalWindowRef}
          className="w-full max-w-4xl absolute z-20 rounded-2xl border border-[#292D34] bg-[#0E1211] overflow-hidden shadow-2xl backdrop-blur-2xl"
          style={{ transformOrigin: 'center center' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#171B20] border-b border-[#292D34] flex items-center justify-between select-none">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-xs font-mono text-[#929B95] ml-2">pranav@oa-core:~ (zsh)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#C6F432] px-2 py-0.5 rounded bg-[#C6F432]/10 border border-[#C6F432]/30">
              TERMINAL V2.4
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 md:p-8 font-mono text-xs sm:text-sm space-y-3">
            <div className="text-[#929B95]">
              <span className="text-[#C6F432] font-bold">$</span> cat manifest.json
            </div>
            <pre className="text-[#F4F4F0] bg-[#080B0A] p-4 rounded-xl border border-[#292D34] overflow-x-auto leading-relaxed">
{`{
  "developer": "OG yng.pranav4",
  "ide": "OA Online IDE",
  "engine": "Judge0 Sandboxed Core",
  "stack": ["React 19", "Monaco", "Three.js", "GSAP ScrollTrigger"],
  "mission": "No-bloat, developer-first coding environments"
}`}
            </pre>
          </div>
        </div>

        {/* STAGE 4: Assembled Motto "BUILD. BREAK. LEARN. REPEAT." */}
        <div 
          ref={mottoContainerRef}
          className="absolute z-30 text-center px-4 pointer-events-none"
        >
          <div className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-tight flex flex-wrap justify-center gap-x-4 md:gap-x-6">
            <span className="inline-block">
              {'BUILD.'.split('').map((c, i) => (
                <span key={i} className="motto-char inline-block text-[#F4F4F0]">{c}</span>
              ))}
            </span>
            <span className="inline-block">
              {'BREAK.'.split('').map((c, i) => (
                <span key={i} className="motto-char inline-block text-[#EF4444]">{c}</span>
              ))}
            </span>
            <span className="inline-block">
              {'LEARN.'.split('').map((c, i) => (
                <span key={i} className="motto-char inline-block text-[#64B5F6]">{c}</span>
              ))}
            </span>
            <span className="inline-block">
              {'REPEAT.'.split('').map((c, i) => (
                <span key={i} className="motto-char inline-block text-[#C6F432]">{c}</span>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* 3. ABOUT ME SECTION */}
      <section 
        ref={aboutSectionRef}
        className="py-28 px-6 md:px-16 lg:px-24 relative z-10 max-w-7xl mx-auto border-t border-[#292D34]/40"
      >
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#C6F432]">
            // ABOUT ME
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F4F0]">
            NOT JUST A GUY WHO WRITES CODE.
          </h2>
          <p className="text-base sm:text-lg text-[#929B95] leading-relaxed">
            I'm an engineering student who loves building things beyond the classroom. From experimenting with frontend experiences to competitive programming and AI-powered projects, I enjoy turning random ideas into something real.
          </p>
        </div>

        {/* 3 Visual Interest Cards */}
        <div className="about-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: THE BUILDER */}
          <div className="about-card p-6 md:p-8 rounded-2xl bg-[#111418]/90 border border-[#292D34] hover:border-[#C6F432]/60 transition-all duration-300 group hover:-translate-y-2 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#C6F432] tracking-wider uppercase block mb-1">
                01 — THE BUILDER
              </span>
              <h3 className="text-xl font-bold text-[#F4F4F0] mb-2">
                Crafting Products
              </h3>
              <p className="text-sm text-[#929B95] leading-relaxed">
                Turning ideas into websites, tools and products. Obsessed with fast feedback loops, clean architecture, and delightful interactions.
              </p>
            </div>
            <div className="pt-6 border-t border-[#292D34]/60 text-[11px] font-mono text-[#929B95] flex items-center gap-1.5 mt-6">
              <span>Websites</span> · <span>Tools</span> · <span>Products</span>
            </div>
          </div>

          {/* Card 2: THE PROBLEM SOLVER */}
          <div className="about-card p-6 md:p-8 rounded-2xl bg-[#111418]/90 border border-[#292D34] hover:border-[#64B5F6]/60 transition-all duration-300 group hover:-translate-y-2 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#64B5F6]/10 border border-[#64B5F6]/30 flex items-center justify-center text-[#64B5F6] mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#64B5F6] tracking-wider uppercase block mb-1">
                02 — THE PROBLEM SOLVER
              </span>
              <h3 className="text-xl font-bold text-[#F4F4F0] mb-2">
                Algorithms & Logic
              </h3>
              <p className="text-sm text-[#929B95] leading-relaxed">
                Competitive programming, algorithms and logic. Loving the thrill of optimization, runtime reduction, and finding elegant mathematical patterns.
              </p>
            </div>
            <div className="pt-6 border-t border-[#292D34]/60 text-[11px] font-mono text-[#929B95] flex items-center gap-1.5 mt-6">
              <span>C++17</span> · <span>Data Structures</span> · <span>Complexity</span>
            </div>
          </div>

          {/* Card 3: THE EXPLORER */}
          <div className="about-card p-6 md:p-8 rounded-2xl bg-[#111418]/90 border border-[#292D34] hover:border-[#86E18B]/60 transition-all duration-300 group hover:-translate-y-2 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#86E18B]/10 border border-[#86E18B]/30 flex items-center justify-center text-[#86E18B] mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#86E18B] tracking-wider uppercase block mb-1">
                03 — THE EXPLORER
              </span>
              <h3 className="text-xl font-bold text-[#F4F4F0] mb-2">
                Creative Tech & AI
              </h3>
              <p className="text-sm text-[#929B95] leading-relaxed">
                AI, machine learning and new technologies. Pushing the boundaries of web experiences with 3D graphics, generative UI and automated workflows.
              </p>
            </div>
            <div className="pt-6 border-t border-[#292D34]/60 text-[11px] font-mono text-[#929B95] flex items-center gap-1.5 mt-6">
              <span>Three.js</span> · <span>AI / ML</span> · <span>Next-Gen Web</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECH STACK SECTION */}
      <section 
        ref={techSectionRef}
        className="py-24 px-6 md:px-16 lg:px-24 relative z-10 max-w-7xl mx-auto border-t border-[#292D34]/40"
      >
        <div className="max-w-2xl mb-12 space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#C6F432]">
            // TECH STACK
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F4F0]">
            MY CURRENT TOOLKIT.
          </h2>
          <p className="text-sm text-[#929B95]">
            An interactive constellation of technologies I wield to build ideas into reality.
          </p>
        </div>

        {/* Floating Constellation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="tech-tag p-4 rounded-xl bg-[#111418]/90 border border-[#292D34] hover:border-[#C6F432] hover:bg-[#171B20] transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-[#C6F432]/10 hover:-translate-y-1.5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#929B95] uppercase">
                  {tech.category}
                </span>
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: tech.color }} 
                />
              </div>
              <div className="text-base font-bold text-[#F4F4F0] group-hover:text-[#C6F432] transition-colors">
                {tech.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PERSONALITY SECTION (PLAYFUL TERMINAL) */}
      <section 
        ref={terminalSectionRef}
        className="py-24 px-6 md:px-16 lg:px-24 relative z-10 max-w-5xl mx-auto border-t border-[#292D34]/40"
      >
        <div className="mb-10 space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#C6F432]">
            // PROFILE TERMINAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Developer Blueprint
          </h2>
        </div>

        <div className="rounded-2xl border border-[#292D34] bg-[#0E1211]/95 overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#171B20] border-b border-[#292D34] flex items-center justify-between select-none">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-xs font-mono text-[#929B95] ml-2">pranav_profile.sh</span>
            </div>
            <span className="text-[10px] font-mono text-[#929B95]">zsh · active</span>
          </div>

          <div className="p-6 md:p-8 font-mono text-xs sm:text-sm space-y-6">
            {/* $ whoami */}
            <div className="terminal-cmd-block space-y-1">
              <div className="text-[#929B95] flex items-center gap-2">
                <span className="text-[#C6F432] font-bold">$</span> whoami
              </div>
              <div className="text-[#F4F4F0] pl-4 font-semibold text-base">
                &gt; Pranav Raj
              </div>
            </div>

            {/* $ current_status */}
            <div className="terminal-cmd-block space-y-1">
              <div className="text-[#929B95] flex items-center gap-2">
                <span className="text-[#C6F432] font-bold">$</span> current_status
              </div>
              <div className="text-[#86E18B] pl-4">
                &gt; Building. Learning. Experimenting.
              </div>
            </div>

            {/* $ interests */}
            <div className="terminal-cmd-block space-y-1">
              <div className="text-[#929B95] flex items-center gap-2">
                <span className="text-[#C6F432] font-bold">$</span> interests
              </div>
              <div className="text-[#F4F4F0] pl-4 space-y-0.5">
                <div>&gt; Web development</div>
                <div>&gt; Competitive programming</div>
                <div>&gt; AI / ML</div>
                <div>&gt; Creative coding</div>
              </div>
            </div>

            {/* $ motto */}
            <div className="terminal-cmd-block space-y-1">
              <div className="text-[#929B95] flex items-center gap-2">
                <span className="text-[#C6F432] font-bold">$</span> motto
              </div>
              <div className="text-[#C6F432] pl-4 font-semibold italic text-sm sm:text-base">
                &gt; "Ideas are cheap. Building them is the fun part."
              </div>
            </div>

            {/* Prompt with Blinking Cursor */}
            <div className="pt-2 flex items-center gap-2 text-[#929B95]">
              <span className="text-[#C6F432] font-bold">$</span>
              <span className="w-2.5 h-4 bg-[#C6F432] animate-pulse inline-block" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING SECTION */}
      <section className="py-28 px-6 md:px-16 lg:px-24 relative z-10 max-w-5xl mx-auto text-center space-y-8 border-t border-[#292D34]/40">
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#C6F432] block">
          // END OF FILE
        </span>

        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-tight text-[#F4F4F0]">
          ANYWAY,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6F432] to-[#64B5F6]">
            BACK TO BUILDING.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-[#929B95] max-w-xl mx-auto leading-relaxed">
          Thanks for scrolling through my little corner of the internet.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="px-8 py-4 rounded-xl bg-[#C6F432] hover:bg-[#b4e326] active:scale-95 text-[#080B0A] font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#C6F432]/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO OA IDE</span>
          </Link>

          <button
            onClick={handleCopyEmail}
            className="px-8 py-4 rounded-xl bg-[#111418] hover:bg-[#171B20] active:scale-95 text-[#F4F4F0] border border-[#292D34] hover:border-[#C6F432]/50 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            {copiedEmail ? (
              <>
                <Check className="w-4 h-4 text-[#C6F432]" />
                <span className="text-[#C6F432]">EMAIL COPIED!</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4 text-[#C6F432]" />
                <span>SAY HELLO</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Signature */}
        <div className="pt-20 text-xs font-mono text-[#929B95] space-y-2 border-t border-[#292D34]/30 mt-16">
          <p>Made with curiosity, caffeine &amp; questionable debugging decisions.</p>
          <p className="font-bold text-[#F4F4F0]">
            OG <span className="text-[#C6F432]">yng.pranav4</span>
          </p>
        </div>
      </section>
    </div>
  );
}
