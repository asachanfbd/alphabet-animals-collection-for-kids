// Animal sound file paths - will use local files when available, fallback to generated sounds
export const getAnimalSoundPath = (animalName: string): string => {
  const normalizedName = animalName.toLowerCase().replace(/\s+/g, '_');
  
  // Try different file extensions
  const extensions = ['mp3', 'wav', 'ogg'];
  
  // Return the first available format (browser will handle if file doesn't exist)
  return `/sounds/animals/${normalizedName}.mp3`;
};

// Fallback sound generation using Web Audio API
export const generateAnimalSound = (animal: string): void => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
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
    default: { freq: 500, duration: 0.8, type: 'sine' }
  };
  
  const soundConfig = soundMap[animal.toLowerCase()] || soundMap.default;
  
  oscillator.frequency.value = soundConfig.freq;
  oscillator.type = soundConfig.type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + soundConfig.duration);
};

// Check if audio file exists and play it, otherwise generate sound
export const playAnimalSound = async (animalName: string): Promise<boolean> => {
  const soundPath = getAnimalSoundPath(animalName);
  
  try {
    const audio = new Audio(soundPath);
    
    // Test if the file exists by trying to load it
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', resolve);
      audio.addEventListener('error', reject);
      audio.load();
    });
    
    await audio.play();
    return true; // Successfully played audio file
  } catch (error) {
    console.log(`Audio file not found for ${animalName}, generating sound`);
    generateAnimalSound(animalName);
    return false; // Used fallback generated sound
  }
};