export const analyzeSensitivity = async (filePath) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const score = Math.random(); 
      const threshold = 0.7; 

      const categories = {
        violence: Math.random() * 0.5,
        adult: Math.random() * 0.3,
        offensive: Math.random() * 0.4,
        safe: Math.random() * 0.9
      };

      const status = score > threshold ? 'flagged' : 'safe';

      const details = {
        analysisDate: new Date(),
        categories,
        flags: score > threshold ? generateFlags(categories) : [],
        confidence: 0.85 + (Math.random() * 0.15),
        modelVersion: '1.0.0'
      };

      resolve({
        status,
        score: Math.round(score * 100) / 100,
        details
      });
    }, 2000); 
  });
};


const generateFlags = (categories) => {
  const flags = [];
  
  if (categories.violence > 0.4) {
    flags.push({
      type: 'violence',
      severity: categories.violence > 0.6 ? 'high' : 'medium',
      timestamp: '00:00:05',
      description: 'Potential violent content detected'
    });
  }

  if (categories.adult > 0.3) {
    flags.push({
      type: 'adult',
      severity: categories.adult > 0.5 ? 'high' : 'medium',
      timestamp: '00:00:12',
      description: 'Potential adult content detected'
    });
  }

  if (categories.offensive > 0.4) {
    flags.push({
      type: 'offensive',
      severity: 'medium',
      timestamp: '00:00:20',
      description: 'Potentially offensive content detected'
    });
  }

  return flags;
};