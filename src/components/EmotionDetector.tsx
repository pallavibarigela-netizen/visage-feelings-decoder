import { useEffect, useRef, useState } from 'react';
import { pipeline } from '@huggingface/transformers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmotionResults from './EmotionResults';

interface Emotion {
  label: string;
  score: number;
}

const EmotionDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [classifier, setClassifier] = useState<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadModel();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      const pipe = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224-in21k-finetuned-emotion',
        { device: 'webgpu' }
      );
      setClassifier(pipe);
      toast({
        title: "Model loaded",
        description: "Emotion detection is ready!",
      });
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Error loading model",
        description: "Failed to initialize emotion detection",
        variant: "destructive",
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        startDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to detect emotions",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas;
  };

  const detectEmotion = async () => {
    if (!classifier || !isCameraActive) return;

    setIsLoading(true);
    try {
      const canvas = await captureFrame();
      if (canvas) {
        const results = await classifier(canvas);
        setEmotions(results.slice(0, 6));
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startDetection = () => {
    const interval = setInterval(() => {
      detectEmotion();
    }, 2000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (isCameraActive && classifier) {
      const cleanup = startDetection();
      return cleanup;
    }
  }, [isCameraActive, classifier]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Emotion Detection
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered facial emotion recognition in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Camera Feed</h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
          
          <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={isCameraActive ? stopCamera : startCamera}
            disabled={isModelLoading}
            className="w-full"
            size="lg"
          >
            {isModelLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Model...
              </>
            ) : isCameraActive ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
        </Card>

        <EmotionResults emotions={emotions} isActive={isCameraActive} />
      </div>
    </div>
  );
};

export default EmotionDetector;
