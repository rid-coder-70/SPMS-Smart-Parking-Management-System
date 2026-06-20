import React, { useState } from 'react';
import ReservationForm       from './ReservationForm';
import MyReservationsPage    from './MyReservationsPage';
import CheckInOutPage        from './CheckInOutPage';
import { PlusCircle, List, LogIn } from 'lucide-react';

type Tab = 'book' | 'my' | 'session';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'book',    label: 'Book a Slot',        icon: <PlusCircle className="h-4 w-4" /> },
  { id: 'my',      label: 'My Reservations',    icon: <List       className="h-4 w-4" /> },
  { id: 'session', label: 'Check In / Out',     icon: <LogIn      className="h-4 w-4" /> },
];

const ReservationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('book');

  return (
    <div className="min-h-screen bg-night-900">
      {/* Page header */}
      <div className="border-b border-night-700 bg-night-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="pt-8 pb-0">
            <h1 className="text-2xl font-bold text-white mb-5">Parking Reservations</h1>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-night-700">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg
                    border-b-2 transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'book'    && <ReservationForm onSuccess={() => setActiveTab('my')} />}
        {activeTab === 'my'      && <MyReservationsPage />}
        {activeTab === 'session' && <CheckInOutPage />}
      </div>
    </div>
  );
};

export default ReservationsPage;
