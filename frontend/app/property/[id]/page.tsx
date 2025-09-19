'use client';
import React from 'react';
import PropertyView from '../../../components/PropertyView';
import { useParams, useRouter } from 'next/navigation';

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <PropertyView
      property={{ propertyId: decodeURIComponent(id), propertyName: decodeURIComponent(id) }}
      onBack={() => router.push('/')}
    />
  );
}
