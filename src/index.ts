#!/usr/bin/env node

import MokaCli from './cli/moka-cli';
const _ = new MokaCli();
_.startGateway();