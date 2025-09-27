import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Events from './Events';

test('Events component renders without crashing', () => {
  render(
    <BrowserRouter>
      <Events />
    </BrowserRouter>
  );
});
