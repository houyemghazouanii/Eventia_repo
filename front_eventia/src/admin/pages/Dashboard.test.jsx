import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

test('Dashboard component renders without crashing', () => {
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
});
