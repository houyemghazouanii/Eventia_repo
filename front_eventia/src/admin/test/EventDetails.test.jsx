import { render } from '@testing-library/react';
import EventDetails from '../Events/EventDetails';

test('Event component renders without crashing', () => {
  render(<EventDetails />);
});
