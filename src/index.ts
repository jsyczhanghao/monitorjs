import configs from './configs';
import './override';
import fs from './fs';

!configs.get().global && fs();

export default {
  init: configs.set
}