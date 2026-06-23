import React, { useState, useCallback } from 'react';
import ReservationForm    from './ReservationForm';
import MyReservationsPage from './MyReservationsPage';

import { PlusCircle, List, CalendarCheck } from 'lucide-react';

type Tab = 'book' | 'my';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'book',    label: 'Book a Slot',     icon: <PlusCircle className="h-4 w-4" /> },
  { id: 'my',      label: 'My Reservations', icon: <List       className="h-4 w-4" /> },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('book');

  const handleBookSuccess = useCallback(() => setActiveTab('my'), []);

  return (
    <div className="space-y-0 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-orange-500" />
          Parking Reservations
        </h1>
        <p className="text-sm text-gray-500 mt-1">Book slots and view your reservations.</p>
      </div>

      <div className="flex gap-1 border-b border-orange-100 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl
              border-b-2 transition-all duration-150 -mb-px
              ${activeTab === tab.id
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-orange-50/60'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'book'    && <ReservationForm onSuccess={handleBookSuccess} />}
        {activeTab === 'my'      && <MyReservationsPage />}
      </div>
    </div>
  );
}
