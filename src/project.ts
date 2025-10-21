import {makeProject} from '@motion-canvas/core';

import waiting from './scenes/waiting-room?scene';
import starlit from './scenes/starlit-lobby?scene';

export default makeProject({
  scenes: [waiting, starlit],
});
