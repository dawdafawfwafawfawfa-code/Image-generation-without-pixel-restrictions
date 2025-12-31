import React from 'react';
import { AspectRatio } from '../types';
import { Square, Monitor, Smartphone, RectangleHorizontal, RectangleVertical } from 'lucide-react';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onChange, disabled }) => {
  const ratios = [
    { value: AspectRatio.Square, label: '1:1', icon: Square, desc: 'Square' },
    { value: AspectRatio.Landscape, label: '16:9', icon: Monitor, desc: 'Cinema' },
    { value: AspectRatio.Portrait, label: '9:16', icon: Smartphone, desc: 'Mobile' },
    { value: AspectRatio.Wide, label: '4:3', icon: RectangleHorizontal, desc: 'Wide' },
    { value: AspectRatio.Tall, label: '3:4', icon: RectangleVertical, desc: 'Tall' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {ratios.map((ratio) => {
        const Icon = ratio.icon;
        const isSelected = selected === ratio.value;
        return (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
              min-w-[80px] flex-1 sm:flex-none
              ${isSelected 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600 hover:text-slate-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Icon size={20} className="mb-2" />
            <span className="text-xs font-semibold">{ratio.label}</span>
            <span className="text-[10px] opacity-70">{ratio.desc}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AspectRatioSelector;