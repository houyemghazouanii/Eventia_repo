import { render } from '@testing-library/react';
import Dashboard from './Dashboard';

test('Event component renders without crashing', () => {
  render(<Dashboard />);
});
