import { render } from '@testing-library/react';
import EventDetails from './EventDetails';

test('Event component renders without crashing', () => {
  render(<EventDetails />);
});
