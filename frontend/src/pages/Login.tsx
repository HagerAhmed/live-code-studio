import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Code2, ArrowRight } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate("/");
        }, 1000);
    };

    return (
        <>
            <Helmet>
                <title>Login | CodeInterview</title>
                <meta name="description" content="Login to CodeInterview to start your collaborative coding sessions." />
            </Helmet>

            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />

                <div className="w-full max-w-md relative z-10 animate-fade-in">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Code2 className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-bold text-2xl">CodeInterview</span>
                        </div>
                    </div>

                    <Card className="glass border-primary/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                            <CardDescription className="text-center">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#" className="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-background/50"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full group"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <div className="text-center mt-6 text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <a href="#" className="text-primary hover:underline font-medium">
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
