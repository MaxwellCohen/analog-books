import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { buttonClasses } from '../ui/button';
import { EmptyState } from '../ui/states';
import { injectResponse } from '@analogjs/router/tokens';

@Component({
  selector: 'app-not-found-page',
  imports: [EmptyState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-1 flex-col' },
  template: `
    <app-empty-state body="That page isn't in the catalog." title="Page not found">
      <a [class]="homeClass" routerLink="/">Back to the shelf</a>
    </app-empty-state>
  `,
})
export default class NotFoundPage {
  protected readonly homeClass = buttonClasses({ class: 'mt-1', variant: 'secondary' });

  constructor() {
    inject(Title).setTitle('Not found · Analog Books');
    const response = injectResponse();
    if (response) response.statusCode = 404;
  }
}
