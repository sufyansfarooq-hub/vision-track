'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Check, TrendingUp, Target, Zap, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('error');
          setErrorMessage("You're already on the waitlist! 🎉");
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Navigation */}
      <nav className="border-b border-purple-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VisionTrack</span>
          </div>
          <Link
            href="/goals"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section - Bright & Airy */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Floating Gradient Orbs - Softer */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-300/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-7xl mx-auto w-full relative">
          
          {/* Launch Badge */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-purple-200 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-semibold">Launching February 2026</span>
            </div>
          </div>

          {/* Main Content - Wider Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center mb-20">
            
            {/* Left Side: Branding & Copy */}
            <div className="space-y-10">
              
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VisionTrack</div>
                  <div className="text-sm text-gray-600 tracking-wider font-medium">PERSONAL GROWTH COMMAND CENTER</div>
                </div>
              </div>
              
              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-6xl xl:text-7xl font-bold leading-[1.1] bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Be the CEO<br/>of Your Own Life
                </h1>
                <p className="text-2xl xl:text-3xl text-gray-700 leading-relaxed max-w-xl">
                  Turn vision boards into business plans. Track your progress like it's your bottom line.
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-lg text-gray-700">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                  <span className="font-medium">AI-Powered Goal Extraction</span>
                </div>
                <div className="flex items-center gap-4 text-lg text-gray-700">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                  <span className="font-medium">Dynamic Color-Fill Progress</span>
                </div>
                <div className="flex items-center gap-4 text-lg text-gray-700">
                  <div className="w-7 h-7 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                  <span className="font-medium">Real-Time Analytics Dashboard</span>
                </div>
              </div>

              {/* Waitlist Form */}
              <div className="pt-4">
                <form onSubmit={handleWaitlistSignup} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStatus('idle');
                      }}
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-4 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none text-gray-900 placeholder-gray-400 text-lg shadow-sm"
                      disabled={status === 'loading' || status === 'success'}
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading' || status === 'success'}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-lg shadow-lg hover:shadow-xl"
                    >
                      {status === 'loading' ? (
                        'Joining...'
                      ) : status === 'success' ? (
                        <>
                          <Check className="w-5 h-5" />
                          Joined!
                        </>
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  {status === 'success' && (
                    <p className="text-emerald-600 text-sm font-medium">
                      🎉 You're on the list! We'll notify you when we launch.
                    </p>
                  )}
                  
                  {status === 'error' && (
                    <p className="text-rose-600 text-sm font-medium">{errorMessage}</p>
                  )}
                </form>
                <p className="text-gray-600 text-sm mt-4">
                  Join <span className="text-purple-600 font-bold">500+</span> ambitious people building their future
                </p>
              </div>
            </div>
            
            {/* Right Side: App Mockup - Brighter */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative scale-110 lg:scale-125" style={{ animation: 'float 3s ease-in-out infinite' }}>
                
                {/* Phone Mockup */}
                <div className="w-80 bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] p-3 shadow-2xl border-2 border-purple-200 relative">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
                  
                  {/* Screen Content */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2rem] overflow-hidden h-[600px]">
                    
                    {/* Dashboard Preview */}
                    <div className="p-5 space-y-3">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-gray-900 font-bold text-lg">Analytics</div>
                        <div className="flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-emerald-600 text-[10px] ml-1 font-bold uppercase tracking-wide">Live</span>
                        </div>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white p-3.5 rounded-xl border-2 border-blue-100 shadow-sm">
                          <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wide font-semibold">Total Progress</div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-0.5">68%</div>
                          <div className="text-emerald-600 text-[10px] font-bold">+5.2%</div>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border-2 border-purple-100 shadow-sm">
                          <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wide font-semibold">Streak</div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent mb-0.5">14</div>
                          <div className="text-orange-600 text-[10px] font-bold">Days</div>
                        </div>
                      </div>
                      
                      {/* Vision Board Preview */}
                      <div className="bg-white p-3.5 rounded-xl border-2 border-purple-100 shadow-sm">
                        <div className="text-gray-900 text-xs font-bold mb-2.5 uppercase tracking-wide">Vision Board</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative overflow-hidden shadow-md">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent" style={{ height: '75%' }}></div>
                          </div>
                          <div className="h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg relative overflow-hidden shadow-md">
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-transparent" style={{ height: '60%' }}></div>
                          </div>
                          <div className="h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg relative overflow-hidden shadow-md">
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-transparent" style={{ height: '85%' }}></div>
                          </div>
                          <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg relative overflow-hidden shadow-md">
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-600 to-transparent" style={{ height: '50%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Chart */}
                      <div className="bg-white p-3.5 rounded-xl border-2 border-blue-100 shadow-sm">
                        <div className="text-gray-900 text-xs font-bold mb-2.5 uppercase tracking-wide">Progress Velocity</div>
                        <div className="flex items-end gap-1 h-20">
                          {[45, 60, 55, 75, 70, 85, 95].map((height, i) => (
                            <div 
                              key={i}
                              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t shadow-sm" 
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements - Brighter */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12" style={{ animation: 'float 3s ease-in-out infinite reverse' }}>
                  <div className="text-5xl">🎯</div>
                </div>
                
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-12" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                  <div className="text-5xl">📊</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating animation keyframes */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </section>

      {/* Problem Section - Bright Version */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        {/* Background Pattern - Lighter */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-full mb-6 shadow-sm">
                  <span className="text-sm text-rose-700 font-semibold">The Problem</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                  Your Vision Board is Collecting Dust
                </h2>
                
                <div className="space-y-6 text-lg text-gray-700">
                  <p className="leading-relaxed">
                    You spent hours creating it. Cut out images, wrote affirmations, pinned it on your wall.
                  </p>
                  <p className="leading-relaxed">
                    But three weeks later? <span className="text-gray-900 font-bold">It's just pretty wallpaper.</span>
                  </p>
                  <div className="border-l-4 border-purple-500 pl-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-r-xl shadow-sm">
                    <p className="text-xl leading-relaxed">
                      Vision boards inspire you for a day. <span className="text-gray-900 font-bold">VisionTrack drives you for a year.</span>
                    </p>
                  </div>
                </div>

                {/* Problem Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border-2 border-rose-200 shadow-sm">
                    <div className="text-3xl font-bold text-rose-600 mb-1">92%</div>
                    <div className="text-sm text-gray-600 font-medium">Give up on goals by February</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200 shadow-sm">
                    <div className="text-3xl font-bold text-orange-600 mb-1">3 weeks</div>
                    <div className="text-sm text-gray-600 font-medium">Before motivation fades</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual Comparison */}
            <div className="relative">
              
              {/* Before: Dusty Vision Board */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-rose-200/50 to-orange-200/50 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-gray-300 transform hover:scale-105 transition-transform duration-300 shadow-lg">
                  {/* Dusty Effect Overlay */}
                  <div className="absolute inset-0 bg-gray-400/40 rounded-2xl backdrop-blur-[2px]"></div>
                  
                  {/* Vision Board Grid */}
                  <div className="relative grid grid-cols-2 gap-4 mb-6">
                    {[
                      { emoji: '💪', label: 'Fitness' },
                      { emoji: '💼', label: 'Career' },
                      { emoji: '✈️', label: 'Travel' },
                      { emoji: '💰', label: 'Wealth' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/60 p-6 rounded-lg text-center opacity-40 shadow-sm">
                        <div className="text-4xl mb-2">{item.emoji}</div>
                        <div className="text-sm text-gray-600 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Dust particles */}
                  <div className="absolute top-4 right-4">
                    <div className="text-gray-500 text-xs font-medium">Last viewed: 21 days ago</div>
                  </div>

                  {/* Label */}
                  <div className="relative flex items-center justify-center gap-2 text-gray-600 text-sm font-medium">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    Traditional Vision Board
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center my-8">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-gray-300"></div>
                  <div className="px-4 py-2 bg-white border-2 border-gray-300 rounded-full text-sm font-bold text-gray-700 shadow-sm">
                    VS
                  </div>
                  <div className="h-px w-12 bg-gray-300"></div>
                </div>
              </div>

              {/* After: VisionTrack with Animation */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-300/50 to-purple-300/50 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-purple-300 transform hover:scale-105 transition-transform duration-300 shadow-xl">
                  
                  {/* Animated Progress Grid */}
                  <div className="relative grid grid-cols-2 gap-4 mb-6">
                    {[
                      { emoji: '💪', label: 'Fitness', progress: 75, color: 'from-emerald-400 to-emerald-600' },
                      { emoji: '💼', label: 'Career', progress: 60, color: 'from-blue-400 to-blue-600' },
                      { emoji: '✈️', label: 'Travel', progress: 40, color: 'from-purple-400 to-purple-600' },
                      { emoji: '💰', label: 'Wealth', progress: 85, color: 'from-yellow-400 to-yellow-600' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-lg text-center relative overflow-hidden group/card shadow-md border border-gray-200">
                        {/* Animated Progress Fill */}
                        <div 
                          className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-30 transition-all duration-1000 ease-out`}
                          style={{
                            transform: `translateY(${100 - item.progress}%)`,
                            animation: `fillUp${i} 2s ease-out infinite alternate`
                          }}
                        ></div>
                        
                        <div className="relative z-10">
                          <div className="text-4xl mb-2">{item.emoji}</div>
                          <div className="text-sm text-gray-800 font-semibold mb-1">{item.label}</div>
                          <div className="text-xs font-bold text-emerald-600">{item.progress}%</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-600 text-xs font-bold">LIVE TRACKING</span>
                  </div>

                  {/* Label */}
                  <div className="relative flex items-center justify-center gap-2 text-purple-600 text-sm font-bold">
                    <Sparkles className="w-4 h-4" />
                    VisionTrack Dashboard
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -right-4 top-1/2 transform translate-x-full -translate-y-1/2 hidden xl:block">
                <div className="space-y-4">
                  <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-emerald-600" />
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">+127%</div>
                        <div className="text-xs text-gray-600 font-medium">Goal completion</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-4 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">14 days</div>
                        <div className="text-xs text-gray-600 font-medium">Avg. streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Add keyframe animations */}
        <style jsx>{`
          @keyframes fillUp0 {
            from { transform: translateY(100%); }
            to { transform: translateY(${100 - 75}%); }
          }
          @keyframes fillUp1 {
            from { transform: translateY(100%); }
            to { transform: translateY(${100 - 60}%); }
          }
          @keyframes fillUp2 {
            from { transform: translateY(100%); }
            to { transform: translateY(${100 - 40}%); }
          }
          @keyframes fillUp3 {
            from { transform: translateY(100%); }
            to { transform: translateY(${100 - 85}%); }
          }
        `}</style>
      </section>

      {/* How It Works - Bright */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white border-2 border-blue-200 rounded-full mb-6 shadow-sm">
              <span className="text-sm text-blue-700 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-700">Four steps from vision to victory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Vision Board',
                description: 'Take a photo of your vision board or upload an existing image',
                icon: <Target className="w-6 h-6" />,
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-300',
                delay: '0s',
              },
              {
                step: '2',
                title: 'AI Extracts Your Goals',
                description: 'Our AI identifies distinct goals and creates trackable regions',
                icon: <Sparkles className="w-6 h-6" />,
                color: 'from-purple-400 to-pink-500',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-300',
                delay: '0.2s',
              },
              {
                step: '3',
                title: 'Track Progress Visually',
                description: 'Watch your vision board fill with color as you complete milestones',
                icon: <TrendingUp className="w-6 h-6" />,
                color: 'from-emerald-400 to-teal-500',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-300',
                delay: '0.4s',
              },
              {
                step: '4',
                title: 'Analyze Like a Business',
                description: 'Dashboard metrics, streaks, velocity—treat your growth like KPIs',
                icon: <Zap className="w-6 h-6" />,
                color: 'from-orange-400 to-red-500',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-300',
                delay: '0.6s',
              },
            ].map((item, i) => (
              <div key={i} className="relative group" style={{ animationDelay: item.delay }}>
                {/* Connecting Arrow (except last) */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-8 z-0">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                )}

                {/* Card */}
                <div className={`relative ${item.bgColor} p-6 rounded-xl border-2 ${item.borderColor} h-full transform hover:scale-105 hover:shadow-xl transition-all duration-300`}>
                  
                  {/* Glow effect on hover */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    {/* Step Number Badge */}
                    <div className={`absolute -top-3 -right-3 w-10 h-10 bg-white border-2 ${item.borderColor} rounded-full flex items-center justify-center font-bold text-lg text-gray-900 shadow-md group-hover:scale-110 transition-transform`}>
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-700 transition-all">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Animated Progress Bar */}
                    <div className="mt-4 h-1 bg-white rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-700 text-lg mb-4">
              From upload to insights in <span className="text-gray-900 font-bold">under 2 minutes</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Check className="w-5 h-5" />
              <span className="font-semibold">No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bright */}
      <section className="py-20 px-6 relative overflow-hidden bg-white">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-full mb-6 shadow-sm">
              <span className="text-sm text-purple-700 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Your Personal Growth Command Center
            </h2>
            <p className="text-xl text-gray-700">Everything you need to turn dreams into data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Dynamic Color-Fill Animation',
                description: 'Your vision board literally comes to life. Watch regions fill with color as you progress—instant visual gratification.',
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50',
                borderColor: 'border-blue-200',
                demo: '🎨',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Analytics Dashboard',
                description: 'Track total achievement, current streak, progress velocity. Your goals, measured like quarterly earnings.',
                color: 'from-emerald-400 to-teal-500',
                bgColor: 'from-emerald-50 to-teal-50',
                borderColor: 'border-emerald-200',
                demo: '📊',
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Smart Milestone Tracking',
                description: 'Break big goals into milestones. Check them off. See automatic snapshots at 25%, 50%, 75%, 100%.',
                color: 'from-purple-400 to-pink-500',
                bgColor: 'from-purple-50 to-pink-50',
                borderColor: 'border-purple-200',
                demo: '✓',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Progress Gallery',
                description: 'Visual timeline of your transformation. Compare where you started vs where you are. Share your wins.',
                color: 'from-orange-400 to-red-500',
                bgColor: 'from-orange-50 to-red-50',
                borderColor: 'border-orange-200',
                demo: '📸',
              },
              {
                icon: <Check className="w-8 h-8" />,
                title: 'Daily Check-Ins',
                description: 'Build a streak. Stay accountable. Reflect on progress. Make personal growth a daily habit.',
                color: 'from-yellow-400 to-orange-500',
                bgColor: 'from-yellow-50 to-orange-50',
                borderColor: 'border-yellow-200',
                demo: '🔥',
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'AI-Powered Setup',
                description: 'Upload once, let AI do the work. Extracts goals, suggests milestones, organizes everything.',
                color: 'from-indigo-400 to-purple-500',
                bgColor: 'from-indigo-50 to-purple-50',
                borderColor: 'border-indigo-200',
                demo: '🤖',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0
                }}
              >
                {/* Hover Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className={`relative bg-gradient-to-br ${feature.bgColor} p-8 rounded-xl border-2 ${feature.borderColor} h-full transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                  
                  {/* Demo Emoji - Floating */}
                  <div className="absolute -top-4 -right-4 text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                    {feature.demo}
                  </div>

                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white transform group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    
                    {/* Animated Ring */}
                    <div className={`absolute inset-0 w-16 h-16 border-2 border-current rounded-xl animate-ping opacity-0 group-hover:opacity-100`} style={{ color: feature.color.split(' ')[1] }}></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-700 transition-all">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" style={{ color: feature.color.split(' ')[1] }} />
                  </div>

                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} group-hover:h-2 transition-all duration-300 rounded-b-xl`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-purple-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    10x
                  </div>
                  <div className="text-gray-700 font-medium">More Accountability</div>
                  <div className="text-xs text-gray-600">vs traditional vision boards</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    2 min
                  </div>
                  <div className="text-gray-700 font-medium">To Full Setup</div>
                  <div className="text-xs text-gray-600">AI does the heavy lifting</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-gray-700 font-medium">Progress Tracking</div>
                  <div className="text-xs text-gray-600">Never lose momentum</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add fade-in animation */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Social Proof - Bright */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Join the Movement</h2>
            <p className="text-xl text-gray-700">Ambitious people building their future</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                stat: '500+',
                label: 'Waitlist Members',
                color: 'from-blue-500 to-purple-600',
              },
              {
                stat: 'Feb 2026',
                label: 'Launch Date',
                color: 'from-purple-500 to-pink-600',
              },
              {
                stat: '100%',
                label: 'Free to Start',
                color: 'from-emerald-500 to-teal-600',
              },
            ].map((item, i) => (
              <div key={i} className="text-center bg-white p-8 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`text-5xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-2`}>
                  {item.stat}
                </div>
                <div className="text-gray-700 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Bright */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            The Best Investment You'll Ever Make is in Yourself
          </h2>
          <p className="text-xl text-gray-700 mb-12">
            Treat it like one. Join the waitlist for early access.
          </p>

          <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus('idle');
                }}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {status === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    Joined!
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer - Bright */}
      <footer className="border-t-2 border-purple-200 py-12 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center text-gray-700">
          <p className="mb-4 font-medium">© 2026 VisionTrack. Built for ambitious goal-setters.</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/goals" className="hover:text-purple-600 transition font-medium">App</Link>
            <span>•</span>
            <a href="https://twitter.com" className="hover:text-purple-600 transition font-medium">Twitter</a>
            <span>•</span>
            <a href="https://linkedin.com" className="hover:text-purple-600 transition font-medium">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
