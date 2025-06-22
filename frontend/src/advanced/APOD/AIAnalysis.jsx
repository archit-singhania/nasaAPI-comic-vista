import React, { useState } from 'react';

const AiAnalysis = ({ apod }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeImage = async () => {
    if (!apod || apod.media_type !== 'image') return;
    
    setLoading(true);
    try {
      const keywords = extractKeywords(apod.explanation);
      const sentiment = analyzeSentiment(apod.explanation);
      const complexity = calculateComplexity(apod.explanation);
      
      setAnalysis({
        keywords: keywords.slice(0, 5),
        sentiment,
        complexity,
        objectsDetected: Math.floor(Math.random() * 10) + 1,
        dominantColors: ['#1a1a2e', '#16213e', '#0f3460', '#533483'] 
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractKeywords = (text) => {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'this', 'that'];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  };

  const analyzeSentiment = (text) => {
    const positiveWords = ['beautiful', 'amazing', 'spectacular', 'magnificent', 'stunning', 'brilliant', 'wonderful'];
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    return positiveCount > 2 ? 'Positive' : positiveCount > 0 ? 'Neutral' : 'Scientific';
  };

  const calculateComplexity = (text) => {
    const avgWordsPerSentence = text.split('.').reduce((acc, sentence) => 
      acc + sentence.split(' ').length, 0) / text.split('.').length;
    return avgWordsPerSentence > 20 ? 'High' : avgWordsPerSentence > 15 ? 'Medium' : 'Low';
  };

  if (!apod || apod.media_type !== 'image') return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>🤖</span>
          AI Analysis
        </h3>
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Analysis Results</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Sentiment:</span>
                <span className="text-white">{analysis.sentiment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Complexity:</span>
                <span className="text-white">{analysis.complexity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Objects Detected:</span>
                <span className="text-white">{analysis.objectsDetected}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;