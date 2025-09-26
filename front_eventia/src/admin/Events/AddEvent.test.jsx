import { render } from '@testing-library/react';
import AddEvent from './AddEvent';

test('Event component renders without crashing', () => {
  render(<AddEvent />);
});
