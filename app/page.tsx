"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, PawPrint, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    if (option === 'animals') {
      router.push('/animals');
    } else {
      // Placeholder for alphabets functionality
      alert('Alphabets section coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      <div className="relative z-10 text-center space-y-12 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            <h1 className="text-6xl font-bold text-white drop-shadow-lg">
              Learning Hub
            </h1>
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-xl text-white/90 font-medium">
            Choose your learning adventure!
          </p>
        </div>

        {/* Options Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Alphabets Card */}
          <Card 
            className={`p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              hoveredCard === 'alphabets' ? 'shadow-xl ring-4 ring-blue-300' : 'shadow-lg'
            } bg-white/95 backdrop-blur-sm border-0`}
            onMouseEnter={() => setHoveredCard('alphabets')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleOptionClick('alphabets')}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-800">Alphabets</h2>
                <p className="text-gray-600 text-lg">
                  Learn the ABC's with fun activities and sounds
                </p>
              </div>
              <div className="text-4xl">🔤</div>
            </div>
          </Card>

          {/* Animals Card */}
          <Card 
            className={`p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              hoveredCard === 'animals' ? 'shadow-xl ring-4 ring-green-300' : 'shadow-lg'
            } bg-white/95 backdrop-blur-sm border-0`}
            onMouseEnter={() => setHoveredCard('animals')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleOptionClick('animals')}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <PawPrint className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-800">Animals</h2>
                <p className="text-gray-600 text-lg">
                  Discover amazing animals and hear their sounds
                </p>
              </div>
              <div className="text-4xl">🦁</div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-white/80 text-sm">
          Click on any option to start your learning journey!
        </div>
      </div>
    </div>
  );
}