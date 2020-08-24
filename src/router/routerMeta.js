import monitor from './monitor/index.js';
import alarm from './alarm/index.js';
import management from './management/index.js';
import personnel from './personnel/index.js';
import system from './system/index.js';
import other from './other/index.js';

export const routerMeta = {
  ...monitor,
  ...alarm,
  ...management,
  ...personnel,
  ...system,
  ...other
};
