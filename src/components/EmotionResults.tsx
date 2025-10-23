import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Smile, Frown, Angry, Meh, Sparkles, AlertCircle } from 'lucide-react';

interface Emotion {
  label: string;
  score: number;
}

interface EmotionResultsProps {
  emotions: Emotion[];
  isActive: boolean;
}

const emotionConfig: Record<string, { color: string; icon: any; bgClass: string }> = {
  happy: { color: 'hsl(var(--emotion-joy))', icon: Smile, bgClass: 'bg-yellow-500/10' },
  sad: { color: 'hsl(var(--emotion-sadness))', icon: Frown, bgClass: 'bg-blue-500/10' },
  angry: { color: 'hsl(var(--emotion-anger))', icon: Angry, bgClass: 'bg-red-500/10' },
  neutral: { color: 'hsl(var(--emotion-neutral))', icon: Meh, bgClass: 'bg-gray-500/10' },
  surprise: { color: 'hsl(var(--emotion-surprise))', icon: Sparkles, bgClass: 'bg-yellow-400/10' },
  fear: { color: 'hsl(var(--emotion-fear))', icon: AlertCircle, bgClass: 'bg-purple-500/10' },
};

const getEmotionKey = (label: string): string => {
  const normalized = label.toLowerCase();
  if (normalized.includes('happy') || normalized.includes('joy')) return 'happy';
  if (normalized.includes('sad')) return 'sad';
  if (normalized.includes('angry') || normalized.includes('anger')) return 'angry';
  if (normalized.includes('neutral')) return 'neutral';
  if (normalized.includes('surprise')) return 'surprise';
  if (normalized.includes('fear')) return 'fear';
  return 'neutral';
};

const EmotionResults = ({ emotions, isActive }: EmotionResultsProps) => {
  const dominantEmotion = emotions.length > 0 ? emotions[0] : null;
  const emotionKey = dominantEmotion ? getEmotionKey(dominantEmotion.label) : 'neutral';
  const config = emotionConfig[emotionKey];
  const Icon = config?.icon || Meh;

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Detected Emotions</h2>
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      {dominantEmotion && (
        <div className={`p-6 rounded-lg ${config.bgClass} border border-border/50`}>
          <div className="flex items-center gap-4">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="h-8 w-8" style={{ color: config.color }} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold capitalize">{dominantEmotion.label}</h3>
              <p className="text-sm text-muted-foreground">
                {(dominantEmotion.score * 100).toFixed(1)}% confidence
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">All Emotions</h3>
        {emotions.length > 0 ? (
          <div className="space-y-3">
            {emotions.map((emotion, index) => {
              const key = getEmotionKey(emotion.label);
              const emotionConf = emotionConfig[key];
              const EmotionIcon = emotionConf?.icon || Meh;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <EmotionIcon 
                        className="h-4 w-4" 
                        style={{ color: emotionConf.color }}
                      />
                      <span className="capitalize font-medium">{emotion.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {(emotion.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={emotion.score * 100} 
                    className="h-2"
                    style={{
                      '--progress-background': emotionConf.color,
                    } as any}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Meh className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No emotions detected yet</p>
            <p className="text-sm">Start your camera to begin</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmotionResults;
