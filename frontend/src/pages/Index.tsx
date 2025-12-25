import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Code2, Users, Zap, Play, ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createSession = () => {
    setIsCreating(true);
    const sessionId = uuidv4().split('-')[0];
    setTimeout(() => {
      navigate(`/interview/${sessionId}`);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>CodeInterview | Real-time Collaborative Coding Platform</title>
        <meta name="description" content="Conduct seamless coding interviews with real-time collaboration, multi-language support, and instant code execution. Create an interview session in seconds." />
      </Helmet>

      <div className="min-h-screen bg-background overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />

        <div className="relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl">CodeInterview</span>
            </div>
          </header>

          {/* Hero Section */}
          <main className="container mx-auto px-8 pt-16 pb-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Real-time collaborative coding</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                Conduct coding interviews{' '}
                <span className="text-gradient">seamlessly</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
                Create a shared coding environment in seconds. Watch candidates code in real-time with syntax highlighting and instant execution.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Button
                  variant="hero"
                  size="xl"
                  onClick={createSession}
                  disabled={isCreating}
                  className="group"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Creating session...
                    </>
                  ) : (
                    <>
                      Create Interview Session
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-32 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Real-time Collaboration"
                description="See code changes instantly as candidates type. No delay, no sync issues."
                delay="400ms"
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Multi-language Support"
                description="JavaScript, Python, Java, C++, and more. Syntax highlighting for all."
                delay="500ms"
              />
              <FeatureCard
                icon={<Play className="w-6 h-6" />}
                title="Instant Execution"
                description="Run JavaScript code directly in the browser. See output immediately."
                delay="600ms"
              />
            </div>

            {/* Code Preview */}
            <div className="mt-24 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '700ms' }}>
              <div className="glass rounded-2xl p-1 shadow-2xl">
                <div className="bg-editor-bg rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-warning/60" />
                      <div className="w-3 h-3 rounded-full bg-success/60" />
                    </div>
                    <span className="text-sm text-muted-foreground ml-2 font-mono">solution.js</span>
                  </div>
                  <pre className="p-6 font-mono text-sm text-foreground/90 overflow-x-auto">
                    <code>{`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <div 
    className="glass rounded-xl p-6 space-y-4 hover:border-primary/30 transition-colors animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      {icon}
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
