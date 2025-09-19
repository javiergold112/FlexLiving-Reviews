'use client';
import React from 'react';
import { Star } from 'lucide-react';
import { api } from '../lib/api';

export default function ReviewsList({ reviews, onChange }: { reviews: any[]; onChange: ()=>void }) {
  const approve = async (id: string, approved: boolean, displayOnWebsite?: boolean) => {
    await api.approve(id, { approved, displayOnWebsite });
    onChange();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {reviews.map((r)=> (
        <div key={r.id} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">{r.guestName}</h4>
              <p className="text-sm text-gray-500">{r.propertyName} • {new Date(r.submittedAt).toLocaleDateString()}</p>
              <div className="flex items-center mt-2">
                <div className="flex">{Array.from({ length: 5 }).map((_,i)=> <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div>
                <span className="ml-2 text-sm text-gray-600 capitalize">{r.channel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.approved ? <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span> : <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>}
              {r.displayOnWebsite && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">On Website</span>}
            </div>
          </div>
          <p className="text-gray-700 mb-4">{r.publicReview}</p>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {!r.approved && <button onClick={()=>approve(r.id, true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>}
            {!r.displayOnWebsite && <button onClick={()=>approve(r.id, true, true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Display on Website</button>}
            {r.displayOnWebsite && <button onClick={()=>approve(r.id, true, false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Remove from Website</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
