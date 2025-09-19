'use client';
import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';

export default function PropertyView({ property, onBack }: { property: any; onBack: ()=>void }) {
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => { load(); }, [property?.propertyId]);

  const load = async () => {
    const res = await api.listReviews({
      propertyId: property.propertyId,
      approved: 'true',
      displayOnWebsite: 'true',
      limit: 100,
    });
  
    setReviews(res.data ?? []);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={onBack} className="mb-4 text-gray-300 hover:text-white">← Back to Dashboard</button>
          <h1 className="text-4xl font-bold mb-2">{property.propertyName}</h1>
          <div className="flex items-center mt-4">
            <div className="flex items-center mr-6"><Star className="w-6 h-6 fill-yellow-400 text-yellow-400 mr-2"/><span className="text-2xl font-bold">{property.averageRating?.toFixed?.(1) || '4.5'}</span></div>
            <span className="text-lg">{property.totalReviews || reviews.length} Reviews</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Guest Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r)=> (
            <div key={r.id} className="border rounded-lg p-6 hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{r.guestName}</h4>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_,i)=> <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                    <span className="ml-2 text-sm text-gray-500">{new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{r.publicReview}</p>
              {r.channel && <div className="mt-4 pt-4 border-t"><span className="text-xs text-gray-500 capitalize">via {r.channel}</span></div>}
            </div>
          ))}
        </div>
        {!reviews.length && (
          <div className="text-center py-12 text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300"/><p>No reviews to display yet.</p></div>
        )}
      </div>
    </div>
  );
}
