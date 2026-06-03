// Importing the package auto-registers <doran-calendar>, <doran-datepicker>,
// <doran-rangepicker>, <doran-nlp-input> and <doran-agenda>.
import '@doranjs/wc';
import '@doranjs/wc/styles.css';
import './app.css';

import { mountApp } from './app';

mountApp(document.getElementById('root')!);
