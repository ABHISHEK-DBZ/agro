/**
 * Voice Service — Speech-to-Text & Text-to-Speech for Krishi Sahayak
 *
 * Uses react-native-voice for speech recognition and expo-speech for TTS.
 * Falls back gracefully when voice is not available.
 */

import { Platform, Alert, Linking } from 'react-native';

// ─── Text-to-Speech ───────────────────────────────────────────
let SpeechModule: any = null;
let VoiceModule: any = null;

// Dynamic imports to avoid crashes if modules aren't installed
async function getSpeechModule() {
  if (SpeechModule) return SpeechModule;
  try {
    SpeechModule = require('expo-speech');
    return SpeechModule;
  } catch {
    return null;
  }
}

async function getVoiceModule() {
  if (VoiceModule) return VoiceModule;
  try {
    VoiceModule = require('@react-native-voice/voice');
    return VoiceModule;
  } catch {
    return null;
  }
}

// ─── Language Maps (exported for reuse across components) ────

/** Map from app language code to speech-recognition locale */
export const SPEECH_LANG_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-US',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ur: 'ur-PK',
};

/** Map from app language code to TTS locale */
export const TTS_LANG_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-US',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
};

// ─── Public API ────────────────────────────────────────────────

export interface VoiceServiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isAvailable: boolean;
  isSpeechAvailable: boolean;
}

class VoiceService {
  private _isListening = false;
  private _isSpeaking = false;
  private _speechRecognized = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | undefined = undefined;
  private voice: any = null;
  private speech: any = null;
  private _initialized = false;

  async initialize(): Promise<void> {
    if (this._initialized) return;
    this.speech = await getSpeechModule();
    this.voice = await getVoiceModule();
    this._initialized = true;
  }

  get state(): VoiceServiceState {
    return {
      isListening: this._isListening,
      isSpeaking: this._isSpeaking,
      isAvailable: !!this.voice,
      isSpeechAvailable: !!this.speech,
    };
  }

  // ─── Speech-to-Text (Voice Recognition) ───────────────────────
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    language: string = 'hi-IN',
  ): Promise<void> {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    if (!this.voice) {
      onError?.('Voice recognition not available. Install @react-native-voice/voice.');
      return;
    }

    try {
      this._isListening = true;
      this._speechRecognized = false;

      // Handle speech results
      if (!this.voice._onSpeechResults) {
        this.voice.onSpeechResults = (e: any) => {
          const text = e.value?.[0] || '';
          if (text && !this._speechRecognized) {
            this._speechRecognized = true;
            this.onResultCallback?.(text);
            this.stopListening();
          }
        };
        this.voice.onSpeechError = (e: any) => {
          const errMsg = e.error?.message || e.error?.code || 'Unknown error';
          this.onErrorCallback?.(errMsg);
          this._isListening = false;
        };
      }

      await this.voice.start(SPEECH_LANG_MAP[language] || 'hi-IN');
    } catch (error: any) {
      this._isListening = false;
      onError?.(error.message || 'Failed to start voice recognition');
    }
  }

  async stopListening(): Promise<void> {
    if (!this.voice || !this._isListening) return;
    try {
      await this.voice.stop();
      await this.voice.destroy();
      // Re-initialize for next use
      this.voice = await getVoiceModule();
    } catch {
      // Silently handle
    }
    this._isListening = false;
  }

  // ─── Text-to-Speech ───────────────────────────────────────────
  async speak(text: string, language: string = 'hi', onDone?: () => void): Promise<void> {
    if (!this.speech) {
      console.warn('[Voice] Text-to-speech not available (expo-speech not installed)');
      return;
    }

    try {
      this._isSpeaking = true;
      await this.speech.speak(text, {
        language: TTS_LANG_MAP[language] || 'hi-IN',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => {
          this._isSpeaking = false;
          onDone?.();
        },
        onError: () => {
          this._isSpeaking = false;
        },
      });
    } catch (error) {
      this._isSpeaking = false;
      console.warn('[Voice] Speak error:', error);
    }
  }

  async stopSpeaking(): Promise<void> {
    if (!this.speech) return;
    try {
      await this.speech.stop();
    } catch {
      // Silently handle
    }
    this._isSpeaking = false;
  }

  // ─── Cleanup ──────────────────────────────────────────────────
  async destroy(): Promise<void> {
    await this.stopListening();
    await this.stopSpeaking();
    this.onResultCallback = null;
    this.onErrorCallback = undefined;
  }

  // Helper: request microphone permission (platform-specific guidance)
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') return true; // iOS handles via plist
    return true; // Android handles via manifest
  }
}

const voiceService = new VoiceService();
export default voiceService;
