'use client';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-white mb-6">
            The Future of
            <span className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent"> Messaging</span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Experience the perfect blend of WhatsApp's simplicity, Telegram's speed, and Discord's community features
            in one powerful platform. Join millions who've made the switch to smarter communication.
          </p>

          {/* Messaging Apps Comparison */}
          <div className="flex justify-center space-x-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-white text-sm">Like WhatsApp</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">✈️</span>
              </div>
              <p className="text-white text-sm">Faster than Telegram</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-white text-sm">Communities like Discord</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
