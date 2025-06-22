import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { 
  Globe, AlertTriangle, TrendingUp, Zap, RefreshCw, 
  Calendar, Eye, Clock, Loader2 
} from 'lucide-react';
import { fetchNeoFeed } from '../api/nasaAPI'; 

const PremiumLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Globe className="w-8 h-8 text-orange-600 animate-pulse" />
      </div>
    </div>
    <div className="ml-6">
      <h3 className="text-lg font-semibold text-white">Loading Asteroid Data</h3>
      <p className="text-gray-400">Fetching from NASA NeoWs API...</p>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-400 mb-2">Data Loading Error</h3>
    <p className="text-red-300 mb-4">{message}</p>
    <button 
      onClick={onRetry}
      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Retry</span>
    </button>
  </div>
);

const CustomTooltip = ({ active, payload, label, type = 'default' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/20">
        <p className="font-medium text-white mb-2">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, subtitle, icon: Icon, children, className = "" }) => (
  <div className={`bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:border-white/30 transition-all duration-300 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
    {children}
  </div>
);

export default function NeoWsChart({ onStatsUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAsteroids: 0,
    potentiallyHazardous: 0,
    averageSize: 0,
    closestApproach: 0
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      const response = await fetchNeoFeed({
        start_date: startDate,
        end_date: endDate
      });
      
      const feed = response.data.near_earth_objects;
      
      const chartData = Object.keys(feed).sort().map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        count: feed[date].length,
        hazardous: feed[date].filter(asteroid => asteroid.is_potentially_hazardous_asteroid).length,
        safe: feed[date].filter(asteroid => !asteroid.is_potentially_hazardous_asteroid).length
      }));

      const allAsteroids = Object.values(feed).flat();
      const totalCount = allAsteroids.length;
      const hazardousCount = allAsteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
      
      const sizes = allAsteroids.map(a => 
        (a.estimated_diameter.kilometers.estimated_diameter_min + 
         a.estimated_diameter.kilometers.estimated_diameter_max) / 2
      );
      const avgSize = sizes.length > 0 ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length : 0;
      
      const distances = allAsteroids.map(a => 
        parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || 0)
      );
      const closestDistance = distances.filter(d => d > 0);
      const minDistance = closestDistance.length > 0 ? Math.min(...closestDistance) : 0;

      const calculatedStats = {
        totalAsteroids: totalCount,
        potentiallyHazardous: hazardousCount,
        averageSize: avgSize.toFixed(3),
        closestApproach: (minDistance / 1000000).toFixed(2) 
      };

      setStats(calculatedStats);
      if (onStatsUpdate) {
        onStatsUpdate(calculatedStats);
      }

      setData(chartData);
      
    } catch (err) {
      console.error('Error fetching NASA NeoWs data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch asteroid data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PremiumLoader />;
  
  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />;
  }

  const pieData = [
    { name: 'Safe Asteroids', value: stats.totalAsteroids - stats.potentiallyHazardous, color: '#10B981' },
    { name: 'Potentially Hazardous', value: stats.potentiallyHazardous, color: '#EF4444' }
  ];

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Asteroid Tracking Dashboard</h2>
          <p className="text-gray-400">Real-time near-Earth object monitoring</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Daily Asteroid Count" 
          subtitle="Tracked objects per day"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Risk Assessment" 
          subtitle="Hazard classification"
          icon={AlertTriangle}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard 
        title="Hazardous vs Safe Classification" 
        subtitle="Daily breakdown of asteroid classifications"
        icon={Globe}
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="safe" 
              fill="#10B981" 
              name="Safe" 
              radius={[0, 0, 4, 4]} 
              stackId="stack"
            />
            <Bar 
              dataKey="hazardous" 
              fill="#EF4444" 
              name="Hazardous" 
              radius={[4, 4, 0, 0]} 
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Last Updated</p>
            <p className="font-semibold text-lg text-white">{new Date().toLocaleString()}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          Data refreshed from NASA's Near Earth Object Web Service via backend API. Next automatic update in 1 hour. 
          All distance measurements are in kilometers, and size estimates represent average diameter values.
        </p>
      </div>

      <div className="fixed top-20 right-4 z-30">
        <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-3 shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Live Data</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-400">{data?.length || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Days Tracked</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-red-400">{stats.potentiallyHazardous}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">High Risk</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-400">{stats.totalAsteroids - stats.potentiallyHazardous}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Low Risk</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-400">{stats.averageSize}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Size (km)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Approach Velocity Distribution" 
          subtitle="Speed analysis of tracked objects"
          icon={Zap}
        >
          <div className="space-y-4">
            {data?.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{day.date}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${(day.count / Math.max(...data.map(d => d.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white w-8">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard 
          title="Risk Assessment Timeline" 
          subtitle="Hazard level progression"
          icon={AlertTriangle}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="hazardous" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Powered by NASA Near Earth Object Web Service (NeoWs) API</p>
        <p className="mt-1">Data updated every hour • All times in UTC</p>
      </div>
    </div>
  );
}