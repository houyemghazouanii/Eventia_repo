import { render } from '@testing-library/react';
import Event from './Events';

test('Event component renders without crashing', () => {
  render(<Event />);
});
