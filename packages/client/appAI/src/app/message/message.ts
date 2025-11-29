import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmAlert } from '@spartan-ng/helm/alert';

@Component({
    selector: 'app-message',
    imports: [
        HlmAlert,
        NgIcon,
    ],
    providers: [provideIcons({ lucideTriangleAlert })],
    templateUrl: './message.html',
    styleUrl: './message.css',
})
export class Message {
    messages = input<string[]>([]);
}
