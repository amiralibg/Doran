import '@doranjs/wc/styles.css';
import './app.css';
import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app.component';

bootstrapApplication(App).catch((err) => console.error(err));
