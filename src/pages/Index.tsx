import EmotionDetector from '@/components/EmotionDetector';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="container py-8">
        <EmotionDetector />
      </div>
    </div>
  );
};

export default Index;
