import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Healthcare AI Platform', () => {
  render(<App />);
  const titleElement = screen.getByText(/Healthcare AI Platform/i);
  expect(titleElement).toBeInTheDocument();
});
