'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">💬</span>
            </div>
            <h1 className="text-2xl font-bold text-white">ChatFlow</h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="#features" className="text-white/80 hover:text-white transition-colors">Features</Link>
            <Link href="#comparison" className="text-white/80 hover:text-white transition-colors">Comparison</Link>
            <Link href="#about" className="text-white/80 hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
