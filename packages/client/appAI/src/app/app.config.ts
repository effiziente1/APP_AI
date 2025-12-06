import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MarkdownModule } from 'ngx-markdown';
import { AngularSlickgridModule } from 'angular-slickgrid';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        importProvidersFrom(MarkdownModule.forRoot()),
        importProvidersFrom(AngularSlickgridModule.forRoot())
    ]
};
