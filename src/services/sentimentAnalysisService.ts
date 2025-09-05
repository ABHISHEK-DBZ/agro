interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  urgency: 'low' | 'medium' | 'high';
  emotion: string;
  confidence: number;
}

interface EmotionKeywords {
  [key: string]: {
    en: string[];
    hi: string[];
  };
}

class SentimentAnalysisService {
  private emotionKeywords: EmotionKeywords = {
    frustrated: {
      en: ['frustrated', 'annoyed', 'angry', 'upset', 'tired of'],
      hi: ['परेशान', 'नाराज', 'गुस्सा', 'दुखी', 'तंग']
    },
    worried: {
      en: ['worried', 'concerned', 'afraid', 'scared', 'anxious'],
      hi: ['चिंतित', 'डर', 'भयभीत', 'परेशान', 'चिंता']
    },
    hopeful: {
      en: ['hope', 'expecting', 'looking forward', 'anticipating', 'planning'],
      hi: ['आशा', 'उम्मीद', 'योजना', 'सोच', 'विचार']
    },
    satisfied: {
      en: ['happy', 'satisfied', 'pleased', 'good', 'great'],
      hi: ['खुश', 'संतुष्ट', 'अच्छा', 'बढ़िया', 'उत्तम']
    },
    urgent: {
      en: ['urgent', 'emergency', 'immediate', 'quickly', 'asap'],
      hi: ['जल्दी', 'तुरंत', 'आपात', 'शीघ्र', 'अविलंब']
    }
  };

  private languagePatterns = {
    hi: /[\u0900-\u097F]/,  // Hindi Unicode range
    en: /^[A-Za-z\s.,!?]+$/ // Basic English pattern
  };

  public analyzeSentiment(text: string): SentimentResult {
    // Detect language
    const language = this.detectLanguage(text);
    const words = text.toLowerCase().split(/\s+/);
    
    // Initialize counters
    let positiveScore = 0;
    let negativeScore = 0;
    let urgencyScore = 0;
    let dominantEmotion = 'neutral';
    let maxEmotionScore = 0;

    // Analyze each word
    words.forEach(word => {
      // Check for emotions
      for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
        const relevantKeywords = language === 'hi' ? keywords.hi : keywords.en;
        const emotionScore = relevantKeywords.reduce((score, keyword) => {
          return score + (word.includes(keyword) ? 1 : 0);
        }, 0);

        if (emotionScore > maxEmotionScore) {
          maxEmotionScore = emotionScore;
          dominantEmotion = emotion;
        }

        // Update sentiment scores
        if (emotion === 'satisfied' || emotion === 'hopeful') {
          positiveScore += emotionScore;
        } else if (emotion === 'frustrated' || emotion === 'worried') {
          negativeScore += emotionScore;
        }

        // Update urgency score
        if (emotion === 'urgent') {
          urgencyScore += emotionScore;
        }
      }
    });

    // Calculate final sentiment score (-1 to 1)
    const totalScore = positiveScore + negativeScore;
    const normalizedScore = totalScore === 0 ? 0 : (positiveScore - negativeScore) / totalScore;

    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (normalizedScore > 0.1) sentiment = 'positive';
    else if (normalizedScore < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';

    // Determine urgency
    let urgency: 'low' | 'medium' | 'high';
    if (urgencyScore >= 2) urgency = 'high';
    else if (urgencyScore >= 1) urgency = 'medium';
    else urgency = 'low';

    // Calculate confidence
    const confidence = Math.min(
      1,
      Math.max(0.4, (Math.abs(normalizedScore) + maxEmotionScore / 3))
    );

    return {
      sentiment,
      score: normalizedScore,
      urgency,
      emotion: dominantEmotion,
      confidence
    };
  }

  private detectLanguage(text: string): 'hi' | 'en' {
    return this.languagePatterns.hi.test(text) ? 'hi' : 'en';
  }

  public getEmotionalResponse(sentiment: SentimentResult, language: 'hi' | 'en'): string {
    const responses = {
      hi: {
        positive: {
          satisfied: 'बहुत अच्छा! आपकी सफलता देख कर खुशी हुई।',
          hopeful: 'आपका उत्साह देख कर अच्छा लगा। साथ मिलकर और बेहतर करेंगे।'
        },
        negative: {
          frustrated: 'आपकी परेशानी समझ सकता हूं। मिलकर समाधान ढूंढते हैं।',
          worried: 'चिंता मत कीजिए, हम इस समस्या का समाधान जरूर निकालेंगे।'
        },
        neutral: 'मैं आपकी मदद करने के लिए तत्पर हूं। कृपया विस्तार से बताएं।'
      },
      en: {
        positive: {
          satisfied: 'Great to hear that! Your success is our motivation.',
          hopeful: 'Your enthusiasm is inspiring. Let\'s work together for better results.'
        },
        negative: {
          frustrated: 'I understand your frustration. Let\'s work on a solution together.',
          worried: 'Don\'t worry, we\'ll definitely find a solution to this problem.'
        },
        neutral: 'I\'m here to help. Please tell me more about your situation.'
      }
    };

    if (sentiment.urgency === 'high') {
      return language === 'hi' 
        ? 'मैं आपकी तत्काल सहायता के लिए तैयार हूं। कृपया पूरी जानकारी दें।'
        : 'I\'m ready to provide immediate assistance. Please provide all details.';
    }

    if (sentiment.sentiment === 'neutral') {
      return responses[language].neutral;
    }

    const emotionKey = sentiment.emotion;
    const sentimentGroup = responses[language][sentiment.sentiment];
    if (typeof sentimentGroup === 'object' && emotionKey in sentimentGroup) {
      // Type assertion: sentimentGroup is Record<string, string>
      return (sentimentGroup as Record<string, string>)[emotionKey];
    }
    return responses[language].neutral;
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();
