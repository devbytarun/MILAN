import { LanguageCode, TranslationDictionary } from '../types.ts';
import { en } from './en.ts';
import { hi } from './hi.ts';
import { bn } from './bn.ts';
import { ur } from './ur.ts';
import { ta } from './ta.ts';
import { te } from './te.ts';
import { mr } from './mr.ts';
import { gu } from './gu.ts';
import { kn } from './kn.ts';
import { ml } from './ml.ts';
import { pa } from './pa.ts';
import { or } from './or.ts';
import { as } from './as.ts';
import { ne } from './ne.ts';
import { sd } from './sd.ts';
import { sa } from './sa.ts';
import { mai } from './mai.ts';
import { kok } from './kok.ts';
import { doi } from './doi.ts';
import { brx } from './brx.ts';
import { mni } from './mni.ts';
import { sat } from './sat.ts';
import { ks } from './ks.ts';

export const locales: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  bn,
  ur,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  or,
  as,
  ne,
  sd,
  sa,
  mai,
  kok,
  doi,
  brx,
  mni,
  sat,
  ks,
};

export {
  en, hi, bn, ur, ta, te, mr, gu, kn, ml, pa, or, as, ne, sd, sa, mai, kok, doi, brx, mni, sat, ks
};
