"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, PawPrint, Sparkles, Star, Heart } from 'lucide-react';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300/30 rounded-full animate-bounce"></div>
      <div className="absolute top-32 right-20 w-12 h-12 bg-pink-300/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-300/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-40 right-10 w-14 h-14 bg-blue-300/30 rounded-full animate-pulse delay-150"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="text-center pt-8 pb-4 md:pt-16 md:pb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            <Star className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 animate-spin" />
            <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg">
              Kid&apos;s Learning
            </h1>
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-red-300 animate-pulse" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {/* Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Animals Card - First and Featured */}
              <Card 
                className={`relative p-6 md:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  hoveredCard === 'animals' ? 'shadow-2xl ring-4 ring-green-400' : 'shadow-xl'
                } bg-gradient-to-br from-green-100 to-emerald-100 border-0 rounded-3xl overflow-hidden`}
                onMouseEnter={() => setHoveredCard('animals')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleOptionClick('animals')}
              >
                <div className="space-y-4 md:space-y-6 text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <PawPrint className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Animals</h2>
                  <div className="flex justify-center space-x-3 text-3xl md:text-4xl">
                    <span>🐸</span>
                    <span>🐄</span>
                    <span>🐱</span>
                  </div>
                </div>
              </Card>

              {/* Alphabets Card - Coming Soon */}
              <Card 
                className={`relative p-6 md:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  hoveredCard === 'alphabets' ? 'shadow-2xl ring-4 ring-blue-400' : 'shadow-xl'
                } bg-gradient-to-br from-blue-100 to-indigo-100 border-0 rounded-3xl overflow-hidden opacity-75`}
                onMouseEnter={() => setHoveredCard('alphabets')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleOptionClick('alphabets')}
              >
                <div className="absolute top-4 right-4">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    COMING SOON
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6 text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Alphabets</h2>
                  <div className="flex justify-center space-x-3 text-3xl md:text-4xl">
                    <span>🅰️</span>
                    <span>🅱️</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}