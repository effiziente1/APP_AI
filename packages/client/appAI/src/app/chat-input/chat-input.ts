import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, input } from '@angular/core';
import { form, required, minLength, maxLength, validate, FormField, FormRoot } from '@angular/forms/signals';
import { lucideArrowUp } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
    selector: 'app-chat-input',
    standalone: true,
    imports: [
        NgIcon,
        FormField,
        FormRoot,
    ],
    templateUrl: './chat-input.html',
    styleUrl: './chat-input.css',
    providers: [provideIcons({ lucideArrowUp })],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInputComponent {
    isLoading = input<boolean>(false);

    promptForm = form(signal({ prompt: '' }), (fieldPath) => {
        required(fieldPath.prompt, { message: 'Prompt is required' });
        minLength(fieldPath.prompt, 1, { message: 'Prompt must be at least 1 characters' });
        maxLength(fieldPath.prompt, 1000, { message: 'Prompt cannot exceed 1000 characters' });
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
            // Prevent sending if already loading
            if (!this.isLoading()) {
                this.sendMessage();
            }
        }
    }

    public sendMessage() {
        if (this.isLoading() || !this.promptForm().valid()) {
            return;
        }

        const userPrompt = this.promptForm().value().prompt;
        this.send.emit(userPrompt);

        this.promptForm().reset({ prompt: '' });
    }
}
