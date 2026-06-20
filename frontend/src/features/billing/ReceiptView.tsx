import type { Transaction } from '@/common/types';

export interface ReceiptViewProps {
  transaction: Transaction;
}

export function ReceiptView({ transaction }: ReceiptViewProps) {
  const hours = Math.floor(transaction.durationMinutes / 60);
  const minutes = transaction.durationMinutes % 60;
  
  return (
    <div className="card max-w-sm mx-auto bg-white text-night-900 border-none print:shadow-none print:border print:border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-tighter">SPMS</h2>
        <p className="text-sm font-medium opacity-60">Parking Receipt</p>
      </div>

      <div className="space-y-3 text-sm border-y border-dashed border-gray-300 py-4 my-4">
        <div className="flex justify-between">
          <span className="opacity-70">Receipt ID:</span>
          <span className="font-mono font-medium">#{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Check-in:</span>
          <span className="font-medium text-right max-w-[150px]">{new Date(transaction.checkInTime).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Check-out:</span>
          <span className="font-medium text-right max-w-[150px]">{new Date(transaction.checkOutTime).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Duration:</span>
          <span className="font-medium">{hours}h {minutes}m</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <span className="text-lg font-bold">Total Paid:</span>
        <span className="text-2xl font-black">${transaction.totalFee.toFixed(2)}</span>
      </div>

      <button 
        onClick={() => window.print()}
        className="mt-8 w-full bg-night-900 text-white py-3 rounded-lg font-semibold hover:bg-night-800 transition-colors print:hidden"
      >
        Print Receipt
      </button>
    </div>
  );
}
