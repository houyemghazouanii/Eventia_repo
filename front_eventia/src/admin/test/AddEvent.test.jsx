import { render } from '@testing-library/react';
import AddEvent from '../Events/AddEvent';

test('Event component renders without crashing', () => {
  render(<AddEvent />);
});
