import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Bong Rotana",
    role: "Owner",
    restaurant: "Mealea Restaurant",
    image: "restaurant owner",
    rating: 5,
    text: "Using FeedbackPro has changed how we get customer feedback. More people leave reviews now, and our team can respond faster. Positive reviews have gone up a lot."
  },
  {
    name: "Srey Nea",
    role: "GM",
    restaurant: "Cha Kroeung-ឆាគ្រឿង ",
    image: "restaurant manager",
    rating: 5,
    text: "The dashboard makes it easy to see patterns in customer feedback. We can fix problems quickly before they get worse. Our customer satisfaction is much higher than before."
  },
  {
    name: "Sopheak",
    role: "Owner",
    restaurant: "Songtra",
    image: "restaurant owner",
    rating: 5,
    text: "We’ve seen real results. In just 3 months, our rating improved from lower to higher stars. Alerts let us fix issues quickly and turn unhappy customers into happy ones."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">
            Loved by restaurant owners everywhere
          </h2>
          <p className="text-xl text-gray-600">
            Don't just take our word for it – hear from restaurant owners who've transformed their business with FeedbackPro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 relative"
            >
              <Quote className="w-10 h-10 text-orange-300 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                ))}
              </div>

              <p className="text-gray-700 mb-6">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-orange-700">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.restaurant}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-1">500+</div>
            <div className="text-sm">Restaurants</div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">50K+</div>
            <div className="text-sm">Reviews</div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">95%</div>
            <div className="text-sm">Satisfaction</div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className="text-2xl mb-1">24/7</div>
            <div className="text-sm">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
