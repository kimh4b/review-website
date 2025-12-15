import { Star, TrendingUp, Users } from "lucide-react";

const topStores = [
    {
        name: "The Golden Spoon",
        type: "Fine Dining",
        location: "Phnom Penh, KH",
        rating: 4.9,
        reviews: 2847,
        improvement: "+23%",
        responseTime: "< 2 hours",
    },
    {
        name: "Cha Kroeung-ឆាគ្រឿង",
        type: "Cambodia Cuisine",
        location: "Phnom Penh, KH",
        rating: 4.8,
        reviews: 1923,
        improvement: "+18%",
        responseTime: "< 1 hour",
    },
    {
        name: "Bong Wagyu Steakhouse",
        type: "New York Restaurant",
        location: "Phnom Penh, KH",
        rating: 4.9,
        reviews: 3156,
        improvement: "+31%",
        responseTime: "< 3 hours",
    },
    {
        name: "Songtra",
        type: "Fast Casual",
        location: "Phnom Penh, KH",
        rating: 4.9,
        reviews: 1654,
        improvement: "+15%",
        responseTime: "< 2 hours",
    },
];

export function TopRatedStores() {
    return (
        <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl mb-4">
                        Join our top-rated restaurants
                    </h2>
                    <p className="text-xl text-gray-600">
                        See how restaurants are using FeedbackPro to improve
                        customer satisfaction and grow their business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {topStores.map((store, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl mb-1">
                                        {store.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        {store.type}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {store.location}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                                    <span className="text-orange-700">
                                        {store.rating}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 mt-6 pt-6 border-t border-gray-200">
                                <div>
                                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs">Reviews</span>
                                    </div>
                                    <div className="text-lg">
                                        {store.reviews.toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs">Growth</span>
                                    </div>
                                    <div className="text-lg text-green-600">
                                        {store.improvement}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
