import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApodViewer from '../components/ApodViewer';

global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
};
window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });

describe('ApodViewer UI and functionality tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading animation initially', () => {
    render(<ApodViewer />);
    expect(screen.getByText(/loading today's astronomical wonder/i)).toBeInTheDocument();
    expect(screen.getByText(/exploring the cosmos/i)).toBeInTheDocument();
  });

  test('loads and displays APOD content after loading', async () => {
    render(<ApodViewer />);
    await waitFor(() => {
      expect(screen.getByText(/Horsehead Nebula in Infrared/i)).toBeInTheDocument();
      expect(screen.getByText(/Barnard 33/i)).toBeInTheDocument();
    });

    expect(screen.getByAltText(/Horsehead Nebula/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to expand/i)).toBeInTheDocument();
  });

  test('toggles favorite status with heart button', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByText(/Horsehead Nebula/i));
    const heartBtn = screen.getAllByRole('button').find(btn => btn.innerHTML.includes('Heart'));

    fireEvent.click(heartBtn); 
    fireEvent.click(heartBtn); 
  });

  test('opens image viewer modal when image clicked', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByAltText(/Horsehead Nebula/i));
    const img = screen.getByAltText(/Horsehead Nebula/i);
    fireEvent.click(img);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('unsplash'));
  });

  test('displays Read More / Show Less functionality', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByText(/Read More/i));

    const readMoreBtn = screen.getByText(/Read More/i);
    fireEvent.click(readMoreBtn);
    expect(screen.getByText(/Show Less/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Show Less/i));
    expect(screen.getByText(/Read More/i)).toBeInTheDocument();
  });

  test('Date picker updates the selected date', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByDisplayValue(''));
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '2023-12-31' } });

    expect(input.value).toBe('2023-12-31');
  });

  test('renders header navigation items', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByText(/Favorites/i));

    ['Home', 'Explore', 'Archive', 'Favorites'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('image action buttons function as expected', async () => {
    render(<ApodViewer />);
    await waitFor(() => screen.getByText(/Horsehead Nebula/i));
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons.find(btn => btn.innerHTML.includes('Share')));
    fireEvent.click(buttons.find(btn => btn.innerHTML.includes('Download')));
  });

  test('displays copyright section', async () => {
    render(<ApodViewer />);
    await waitFor(() => {
      expect(screen.getByText(/Image Credit/i)).toBeInTheDocument();
      expect(screen.getByText(/NASA, ESA/i)).toBeInTheDocument();
    });
  });
});
