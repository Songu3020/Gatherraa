import { render, screen, fireEvent } from '@testing-library/react';
import SeatSelection, { type SeatSelectionSeat } from './SeatSelection';

describe('SeatSelection', () => {
  const seats: SeatSelectionSeat[] = [
    {
      id: 'A1',
      row: 'A',
      number: 1,
      label: 'A1',
      status: 'available',
      section: 'Front',
      price: 180,
    },
    { id: 'A2', row: 'A', number: 2, label: 'A2', status: 'booked', section: 'Front', price: 180 },
    {
      id: 'B1',
      row: 'B',
      number: 1,
      label: 'B1',
      status: 'reserved',
      section: 'Front',
      price: 150,
    },
    {
      id: 'B2',
      row: 'B',
      number: 2,
      label: 'B2',
      status: 'unavailable',
      section: 'Front',
      price: 150,
    },
  ];

  it('renders seat grid and legend', () => {
    render(<SeatSelection seats={seats} />);

    expect(screen.getByText('Pick your seat')).toBeInTheDocument();
    expect(screen.getByLabelText('A1 Available')).toBeInTheDocument();
    expect(screen.getByLabelText('A2 Booked')).toBeInTheDocument();
    expect(screen.getByLabelText('B1 Reserved')).toBeInTheDocument();
    expect(screen.getByLabelText('B2 Unavailable')).toBeInTheDocument();
  });

  it('selects available seats and prevents selecting unavailable seats', () => {
    const onSelectionChange = jest.fn();
    render(<SeatSelection seats={seats} onSelectionChange={onSelectionChange} maxSelectable={2} />);

    const a1Button = screen.getByRole('button', { name: /A1 Available/ });
    const a2Button = screen.getByRole('button', { name: /A2 Booked/ });

    fireEvent.click(a1Button);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['A1']);

    fireEvent.click(a2Button);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('zoom controls update label and remain responsive', () => {
    render(<SeatSelection seats={seats} />);

    expect(screen.getByText('Zoom 100%')).toBeInTheDocument();

    const zoomIn = screen.getByRole('button', { name: /Zoom in/ });
    fireEvent.click(zoomIn);

    expect(screen.getByText('Zoom 115%')).toBeInTheDocument();

    const zoomOut = screen.getByRole('button', { name: /Zoom out/ });
    fireEvent.click(zoomOut);

    expect(screen.getByText('Zoom 100%')).toBeInTheDocument();
  });
});
