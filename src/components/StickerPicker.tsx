import React from 'react';
import { motion } from 'framer-motion';

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
  selectedStickers: string[];
}

const stickerCategories = [
  {
    name: 'Emotions',
    stickers: ['😊', '😢', '😍', '😭', '😤', '😴', '😇', '😈', '😎', '😡']
  },
  {
    name: 'Activities',
    stickers: ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻']
  },
  {
    name: 'Nature',
    stickers: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻']
  },
  {
    name: 'Celebrations',
    stickers: ['🎉', '🎊', '🎈', '🎁', '🎂', '🎃', '🎄', '🎅', '🎆', '🎇']
  }
];

export default function StickerPicker({ onSelect, selectedStickers }: StickerPickerProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80">
      <div className="space-y-4">
        {stickerCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{category.name}</h3>
            <div className="grid grid-cols-5 gap-2">
              {category.stickers.map((sticker, index) => (
                <motion.button
                  key={`${category.name}-${sticker}-${index}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(sticker)}
                  className={`p-2 rounded-lg text-2xl transition-colors ${
                    selectedStickers.includes(sticker)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {sticker}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}