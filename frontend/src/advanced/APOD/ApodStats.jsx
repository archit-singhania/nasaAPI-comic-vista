import React, { useState, useEffect } from 'react';

const ApodStats = ({ apod }) => {
  const [stats, setStats] = useState({
    wordCount: 0,
    readingTime: 0,
    mediaType: '',
    daysSinceFirst: 0
  });

  useEffect(() => {
    if (apod) {
      const words = apod.explanation.split(' ').length;
      const readingTime = Math.ceil(words / 200); 
      const firstApodDate = new Date('1995-06-16');
      const currentDate = new Date(apod.date);
      const daysSince = Math.floor((currentDate - firstApodDate) / (1000 * 60 * 60 * 24));

      setStats({
        wordCount: words,
        readingTime,
        mediaType: apod.media_type,
        daysSinceFirst: daysSince
      });
    }
  }, [apod]);

  if (!apod) return null;

  const statItems = [
    { icon: '📖', label: 'Words', value: stats.wordCount },
    { icon: '⏱️', label: 'Reading Time', value: `${stats.readingTime} min` },
    { icon: '🎬', label: 'Media Type', value: stats.mediaType === 'image' ? 'Image' : 'Video' },
    { icon: '📅', label: 'Days Since First APOD', value: stats.daysSinceFirst.toLocaleString() }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          <div className="text-2xl mb-2">{item.icon}</div>
          <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
          <div className="text-xs text-white/60">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ApodStats;