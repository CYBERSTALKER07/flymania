/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error, data } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp && data?.user?.identities?.length === 0) {
        setError('An account with this email already exists.');
      } else if (isSignUp) {
        setSuccessMessage('Account created! Please check your email to verify your account.');
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {isSignUp ? 'Welcome!' : 'Welcome back!'}
            </h1>
            <LanguageSelector />
          </div>
          
          <Card className="border-none shadow-none">
            <CardHeader className="space-y-1 p-0">
              <CardTitle className="text-xl">
                {isSignUp ? 'Create your account' : 'Sign in to your account'}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? 'Enter your details to get started'
                  : 'Enter your credentials to access your account'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAuth} className="space-y-4">
              <CardContent className="space-y-4 pt-4 px-0">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 px-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full"
                  disabled={loading}
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: "url('')",
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20" />
        </div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-white space-y-6 animate-fade-in">
            <h2 className="text-4xl font-bold">Welcome to SkyTrack</h2>
            <p className="text-lg opacity-90">
              Your one-stop solution for managing flight tickets and travel arrangements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
