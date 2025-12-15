import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Mail,
    User,
    Building2,
    Phone,
    Calendar,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface DemoModalProps {
    open: boolean;
    onClose: () => void;
}

export function DemoModal({ open, onClose }: DemoModalProps) {
    const [step, setStep] = useState<"form" | "confirmation">("form");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        restaurantName: "",
        phone: "",
        locations: "1",
        preferredDate: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate demo request
        toast.success("Demo request submitted!");
        setStep("confirmation");
    };

    const handleClose = () => {
        setStep("form");
        setFormData({
            fullName: "",
            email: "",
            restaurantName: "",
            phone: "",
            locations: "1",
            preferredDate: "",
            message: "",
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                {step === "form" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                Request a personalized demo
                            </DialogTitle>
                            <DialogDescription>
                                Our team will reach out within 24 hours to
                                schedule a demo tailored to your needs.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 mt-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="demo-fullName">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="demo-fullName"
                                        type="text"
                                        placeholder="John Doe"
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
                                <Label htmlFor="demo-email">Work Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="demo-email"
                                        type="email"
                                        placeholder="john@restaurant.com"
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
                                <Label htmlFor="demo-restaurantName">
                                    Restaurant Name
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="demo-restaurantName"
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
                                <Label htmlFor="demo-phone">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="demo-phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demo-locations">
                                    Number of Locations
                                </Label>
                                <Select
                                    value={formData.locations}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            locations: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="demo-locations">
                                        <SelectValue placeholder="Select number of locations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            1 location
                                        </SelectItem>
                                        <SelectItem value="2-5">
                                            2-5 locations
                                        </SelectItem>
                                        <SelectItem value="6-10">
                                            6-10 locations
                                        </SelectItem>
                                        <SelectItem value="11-25">
                                            11-25 locations
                                        </SelectItem>
                                        <SelectItem value="26+">
                                            26+ locations
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demo-preferredDate">
                                    Preferred Demo Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="demo-preferredDate"
                                        type="date"
                                        className="pl-10"
                                        value={formData.preferredDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                preferredDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="demo-message">
                                    Additional Notes (Optional)
                                </Label>
                                <Textarea
                                    id="demo-message"
                                    placeholder="Tell us about your specific needs or questions..."
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600"
                            >
                                Request Demo
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl mb-2">
                            Demo request received!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Thank you for your interest in FeedbackPro. Our
                            sales team will contact you at{" "}
                            <strong>{formData.email}</strong> within 24 hours to
                            schedule your personalized demo.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
                            <h4 className="text-sm mb-2">What to expect:</h4>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Personalized product walkthrough</li>
                                <li>Custom solution for your restaurant(s)</li>
                                <li>Q&A with our product experts</li>
                                <li>Pricing options tailored to your needs</li>
                            </ul>
                        </div>
                        <Button onClick={handleClose} className="w-full">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
