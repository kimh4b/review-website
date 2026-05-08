import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Star, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface LoginPageProps {
    onSignUpClick: () => void;
    onBack: () => void;
}

export function LoginPage({ onSignUpClick, onBack }: LoginPageProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(""); // clear previous error

  try {
    await login(email, password);
    toast.success("Welcome back!");
  } catch (err: any) {
    setError(err.message || "Invalid credentials. Please try again.");
    toast.error(err.message || "Invalid credentials.");
  } finally {
    setIsLoading(false);
  }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <button className="flex items-center hover:underline mb-6" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </button>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Star className="w-7 h-7 text-white fill-white" />
                        </div>
                        <span className="text-2xl">FeedbackPro</span>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl mb-2">Welcome</h1>
                        <p className="text-gray-600">
                            Sign in to your account to continue
                        </p>
                    </div>
{error && (
  <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg my-3 p-3">
    {error}
  </div>
)}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-gray-600">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-orange-500 hover:text-orange-600"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">
                            Don't have an account?{" "}
                        </span>
                        <button
                            onClick={onSignUpClick}
                            className="text-orange-500 hover:text-orange-600"
                        >
                            Sign up for free
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
