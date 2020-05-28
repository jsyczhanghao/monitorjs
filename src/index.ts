import configs from './configs';
import './override';
import {mini} from './helper';
import fs, {reportFs} from './fs';

!mini && fs();

export default {
  init: configs.set,
  reportFs,
}