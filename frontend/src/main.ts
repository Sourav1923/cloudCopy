import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import 'zone.js';  // ✅ Required for Angular


platformBrowser().bootstrapModule(AppModule, {
  
})
  .catch(err => console.error(err));
