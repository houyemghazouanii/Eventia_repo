import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminProfile from './AdminProfile';

test('AdminProfile component renders without crashing', () => {
  render(
    <BrowserRouter>
      <AdminProfile />
    </BrowserRouter>
  );
});
