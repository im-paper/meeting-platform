import { render, screen } from '@testing-library/react';
import App from './App';

test('renders meeting scheduler title', () => {
  render(<App />);
  const titleElement = screen.getByText(/미팅 시간 조율/i);
  expect(titleElement).toBeInTheDocument();
});
