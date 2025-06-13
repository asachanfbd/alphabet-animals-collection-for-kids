"use client";

import { useState, useRef, useEffect } from 'react';
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
    stopAllAudio();
    
    setPlayingSound(animal.name);
    
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
  };

  const handleImageError = (animalName: string) => {
    setImageErrors(prev => new Set([...prev, animalName]));
  };

  const nextSlide = () => {
    stopAllAudio();
    if (currentSlide < totalPages - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    stopAllAudio();
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    stopAllAudio();
    setCurrentSlide(pageIndex);
  };

  // Generate pagination letters with 3 pages to left and right
  const getPaginationLetters = () => {
    const currentPage = currentSlide; // 0-based index
    const maxVisible = 7; // 3 left + current + 3 right
    
    let startPage = Math.max(0, currentPage - 3);
    let endPage = Math.min(totalPages - 1, currentPage + 3);
    
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

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const currentSlideData = animalSlides[currentSlide];
  const paginationLetters = getPaginationLetters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex flex-col">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
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
        
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Letter {currentSlideData.letter}
          </h1>
          <p className="text-white/90 text-xl mt-2">
            Tap any animal to hear its sound!
          </p>
        </div>
        
        <div className="text-white/80 text-xl font-medium">
          Page {currentSlide + 1} of {totalPages}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        {/* Animal Cards - Large and Child-Friendly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
          {currentSlideData.animals.map((animal, index) => (
            <Card
              key={animal.name}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden ${
                playingSound === animal.name ? 'ring-8 ring-yellow-400 scale-105 shadow-2xl' : 'shadow-xl'
              }`}
              onClick={() => handleAnimalClick(animal)}
              style={{ minHeight: '400px' }}
            >
              <div className="relative h-80 w-full">
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
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                    <div className="text-8xl opacity-60">
                      {animal.name === 'Alligator' && '🐊'}
                      {animal.name === 'Ant' && '🐜'}
                      {animal.name === 'Ape' && '🦍'}
                      {animal.name === 'Bear' && '🐻'}
                      {animal.name === 'Bee' && '🐝'}
                      {animal.name === 'Buffalo' && '🐃'}
                      {animal.name === 'Cat' && '🐱'}
                      {animal.name === 'Cow' && '🐄'}
                      {animal.name === 'Chicken' && '🐔'}
                      {animal.name === 'Dog' && '🐶'}
                      {animal.name === 'Duck' && '🦆'}
                      {animal.name === 'Dolphin' && '🐬'}
                      {animal.name === 'Elephant' && '🐘'}
                      {animal.name === 'Eagle' && '🦅'}
                      {animal.name === 'Eel' && '🐍'}
                      {animal.name === 'Fox' && '🦊'}
                      {animal.name === 'Frog' && '🐸'}
                      {animal.name === 'Fish' && '🐟'}
                      {animal.name === 'Goat' && '🐐'}
                      {animal.name === 'Gecko' && '🦎'}
                      {animal.name === 'Giraffe' && '🦒'}
                      {animal.name === 'Horse' && '🐴'}
                      {animal.name === 'Hamster' && '🐹'}
                      {animal.name === 'Hedgehog' && '🦔'}
                      {animal.name === 'Iguana' && '🦎'}
                      {animal.name === 'Impala' && '🦌'}
                      {animal.name === 'Insect' && '🐛'}
                      {animal.name === 'Jaguar' && '🐆'}
                      {animal.name === 'Jellyfish' && '🪼'}
                      {animal.name === 'Jackal' && '🐺'}
                      {animal.name === 'Kangaroo' && '🦘'}
                      {animal.name === 'Koala' && '🐨'}
                      {animal.name === 'Kiwi' && '🥝'}
                      {animal.name === 'Lion' && '🦁'}
                      {animal.name === 'Llama' && '🦙'}
                      {animal.name === 'Lizard' && '🦎'}
                      {animal.name === 'Monkey' && '🐵'}
                      {animal.name === 'Mouse' && '🐭'}
                      {animal.name === 'Moose' && '🫎'}
                      {animal.name === 'Newt' && '🦎'}
                      {animal.name === 'Narwhal' && '🐋'}
                      {animal.name === 'Nightingale' && '🐦'}
                      {animal.name === 'Octopus' && '🐙'}
                      {animal.name === 'Ostrich' && '🪶'}
                      {animal.name === 'Otter' && '🦦'}
                      {animal.name === 'Penguin' && '🐧'}
                      {animal.name === 'Panda' && '🐼'}
                      {animal.name === 'Parrot' && '🦜'}
                      {animal.name === 'Quail' && '🐦'}
                      {animal.name === 'Quokka' && '🐹'}
                      {animal.name === 'Quoll' && '🐱'}
                      {animal.name === 'Rabbit' && '🐰'}
                      {animal.name === 'Raccoon' && '🦝'}
                      {animal.name === 'Rat' && '🐀'}
                      {animal.name === 'Snake' && '🐍'}
                      {animal.name === 'Sheep' && '🐑'}
                      {animal.name === 'Seal' && '🦭'}
                      {animal.name === 'Tiger' && '🐅'}
                      {animal.name === 'Turtle' && '🐢'}
                      {animal.name === 'Tarantula' && '🕷️'}
                      {animal.name.includes('Unicorn') && '🦄'}
                      {animal.name.includes('Urchin') && '🦔'}
                      {animal.name.includes('Uakari') && '🐵'}
                      {animal.name === 'Vulture' && '🦅'}
                      {animal.name.includes('Viper') && '🐍'}
                      {animal.name === 'Vicuna' && '🦙'}
                      {animal.name === 'Walrus' && '🦭'}
                      {animal.name === 'Wasp' && '🐝'}
                      {animal.name === 'Whale' && '🐋'}
                      {animal.name === 'Xenomorph' && '👽'}
                      {animal.name === 'Yak' && '🐂'}
                      {animal.name === 'Yellowjacket' && '🐝'}
                      {animal.name.includes('Yeti') && '🦍'}
                      {animal.name === 'Zebra' && '🦓'}
                    </div>
                  </div>
                )}
                
                {/* Sound Indicator Overlay */}
                <div className="absolute top-4 right-4">
                  <div className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                    playingSound === animal.name 
                      ? 'bg-yellow-400/90 animate-pulse' 
                      : 'bg-white/70 hover:bg-white/90'
                  }`}>
                    {playingSound === animal.name ? (
                      <VolumeX className="w-6 h-6 text-gray-800" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-gray-800" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Animal Name */}
              <div className="p-6 text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {animal.name}
                </h3>
                <p className="text-lg text-gray-600">
                  {playingSound === animal.name ? 'Playing sound...' : 'Tap to hear sound'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Navigation with Letter-Based Pagination */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border-t border-white/20 p-6">
        <div className="flex justify-center items-center space-x-4 max-w-6xl mx-auto">
          {/* Previous Button */}
          <Button
            onClick={prevSlide}
            size="lg"
            disabled={currentSlide === 0}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 px-6 py-3 text-lg"
            variant="outline"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Letter Pagination */}
          <div className="flex space-x-2">
            {paginationLetters.map((page) => (
              <button
                key={page.index}
                className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center text-lg font-bold ${
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
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 px-6 py-3 text-lg"
            variant="outline"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}