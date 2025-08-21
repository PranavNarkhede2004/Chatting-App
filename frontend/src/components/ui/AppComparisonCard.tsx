'use client';

interface AppComparisonCardProps {
  name: string;
  icon: string;
  description: string;
  color: string;
  hasFeature: boolean;
}

export default function AppComparisonCard({
  name,
  icon,
  description,
  color,
  hasFeature
}: AppComparisonCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{name}</h4>
      <p className="text-white/80 text-sm">{description}</p>
      {hasFeature && (
        <p className="text-green-400 text-sm mt-2">✓ We have this</p>
      )}
    </div>
  );
}
