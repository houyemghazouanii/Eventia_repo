import { render } from '@testing-library/react';
import Login from './Login';

test('Login component renders without crashing', () => {
  render(<Login />);
});
