class VoiceService {
  constructor() {
    this.isVoiceMode = false;
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.loadVoices();
  }

  loadVoices() {
    // Load voices when the page loads
    this.voices = this.synth.getVoices();
    this.selectedVoice = this.voices.find(voice => 
      voice.name.includes('Google US English') || 
      voice.name.includes('Microsoft David') ||
      voice.name.includes('Microsoft Zira')
    ) || this.voices[0];
    
    // Listen for voices being loaded
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
      this.selectedVoice = this.voices.find(voice => 
        voice.name.includes('Google US English') || 
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Microsoft Zira')
      ) || this.voices[0];
    };
  }

  async speak(text) {
    if (!this.isVoiceMode) return;

    try {
      // Try ElevenLabs TTS first if API key is available
      if (this.elevenLabsApiKey && this.elevenLabsApiKey !== 'your_elevenlabs_api_key_here') {
        console.log('Attempting to use ElevenLabs TTS...');
        await this.speakWithElevenLabs(text);
      } else {
        console.log('Falling back to Web Speech API...');
        this.speakWithWebSpeech(text);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      // Fallback to Web Speech API if ElevenLabs fails
      this.speakWithWebSpeech(text);
    }
  }

  async speakWithElevenLabs(text) {
    console.log('ElevenLabs API Key:', this.elevenLabsApiKey ? 'Present' : 'Missing');
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        }),
      });

      console.log('ElevenLabs TTS Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs TTS Error:', errorText);
        throw new Error(`ElevenLabs TTS request failed: ${response.status} ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Playing ElevenLabs TTS audio...');
      const audio = new Audio(audioUrl);
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        throw error;
      };
      await audio.play();
      
      // Clean up the object URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      throw error;
    }
  }

  speakWithWebSpeech(text) {
    // Cancel any ongoing speech
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Configure speech parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Add event listeners for debugging
    utterance.onstart = () => console.log('Web Speech API: Speech started');
    utterance.onend = () => console.log('Web Speech API: Speech ended');
    utterance.onerror = (error) => console.error('Web Speech API: Speech error:', error);

    // Speak the text
    this.synth.speak(utterance);
  }

  toggleVoiceMode() {
    this.isVoiceMode = !this.isVoiceMode;
    console.log('Voice mode toggled:', this.isVoiceMode);
    return this.isVoiceMode;
  }
}

export const voiceService = new VoiceService(); 
