import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { format, startOfYear, endOfYear, eachMonthOfInterval, getYear, subYears } from 'date-fns';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Filter,
  ChevronDown,
  Clock,
  Tag as TagIcon,
  Sparkles,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/analytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Memory {
  id: string;
  category: string;
  created_at: string;
  metadata: {
    rating?: number;
    tags?: string[];
  };
}

interface CategoryMetadata {
  category: string;
  icon_name: string;
  color: string;
  description: string;
}

interface AnalyticsData {
  totalMemories: number;
  averageRating: number;
  topCategories: { category: string; count: number; color: string }[];
  monthlyActivity: { month: string; count: number }[];
  yearComparison: { year: number; count: number }[];
  categoryTrends: { category: string; counts: number[]; color: string }[];
  popularTags: { tag: string; count: number }[];
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'year' | 'all'>('year');
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.analytics-dropdown')) {
        setTimeframeDropdownOpen(false);
        setYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchAnalyticsData();
    }
  }, [user, selectedYear, selectedTimeframe]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('category_metadata')
        .select('*')
        .order('category');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Fetch memories based on timeframe
      const query = supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: true });

      if (selectedTimeframe === 'year') {
        const startDate = startOfYear(new Date(selectedYear, 0));
        const endDate = endOfYear(new Date(selectedYear, 0));
        query.gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }

      const { data: memories, error } = await query;

      if (error) throw error;

      // Process analytics data
      const data = processAnalyticsData(memories || []);
      setAnalyticsData(data);
    } catch (error) {
      toast.error('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (memories: Memory[]): AnalyticsData => {
    // Calculate total memories
    const totalMemories = memories.length;
    
    // Calculate average rating
    const ratings = memories
      .map(m => m.metadata.rating || 0)
      .filter(r => r > 0);
    const averageRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    
    // Calculate top categories
    const categoryCount = memories.reduce((acc, memory) => {
      acc[memory.category] = (acc[memory.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => {
        const categoryMeta = categories.find(c => c.category === category);
        return {
          category,
          count,
          color: categoryMeta?.color || '#4F46E5',
          label: categoryMeta?.description || category
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate monthly activity
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0)),
      end: endOfYear(new Date(selectedYear, 0))
    });

    const monthlyActivity = months.map(month => ({
      month: format(month, 'MMM'),
      count: memories.filter(m => 
        format(new Date(m.created_at), 'MMM yyyy') === format(month, 'MMM yyyy')
      ).length
    }));

    // Calculate year comparison
    const years = Array.from(
      { length: 3 },
      (_, i) => selectedYear - i
    );

    const yearComparison = years.map(year => ({
      year,
      count: memories.filter(m => 
        getYear(new Date(m.created_at)) === year
      ).length
    }));

    // Calculate category trends
    const categoryTrends = topCategories.map(({ category, color }) => ({
      category,
      color,
      counts: monthlyActivity.map(month => 
        memories.filter(m => 
          m.category === category &&
          format(new Date(m.created_at), 'MMM') === month.month
        ).length
      )
    }));

    // Calculate popular tags
    const tagCount = memories.reduce((acc, memory) => {
      (memory.metadata.tags || []).forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const popularTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalMemories,
      averageRating,
      topCategories,
      monthlyActivity,
      yearComparison,
      categoryTrends,
      popularTags
    };
  };

  const renderActivityChart = () => {
    if (!analyticsData) return null;

    const data = {
      labels: analyticsData.monthlyActivity.map(m => m.month),
      datasets: [
        {
          label: 'Memories Created',
          data: analyticsData.monthlyActivity.map(m => m.count),
          fill: true,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Monthly Activity'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  const renderCategoryChart = () => {
    if (!analyticsData) return null;

    // Map categories to their metadata colors
    const categoryColors = analyticsData.topCategories.map(c => {
      const meta = categories.find(m => m.category === c.category);
      return meta?.color || '#4F46E5';
    });

    // Format category labels to be more readable
    const formattedLabels = analyticsData.topCategories.map(c => 
      c.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );

    const chartData = {
      labels: formattedLabels,
      datasets: [
        {
          data: analyticsData.topCategories.map(c => c.count),
          backgroundColor: categoryColors.map(color => `${color}CC`), // Add transparency
          borderColor: categoryColors,
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            padding: 20,
            font: {
              size: 12
            },
            generateLabels: (chart: any) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label: string, i: number) => ({
                  text: `${label} (${data.datasets[0].data[i]})`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 1,
                  hidden: false,
                  index: i
                }));
              }
              return [];
            }
          }
        },
        title: {
          display: true,
          text: 'Top Categories',
          font: {
            size: 16,
            weight: 'bold' as const
          },
          padding: {
            bottom: 20
          }
        }
      }
    };

    return <Doughnut data={chartData} options={options} />;
  };

  const renderYearComparisonChart = () => {
    if (!analyticsData) return null;

    const data = {
      labels: analyticsData.yearComparison.map(y => y.year.toString()),
      datasets: [
        {
          label: 'Memories Created',
          data: analyticsData.yearComparison.map(y => y.count),
          backgroundColor: '#4F46E5'
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Year Comparison'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const renderCategoryTrendsChart = () => {
    if (!analyticsData) return null;

    // Get category colors for trends
    const trendColors = analyticsData.categoryTrends.map(trend => {
      const meta = categories.find(m => m.category === trend.category);
      return meta?.color || '#4F46E5';
    });

    const chartData = {
      labels: analyticsData.monthlyActivity.map(m => m.month),
      datasets: analyticsData.categoryTrends.map((trend, index) => ({
        label: trend.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        data: trend.counts,
        borderColor: trendColors[index],
        backgroundColor: `${trendColors[index]}20`, // Light transparency for fill
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: trendColors[index],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: true,
          text: 'Category Trends',
          font: {
            size: 16,
            weight: 700
          },
          padding: {
            bottom: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    return <Line data={chartData} options={options} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="analytics-loading">
            <Activity className="analytics-loading-icon" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <SEO 
        title="Memory Analytics - Look Back"
        description="Gain insights into your memories with detailed analytics, charts, and trends."
        type="article"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Activity Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track and analyze your memory capturing patterns
            </p>
          </div>
          
          <div className="analytics-controls">
            <div className="analytics-dropdown">
              <button 
                className="analytics-filter-button"
                onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
              >
                <Filter className="w-4 h-4" />
                <span>{selectedTimeframe === 'year' ? 'This Year' : 'All Time'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${timeframeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {timeframeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="analytics-dropdown-menu"
                  >
                    <div className="analytics-dropdown-header">Time Range</div>
                    <div 
                      className={`analytics-dropdown-item ${selectedTimeframe === 'year' ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTimeframe('year');
                        setTimeframeDropdownOpen(false);
                      }}
                    >
                      <svg className="analytics-dropdown-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>This Year</span>
                    </div>
                    <div 
                      className={`analytics-dropdown-item ${selectedTimeframe === 'all' ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTimeframe('all');
                        setTimeframeDropdownOpen(false);
                      }}
                    >
                      <svg className="analytics-dropdown-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>All Time</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedTimeframe === 'year' && (
              <div className="analytics-dropdown">
                <button 
                  className="analytics-filter-button"
                  onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                >
                  <Clock className="w-4 h-4" />
                  <span>{selectedYear}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {yearDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="analytics-dropdown-menu"
                    >
                      <div className="analytics-dropdown-header">Select Year</div>
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i
                      ).map(year => (
                        <div
                          key={year}
                          className={`analytics-dropdown-item ${year === selectedYear ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedYear(year);
                            setYearDropdownOpen(false);
                          }}
                        >
                          <svg className="analytics-dropdown-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>{year}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="analytics-stat-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BarChart3 className="stat-icon" />
                <h3 className="stat-label">Total Memories</h3>
                <p className="stat-value">{analyticsData.totalMemories}</p>
              </motion.div>

              <motion.div 
                className="analytics-stat-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="stat-icon" />
                <h3 className="stat-label">Average Rating</h3>
                <p className="stat-value">{analyticsData.averageRating.toFixed(1)}</p>
              </motion.div>

              <motion.div 
                className="analytics-stat-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <PieChart className="stat-icon" />
                <h3 className="stat-label">Top Category</h3>
                <p className="stat-value">
                  {analyticsData.topCategories[0]?.category.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') || 'N/A'}
                </p>
              </motion.div>

              <motion.div 
                className="analytics-stat-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="stat-icon" />
                <h3 className="stat-label">Most Active Month</h3>
                <p className="stat-value">
                  {analyticsData.monthlyActivity.reduce((max, month) => 
                    month.count > max.count ? month : max
                  ).month}
                </p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="space-y-8">
              <motion.div 
                className="analytics-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="chart-title">Activity Overview</h3>
                <div className="analytics-chart-container">
                  {renderActivityChart()}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                  className="analytics-chart-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="chart-title">Category Distribution</h3>
                  <div className="analytics-chart-container">
                    {renderCategoryChart()}
                  </div>
                </motion.div>

                <motion.div 
                  className="analytics-chart-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="chart-title">Year-over-Year Comparison</h3>
                  <div className="analytics-chart-container">
                    {renderYearComparisonChart()}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="analytics-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="chart-title">Category Trends</h3>
                <div className="analytics-chart-container">
                  {renderCategoryTrendsChart()}
                </div>
              </motion.div>

              {/* Popular Tags */}
              <motion.div 
                className="analytics-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-indigo-500" />
                  <h3 className="chart-title mb-0">Popular Tags</h3>
                </div>
                <div className="analytics-tags-section">
                  {analyticsData.popularTags.map(({ tag, count }) => (
                    <motion.span
                      key={tag}
                      className="analytics-tag"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {tag}
                      <span className="tag-count">{count}</span>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}