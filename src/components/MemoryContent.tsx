import React from 'react';
import { Memory } from '../types';

interface MemoryContentProps {
  memory: Memory;
  className?: string;
}

export default function MemoryContent({ memory, className = '' }: MemoryContentProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stickers */}
      {memory.metadata?.stickers && memory.metadata.stickers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memory.metadata.stickers.map((sticker, index) => (
            <span
              key={`${memory.id}-sticker-${index}`}
              className="text-2xl hover:scale-110 transition-transform cursor-default"
            >
              {sticker}
            </span>
          ))}
        </div>
      )}

      {/* Rich Text Content */}
      <div
        className="prose prose-sm max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: memory.content }}
      />

      {/* Attachments */}
      {memory.metadata?.attachments && memory.metadata.attachments.length > 0 && (
        <div className="space-y-4">
          {memory.metadata.attachments.map((attachment, index) => (
            <div key={`${memory.id}-attachment-${index}`} className="relative rounded-xl overflow-hidden bg-gray-100">
              {attachment.type.startsWith('image/') && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      console.error('Error loading image:', attachment.url);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiNFNUU1RTUiLz48dGV4dCB4PSI5NjAiIHk9IjU0MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
              )}
              {attachment.type === 'video' && (
                <video
                  src={attachment.url}
                  controls
                  className="w-full rounded-xl"
                />
              )}
              {attachment.type === 'audio' && (
                <audio
                  src={attachment.url}
                  controls
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {memory.metadata?.tags && memory.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memory.metadata.tags.map((tag, index) => (
            <span
              key={`${memory.id}-tag-${index}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20 text-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 