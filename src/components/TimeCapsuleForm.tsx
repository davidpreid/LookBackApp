import React, { useState } from 'react';
import { Lock, Gift, X, ChevronDown } from 'lucide-react';
import { format, add } from 'date-fns';
import { Memory } from '../types';
import { toast } from 'react-hot-toast';

interface TimeCapsuleFormProps {
  memories: Memory[];
  onSubmit: (data: {
    name: string;
    description: string;
    lockPeriod: string;
    selectedMemories: Memory[];
  }) => Promise<void>;
  onCancel: () => void;
}

const LOCK_PERIODS = [
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
  { label: '2 Years', value: '2y' },
  { label: '5 Years', value: '5y' },
];

export default function TimeCapsuleForm({ memories, onSubmit, onCancel }: TimeCapsuleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lockPeriod: '1y',
    selectedMemories: [] as Memory[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedMemories.length === 0) {
      toast.error('Please select at least one memory to include in the time capsule');
      return;
    }
    await onSubmit(formData);
  };

  const handleMemorySelect = (memory: Memory) => {
    setFormData(prev => {
      const isSelected = prev.selectedMemories.some(m => m.id === memory.id);
      return {
        ...prev,
        selectedMemories: isSelected
          ? prev.selectedMemories.filter(m => m.id !== memory.id)
          : [...prev.selectedMemories, memory]
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Create Time Capsule
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Capsule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input bg-white w-full"
              placeholder="Give your capsule a meaningful name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lock Period
            </label>
            <select
              value={formData.lockPeriod}
              onChange={(e) => setFormData({ ...formData, lockPeriod: e.target.value })}
              className="input bg-white w-full"
            >
              {LOCK_PERIODS.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input bg-white w-full"
            placeholder="What makes this time capsule special?"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-900">Time Capsule Lock</h3>
            <p className="text-sm text-amber-700">
              This capsule will be locked until {format(add(new Date(), { years: 1 }), 'PPP')}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Memories
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  formData.selectedMemories.some(m => m.id === memory.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
                onClick={() => handleMemorySelect(memory)}
              >
                <h3 className="font-medium text-gray-900 mb-2">{memory.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{memory.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {memory.metadata?.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                               bg-indigo-50 text-indigo-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700
                   hover:bg-gray-50 transition-all duration-200"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                     text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50
                     transition-all duration-300 hover:translate-y-[-1px]"
          >
            <Gift className="h-4 w-4" />
            Create Time Capsule
          </button>
        </div>
      </div>
    </form>
  );
} 