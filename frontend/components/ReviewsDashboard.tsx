'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, MessageSquare, Star, Home, Globe } from 'lucide-react';
import { api } from '../lib/api';
import ReviewsList from './ReviewsList';

export default function ReviewsDashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'reviews'>('dashboard');
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([
        api.listReviews(filters as any),
        api.analytics(filters as any),
      ]);
      setReviews(r.data ?? []);
      setAnalytics(a.data ?? {});
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const properties = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of reviews) if (!map.has(r.propertyId)) map.set(r.propertyId, r.propertyName);
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [reviews]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">FlexLiving Reviews</h1>
          <div className="flex gap-2">
            <button
              onClick={() => api.sync().then(load)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sync Reviews
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-2 rounded-lg ${activeView==='dashboard'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('reviews')}
              className={`px-3 py-2 rounded-lg ${activeView==='reviews'?'bg-gray-900 text-white':'hover:bg-gray-100'}`}
            >
              All Reviews
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <select className="px-3 py-2 border rounded-lg" value={filters.propertyId||''} onChange={e=>setFilters({...filters, propertyId:e.target.value||undefined})}>
            <option value="">All Properties</option>
            {properties.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="px-3 py-2 border rounded-lg" value={filters.channel||''} onChange={e=>setFilters({...filters, channel:e.target.value||undefined})}>
            <option value="">All Channels</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking.com">Booking.com</option>
            <option value="vrbo">VRBO</option>
            <option value="direct">Direct</option>
          </select>
          <select className="px-3 py-2 border rounded-lg" value={filters.minRating||''} onChange={e=>setFilters({...filters, minRating:e.target.value||undefined})}>
            <option value="">Any Rating</option>
            {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r}+ stars</option>)}
          </select>
          <select className="px-3 py-2 border rounded-lg" value={filters.approved||''} onChange={e=>setFilters({...filters, approved:e.target.value||undefined})}>
            <option value="">Any Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <input type="date" className="px-3 py-2 border rounded-lg" value={filters.startDate||''} onChange={e=>setFilters({...filters, startDate:e.target.value||undefined})} />
          <input type="date" className="px-3 py-2 border rounded-lg" value={filters.endDate||''} onChange={e=>setFilters({...filters, endDate:e.target.value||undefined})} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : activeView === 'dashboard' ? (
        <DashboardView analytics={analytics} properties={properties} />
      ) : (
        <ReviewsList reviews={reviews} onChange={load} />
      )}
    </div>
  );
}

function DashboardView({ analytics, properties }: { analytics: any; properties: Array<{id: string; name: string}>; }) {
  const stats = [
    { label: 'Total Reviews', value: analytics?.totalReviews || 0, icon: MessageSquare, trend: '+12%', up: true },
    { label: 'Average Rating', value: (analytics?.averageRating || 0).toFixed(1), icon: Star, trend: '+0.2', up: true },
    { label: 'Approval Rate', value: `${Math.round((analytics?.approvalRate || 0) * 100)}%`, icon: Star, trend: '+5%', up: true },
    { label: 'Properties', value: properties.length, icon: Home, trend: '0', up: false },
  ];

  const ratingData = analytics?.ratingDistribution || [];
  const maxCount = Math.max(...ratingData.map((r:any)=>r.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s:any,i:number)=> (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <s.icon className="w-8 h-8 text-blue-600" />
              <span className={`text-sm ${s.up? 'text-green-600':'text-gray-500'}`}>{s.trend}</span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5,4,3,2,1].map((rating)=>{
              const data = ratingData.find((r:any)=>r.rating===rating) || { count: 0 };
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-20 flex items-center"><span className="text-sm font-medium">{rating}</span><Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400"/></div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${(data.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm">{data.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Reviews by Channel</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.channelBreakdown||{}).map(([channel,count]:any)=> (
              <div key={channel} className="flex items-center justify-between">
                <div className="flex items-center"><Globe className="w-5 h-5 text-gray-400 mr-3"/><span className="font-medium capitalize">{channel}</span></div>
                <span className="text-2xl font-bold">{count as any}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-600">Property</th>
                <th className="pb-3 text-gray-600">Reviews</th>
                <th className="pb-3 text-gray-600">Avg Rating</th>
                <th className="pb-3 text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.propertyPerformance||[]).slice(0,5).map((p:any,i:number)=> (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-4">{p.propertyName}</td>
                  <td className="py-4">{p.totalReviews}</td>
                  <td className="py-4 flex items-center"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1"/>{p.averageRating}</td>
                  <td className="py-4">
                    <Link
                      href={`/property/${encodeURIComponent(p.propertyId)}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
