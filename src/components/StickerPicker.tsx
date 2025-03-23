import React from 'react';
import { Smile } from 'lucide-react';

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  selectedStickers: string[];
}

const STICKER_CATEGORIES = [
  {
    name: 'Emotions',
    stickers: ['😊', '😂', '🥰', '😍', '🤗', '😎', '🥳', '😌']
  },
  {
    name: 'Activities',
    stickers: ['🎮', '🎨', '📚', '🎵', '🎬', '⚽', '🎭', '🍳']
  },
  {
    name: 'Nature',
    stickers: ['🌸', '🌈', '🌟', '🌙', '🌺', '🍀', '🌴', '🌊']
  },
  {
    name: 'Celebrations',
    stickers: ['🎉', '🎂', '🎁', '🎊', '🎈', '🏆', '🥂', '✨']
  }
];

export default function StickerPicker({ onSelect, selectedStickers }: StickerPickerProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Add Stickers</h3>
        <Smile className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {STICKER_CATEGORIES.map(category => (
          <div key={category.name}>
            <h4 className="text-xs font-medium text-gray-500 mb-2">{category.name}</h4>
            <div className="grid grid-cols-4 gap-2">
              {category.stickers.map(sticker => (
                <button
                  key={sticker}
                  onClick={() => onSelect(sticker)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-xl hover:bg-gray-100 transition-colors ${
                    selectedStickers.includes(sticker) ? 'bg-indigo-100' : ''
                  }`}
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}