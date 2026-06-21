'use client';

import { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

export type SeatStatus = 'available' | 'booked' | 'reserved' | 'unavailable';

export interface SeatSelectionSeat {
  id: string;
  row: string;
  number: number;
  label: string;
  status: SeatStatus;
  section?: string;
  price?: number;
}

export interface SeatSelectionProps {
  seats: SeatSelectionSeat[];
  maxSelectable?: number;
  initialSelectedSeatIds?: string[];
  onSelectionChange?: (selectedSeatIds: string[]) => void;
  className?: string;
}

const statusStyles: Record<SeatStatus, string> = {
  available:
    'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200 focus-visible:ring-emerald-500',
  booked: 'bg-gray-700 text-white border-gray-700 cursor-not-allowed',
  reserved: 'bg-amber-100 text-amber-900 border-amber-300 cursor-not-allowed',
  unavailable: 'bg-red-100 text-red-900 border-red-300 cursor-not-allowed',
};

const statusLabels: Record<SeatStatus, string> = {
  available: 'Available',
  booked: 'Booked',
  reserved: 'Reserved',
  unavailable: 'Unavailable',
};

const ZOOM_LEVELS = [0.85, 1, 1.15, 1.3];

export default function SeatSelection({
  seats,
  maxSelectable = 4,
  initialSelectedSeatIds = [],
  onSelectionChange,
  className = '',
}: SeatSelectionProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(initialSelectedSeatIds);
  const [zoomIndex, setZoomIndex] = useState(1);

  const rows = useMemo(() => Array.from(new Set(seats.map((seat) => seat.row))).sort(), [seats]);

  const columns = useMemo(
    () => Array.from(new Set(seats.map((seat) => seat.number))).sort((a, b) => a - b),
    [seats],
  );

  const seatMatrix = useMemo(() => {
    const map = new Map<string, Map<number, SeatSelectionSeat>>();
    for (const seat of seats) {
      const rowMap = map.get(seat.row) ?? new Map<number, SeatSelectionSeat>();
      rowMap.set(seat.number, seat);
      map.set(seat.row, rowMap);
    }
    return map;
  }, [seats]);

  const selectedSet = useMemo(() => new Set(selectedSeatIds), [selectedSeatIds]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSet.has(seat.id)),
    [seats, selectedSet],
  );

  const seatSize = Math.max(36, Math.round(44 * ZOOM_LEVELS[zoomIndex]));

  const toggleSeat = (seat: SeatSelectionSeat) => {
    if (seat.status !== 'available') {
      return;
    }

    setSelectedSeatIds((currentSelected) => {
      const selected = new Set(currentSelected);
      if (selected.has(seat.id)) {
        selected.delete(seat.id);
      } else {
        if (selected.size >= maxSelectable) {
          return currentSelected;
        }
        selected.add(seat.id);
      }
      const payload = Array.from(selected);
      onSelectionChange?.(payload);
      return payload;
    });
  };

  const handleZoomIn = () => {
    setZoomIndex((current) => Math.min(current + 1, ZOOM_LEVELS.length - 1));
  };

  const handleZoomOut = () => {
    setZoomIndex((current) => Math.max(current - 1, 0));
  };

  const handleResetZoom = () => {
    setZoomIndex(1);
  };

  return (
    <div
      className={`space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Seating map
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            Pick your seat
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Tap any available seat, then continue to checkout. You can select up to {maxSelectable}{' '}
            seats.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
          >
            <ZoomOut className="h-4 w-4" />
            Zoom out
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
          >
            <ZoomIn className="h-4 w-4" />
            Zoom in
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Stage</p>
              <div className="mt-2 h-4 w-32 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              Zoom {Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%
            </span>
          </div>

          <div
            className="overflow-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-inner dark:border-slate-700 dark:bg-slate-900"
            style={{ minHeight: 320 }}
          >
            <div
              className="inline-grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, ${seatSize}px)`,
                transformOrigin: 'top left',
              }}
              data-testid="seat-grid"
            >
              {rows.map((row) => (
                <div key={row} className="contents">
                  {columns.map((column) => {
                    const seat = seatMatrix.get(row)?.get(column);
                    const isSelected = seat ? selectedSet.has(seat.id) : false;
                    const isMissing = !seat;
                    return (
                      <button
                        key={`${row}-${column}`}
                        type="button"
                        onClick={() => seat && toggleSeat(seat)}
                        disabled={!seat || seat.status !== 'available'}
                        className={`flex flex-col items-center justify-center rounded-2xl border text-[0.7rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isMissing
                            ? 'cursor-default bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-700'
                            : isSelected
                              ? 'border-blue-500 bg-blue-100 text-blue-900 shadow-sm dark:bg-blue-950 dark:text-blue-200 dark:border-blue-400'
                              : `${statusStyles[seat.status]} ${seat.status === 'available' ? 'hover:border-emerald-500' : ''}`
                        }`}
                        style={{ width: seatSize, height: seatSize }}
                        aria-label={
                          seat
                            ? `${seat.label} ${statusLabels[seat.status]}${isSelected ? ', selected' : ''}`
                            : 'Empty seat'
                        }
                      >
                        {seat ? seat.label : ''}
                        {seat && seat.price !== undefined && (
                          <span className="mt-0.5 text-[0.6rem] text-slate-500 dark:text-slate-400">
                            ${seat.price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-gray-900">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Selection
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {selectedSeats.length === 0
                ? 'No seats selected yet.'
                : `Selected ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
            {selectedSeats.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose available seats from the map.
              </p>
            ) : (
              selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {seat.label}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {seat.section ?? 'General'} • ${seat.price?.toFixed(2) ?? '—'}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Available</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[0.7rem] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Free
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Reserved</span>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-[0.7rem] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Locked
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Booked</span>
              <span className="rounded-full bg-slate-700 px-2 py-1 text-[0.7rem] font-semibold text-white">
                Taken
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Unavailable</span>
              <span className="rounded-full bg-red-100 px-2 py-1 text-[0.7rem] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                Unavailable
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
