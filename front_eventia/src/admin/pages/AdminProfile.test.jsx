import { render } from '@testing-library/react';
import AdminProfile from './AdminProfile';

test('Event component renders without crashing', () => {
  render(<AdminProfile />);
});
