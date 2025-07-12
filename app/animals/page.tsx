"use client";

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Home, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import animalsData from '@/data/animals.json';

interface Animal {
  name: string;
  image: string;
  sound: string;
}

interface AnimalSlide {
  letter: string;
  animals: Animal[];
}

export default function AnimalsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const router = useRouter();

  const animalSlides: AnimalSlide[] = animalsData.animals;
  const totalPages = animalSlides.length;

  // Stop any playing audio
  const stopAllAudio = () => {
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop Web Audio API oscillator
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      oscillatorRef.current = null;
    }

    // Close audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setPlayingSound(null);
  };

  // Generate fallback sound using Web Audio API
  const generateAnimalSound = (animal: string) => {
    // Stop any existing audio first
    stopAllAudio();

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillatorRef.current = oscillator;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different animals
    const soundMap: { [key: string]: { freq: number; duration: number; type: OscillatorType } } = {
      cat: { freq: 800, duration: 0.5, type: 'sine' },
      dog: { freq: 400, duration: 0.8, type: 'sawtooth' },
      cow: { freq: 200, duration: 1.2, type: 'sawtooth' },
      duck: { freq: 600, duration: 0.6, type: 'square' },
      elephant: { freq: 150, duration: 1.5, type: 'sine' },
      bee: { freq: 1000, duration: 0.4, type: 'sawtooth' },
      frog: { freq: 300, duration: 0.7, type: 'sine' },
      chicken: { freq: 700, duration: 0.5, type: 'square' },
      bear: { freq: 250, duration: 1.0, type: 'sawtooth' },
      fox: { freq: 500, duration: 0.6, type: 'sine' },
      alligator: { freq: 180, duration: 1.0, type: 'sawtooth' },
      ant: { freq: 1200, duration: 0.3, type: 'sine' },
      ape: { freq: 300, duration: 0.9, type: 'sawtooth' },
      buffalo: { freq: 220, duration: 1.1, type: 'sawtooth' },
      dolphin: { freq: 800, duration: 0.7, type: 'sine' },
      eagle: { freq: 900, duration: 0.6, type: 'square' },
      eel: { freq: 400, duration: 0.8, type: 'sine' },
      fish: { freq: 600, duration: 0.4, type: 'sine' },
      default: { freq: 500, duration: 0.8, type: 'sine' }
    };
    
    const soundConfig = soundMap[animal.toLowerCase()] || soundMap.default;
    
    oscillator.frequency.value = soundConfig.freq;
    oscillator.type = soundConfig.type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + soundConfig.duration);

    // Clean up when sound ends
    oscillator.onended = () => {
      setPlayingSound(null);
      oscillatorRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  };

  const handleAnimalClick = async (animal: Animal) => {
    // Stop any currently playing audio
    if(playingSound === animal.name) {
      stopAllAudio();
      return;
    }
    
    try {
      const audio = new Audio(animal.sound);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingSound(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.log(`Audio file not found for ${animal.name}, generating sound`);
        generateAnimalSound(animal.name);
      };

      await audio.play();
    } catch (error) {
      console.log(`Error playing audio file for ${animal.name}, generating sound`);
      generateAnimalSound(animal.name);
    }
    
    setPlayingSound(animal.name);
  };

  const handleImageError = (animalName: string) => {
    setImageErrors(prev => new Set([...prev, animalName]));
  };

  const nextSlide = () => {
    if (currentSlide < totalPages - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    stopAllAudio();
    setCurrentSlide(pageIndex);
  };


  // Generate pagination letters - mobile shows only ±1, desktop shows ±2
  const getPaginationLetters = () => {
    const currentPage = currentSlide; // 0-based index
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const range = isMobile ? 1 : 2; // ±1 for mobile, ±2 for desktop
    const maxVisible = isMobile ? 3 : 5; // 3 for mobile, 5 for desktop
    
    let startPage = Math.max(0, currentPage - range);
    let endPage = Math.min(totalPages - 1, currentPage + range);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisible) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - maxVisible + 1);
      }
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push({
        index: i,
        letter: animalSlides[i].letter
      });
    }
    
    return pages;
  };

  useEffect(() => {
    stopAllAudio();
    if(currentSlide < 0) {
      setCurrentSlide(0);
    }
    if(currentSlide >= totalPages){
      setCurrentSlide(totalPages);
    }
  }, [currentSlide, totalPages]);

  // Handle keyboard navigation
  useEffect(() => {

    const selectSlide = (letter: string) => {
      const index = animalSlides.findIndex(slide => slide.letter.toLowerCase() === letter.toLowerCase());
      if (index !== -1) {
        setCurrentSlide(index);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        
        if (event.key === 'ArrowLeft' && currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        } else if (event.key === 'ArrowRight' && currentSlide < totalPages - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      }
      if (/^[a-zA-Z]$/.test(event.key)) {
        selectSlide(event.key);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopAllAudio();
    };
  }, [currentSlide, totalPages, animalSlides]);

  const currentSlideData = animalSlides[currentSlide];
  const paginationLetters = getPaginationLetters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex flex-col">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Mobile Home Button - Top Left */}
      <div className="md:hidden relative z-10 p-4">
        <Button
          onClick={() => {
            stopAllAudio();
            router.push('/');
          }}
          variant="outline"
          size="lg"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Home
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-1">
        {/* Animal Cards - Large and Child-Friendly */}
        <div className="flex flex-col md:flex-row justify-center gap-6 p-6 pb-32 md:pb-6 mx-auto w-full">
          {currentSlideData.animals.map((animal, index) => (
            <Card
              key={animal.name}
              className={`w-full relative cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden ${
                playingSound === animal.name ? 'ring-8 ring-yellow-400 scale-105 shadow-2xl' : 'shadow-xl'
              }`}
              onClick={() => handleAnimalClick(animal)}
            >
              <div className="relative h-96 w-full">
                {!imageErrors.has(animal.name) ? (
                  <Image
                    src={animal.image}
                    alt={animal.name}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(animal.name)}
                    priority={index < 3}
                  />
                ) : (
                  animal.name
                )}
                
              </div>
              
              {/* Animal Name */}
              <div className="p-6 flex justify-between items-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {animal.name}
                </h3>
                <div>
                  <div className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      playingSound === animal.name 
                        ? 'bg-yellow-400/90 animate-pulse' 
                        : 'bg-white/70 hover:bg-white/90'
                    }`}>
                      {playingSound === animal.name ? (
                        <VolumeX className="w-6 h-6 text-gray-900" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-gray-800" />
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Bottom Navigation */}
      <div className="hidden md:block relative z-10 bg-white/10 backdrop-blur-sm border-t border-white/20 p-6">
        <div className="flex justify-between items-center space-x-4 w-full mx-auto">
          <div className='w-1/6'>
            <Button
              onClick={() => {
                stopAllAudio();
                router.push('/');
              }}
              variant="outline"
              size="lg"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </div>
          <div className="text-center w-3/6">
            <h1 className="text-7xl font-bold text-white drop-shadow-lg">
              {currentSlideData.letter}
            </h1>
          </div>
          <div className="flex justify-around items-center w-2/6 space-x-4">
            {/* Previous Button */}
            <Button
              onClick={prevSlide}
              size="lg"
              disabled={currentSlide === 0}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 px-6 py-3 text-lg transition-all duration-200 active:scale-95"
              variant="outline"
              type="button"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Letter Pagination */}
            <div className="flex space-x-2">
              {paginationLetters.map((page) => (
                <button
                  key={page.index}
                  type="button"
                  className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center text-lg font-bold active:scale-95 ${
                    page.index === currentSlide
                      ? 'bg-white text-gray-800 scale-110 shadow-lg ring-2 ring-white/50' 
                      : 'bg-white/30 text-white hover:bg-white/50 hover:text-gray-800 hover:scale-105'
                  }`}
                  onClick={() => goToPage(page.index)}
                >
                  {page.letter}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              onClick={nextSlide}
              size="lg"
              disabled={currentSlide === totalPages - 1}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 px-6 py-3 text-lg transition-all duration-200 active:scale-95"
              variant="outline"
              type="button"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Island Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 p-4 pb-8">
        <div className="mx-auto max-w-sm">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center justify-between space-x-4">
              {/* Previous Button */}
              <Button
                onClick={prevSlide}
                size="lg"
                disabled={currentSlide === 0}
                className="bg-white/30 border-0 text-gray-800 hover:bg-white/50 backdrop-blur-sm disabled:opacity-30 w-12 h-12 p-0 rounded-2xl transition-all duration-200 active:scale-95"
                variant="ghost"
                type="button"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              {/* Letter Pagination - Only current ±1 */}
              <div className="flex space-x-3">
                {paginationLetters.map((page) => (
                  <button
                    key={page.index}
                    type="button"
                    className={`w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center text-base font-bold active:scale-95 ${
                      page.index === currentSlide
                        ? 'bg-white text-gray-800 scale-110 shadow-lg' 
                        : 'bg-white/40 text-gray-700 hover:bg-white/60 hover:text-gray-800 hover:scale-105'
                    }`}
                    onClick={() => goToPage(page.index)}
                  >
                    {page.letter}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <Button
                onClick={nextSlide}
                size="lg"
                disabled={currentSlide === totalPages - 1}
                className="bg-white/30 border-0 text-gray-800 hover:bg-white/50 backdrop-blur-sm disabled:opacity-30 w-12 h-12 p-0 rounded-2xl transition-all duration-200 active:scale-95"
                variant="ghost"
                type="button"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}