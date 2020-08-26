import historyDynasty from './historyDynasty/index.js';
import geographyArchitecture from './geographyArchitecture/index.js';
import literatureEducation from './literatureEducation/index.js';
import religionPhilosophy from './religionPhilosophy/index.js';
import otherCulture from './otherCulture/index.js';
import other from './other/index.js';

export const routerMeta = {
  ...historyDynasty,
  ...geographyArchitecture,
  ...literatureEducation,
  ...religionPhilosophy,
  ...otherCulture,
  ...other
};
