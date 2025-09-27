import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

test('Login component renders without crashing', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
});
