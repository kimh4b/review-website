import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Star, Mail, Lock, User, Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface SignUpPageProps {
    onLoginClick: () => void;
    onBack: () => void;
}

export function SignUpPage({ onLoginClick, onBack }: SignUpPageProps) {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        restaurantName: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signup(formData);
            toast.success("Account created successfully!");
        } catch (error) {
            toast.error("Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <button className="flex items-center mb-6 hover:underline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </button>

                <div className="bg-white rounded-md shadow-xl p-8 border border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Star className="w-7 h-7 text-white fill-white" />
                        </div>
                        <span className="text-2xl">FeedbackPro</span>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl mb-2">Create your account</h1>
                        <p className="text-gray-600">
                            Let get started!    
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="pl-10"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fullName: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="restaurantName">
                                Restaurant Name
                            </Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="restaurantName"
                                    type="text"
                                    placeholder="Your Restaurant"
                                    className="pl-10"
                                    value={formData.restaurantName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            restaurantName: e.target.value,
                                        })
                                    }
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
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    minLength={8}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Creating account..."
                                : "Create account"}
                        </Button>

                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">
                            Already have an account?{" "}
                        </span>
                        <button
                            onClick={onLoginClick}
                            className="text-orange-500 hover:text-orange-600"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
