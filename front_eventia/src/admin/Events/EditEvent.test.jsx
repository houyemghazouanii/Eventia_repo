import { render } from '@testing-library/react';
import EditEvent from './EditEvent';

test('Event component renders without crashing', () => {
  render(<EditEvent />);
});
