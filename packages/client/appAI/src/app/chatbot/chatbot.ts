import { Component } from '@angular/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { lucideArrowUp } from '@ng-icons/lucide';

@Component({
    selector: 'app-chatbot',
    imports: [HlmTextareaImports,
        HlmButton,
        NgIcon,
        HlmIcon],
    providers: [
        provideIcons({ lucideArrowUp }),
    ],
    templateUrl: './chatbot.html',
    styleUrl: './chatbot.css',
})
export class Chatbot {
    sendMessage() {
        console.log('Send message')
    }
}
