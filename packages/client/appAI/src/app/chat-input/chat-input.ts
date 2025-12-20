import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';
import { Field, form, required, minLength, maxLength, validate } from '@angular/forms/signals';
import { lucideArrowUp } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
    selector: 'app-chat-input',
    standalone: true,
    imports: [
        HlmTextareaImports,
        HlmButton,
        HlmIcon,
        NgIcon,
        Field,
    ],
    templateUrl: './chat-input.html',
    providers: [provideIcons({ lucideArrowUp })],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInputComponent {
    chatModel = signal({ prompt: '' });

    promptForm = form(this.chatModel, (fieldPath) => {
        // Core validators
        required(fieldPath.prompt, { message: 'Prompt is required' });
        minLength(fieldPath.prompt, 1, { message: 'Prompt must be at least 1 characters' });
        maxLength(fieldPath.prompt, 1000, { message: 'Prompt cannot exceed 1000 characters' });

        // Custom whitespace-only validator with unique kind
        validate(fieldPath.prompt, ({ value }) => {
            if (value().trim().length === 0) {
                return {
                    kind: 'whitespace',
                    message: 'Prompt cannot be empty or whitespace only',
                }
            }
            return null
        })
    });

    @Output()
    public send = new EventEmitter<string>();

    public onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    public sendMessage() {
        if (this.promptForm().valid()) {
            const userPrompt = this.chatModel().prompt;
            this.send.emit(userPrompt);

            // Reset form immediately
            this.promptForm.prompt().value.set('');
            this.promptForm.prompt().reset();
        }
    }
}
