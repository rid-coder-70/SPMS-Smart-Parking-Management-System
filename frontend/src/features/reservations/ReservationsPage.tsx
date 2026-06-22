import React, { useState, useCallback } from 'react';
import ReservationForm    from './ReservationForm';
import MyReservationsPage from './MyReservationsPage';
import CheckInOutPage     from './CheckInOutPage';
import { PlusCircle, List, LogIn, CalendarCheck } from 'lucide-react';

type Tab = 'book' | 'my' | 'session';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'book',    label: 'Book a Slot',     icon: <PlusCircle className="h-4 w-4" /> },
  { id: 'my',      label: 'My Reservations', icon: <List       className="h-4 w-4" /> },
  { id: 'session', label: 'Check In / Out',  icon: <LogIn      className="h-4 w-4" /> },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('book');

  const handleBookSuccess = useCallback(() => setActiveTab('my'), []);

  return (
    <div className="space-y-0 animate-fade-in">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-blue-400" />
          Parking Reservations
        </h1>
        <p className="text-sm text-white/40 mt-1">Book slots, view reservations, and manage check-in/out.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-white/5 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl
              border-b-2 transition-all duration-150 -mb-px
              ${activeTab === tab.id
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/3'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'book'    && <ReservationForm onSuccess={handleBookSuccess} />}
        {activeTab === 'my'      && <MyReservationsPage />}
        {activeTab === 'session' && <CheckInOutPage />}
      </div>
    </div>
  );
}
