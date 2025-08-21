'use client';

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-white/60">
            Built with inspiration from WhatsApp, Telegram, Discord, and Signal
          </p>
          <p className="text-white/40 text-sm mt-2">
            Combining the best of all worlds into one unified messaging experience
          </p>
        </div>
      </div>
    </footer>
  );
}
