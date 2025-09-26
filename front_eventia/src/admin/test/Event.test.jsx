import { render } from '@testing-library/react';
import Event from '../Events/Events';

test('Event component renders without crashing', () => {
  render(<Event />);
});
