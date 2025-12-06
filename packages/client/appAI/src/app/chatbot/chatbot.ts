import { Component, signal, inject, ChangeDetectionStrategy, computed, ViewChild, ElementRef, effect, untracked } from '@angular/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { lucideArrowUp, lucideAlertCircle, lucideX, lucideLoader2 } from '@ng-icons/lucide';
import { form, Field, required, minLength, maxLength, validate } from '@angular/forms/signals'
import { Services } from '../utils/services';
import { lastValueFrom } from 'rxjs';
import { Message } from '../message/message';
import { MarkdownModule } from 'ngx-markdown';
import { Column, GridOption, AngularSlickgridModule } from 'angular-slickgrid';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type ChatResponse = {
    message: string;
}

@Component({
    selector: 'app-chatbot',
    imports: [
        HlmTextareaImports,
        HlmButton,
        Field,
        NgIcon,
        HlmIcon,
        Message,
        MarkdownModule,
        AngularSlickgridModule
    ],
    providers: [
        provideIcons({ lucideArrowUp, lucideAlertCircle, lucideX, lucideLoader2 }),
    ],
    templateUrl: './chatbot.html',
    styleUrl: './chatbot.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chatbot {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

    private readonly services = inject(Services);
    // Chat messages
    messages = signal<ChatMessage[]>([]);
    // Generate once and persist
    private readonly conversationId = signal(crypto.randomUUID());
    // Error handling
    errorMessage = signal<string | null>(null);
    // Loading state
    isLoading = signal(false);
    chatModel = signal({ prompt: '' })

    columnDefinitions: Column[] = [];
    gridOptions: GridOption = {};
    dataset: any[] = [];


    constructor() {
        effect(() => {
            // Track messages changes
            this.messages();
            untracked(() => {
                this.scrollToBottom();
            });
        });
        this.prepareGrid();
    }
    prepareGrid() {
        this.columnDefinitions = [
            { id: 'title', name: 'Title', field: 'title', sortable: true },
            { id: 'duration', name: 'Duration (days)', field: 'duration', sortable: true },
            { id: '%', name: '% Complete', field: 'percentComplete', sortable: true },
            { id: 'start', name: 'Start', field: 'start' },
            { id: 'finish', name: 'Finish', field: 'finish' },
        ];

        this.gridOptions = {
            enableAutoResize: true,
            enableSorting: true
        };

        // fill the dataset with your data (or read it from the DB)
        this.dataset = [
            { id: 0, title: 'Task 1', duration: 45, percentComplete: 5, start: '2001-01-01', finish: '2001-01-31' },
            { id: 1, title: 'Task 2', duration: 33, percentComplete: 34, start: '2001-01-11', finish: '2001-02-04' },
        ];
    }

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
    })

    // Computed signal that aggregates ALL validation and API errors
    // Validation errors are only exposed once the field is dirty
    allErrors = computed<string[]>(() => {
        const messages: string[] = [];

        const field = this.promptForm.prompt();

        // Collect validation error messages only after user interaction (dirty)
        if (field.touched() && field.invalid()) {
            const validationMessages = field
                .errors()
                .map(e => e.message)
                .filter((m): m is string => typeof m === 'string' && m.length > 0);

            messages.push(...validationMessages);
        }

        // Collect API error, if any
        const apiError = this.errorMessage();
        if (apiError) {
            messages.push(apiError);
        }
        return messages;
    });

    async sendMessage() {
        if (this.promptForm().valid()) {
            const userPrompt = this.chatModel().prompt;
            this.messages.update(msgs => [...msgs, { role: 'user', content: userPrompt }]);
            // Clear any previous errors
            this.errorMessage.set(null);

            const payload = {
                conversationId: this.conversationId(),
                prompt: userPrompt,
            };

            // Reset form immediately
            this.promptForm.prompt().value.set('');
            this.promptForm.prompt().reset();

            // Set loading state
            this.isLoading.set(true);

            try {
                const message = await lastValueFrom(this.services.post<ChatResponse>('chat', payload));
                this.messages.update(msgs => [...msgs, { role: 'assistant', content: message.message }]);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
                this.errorMessage.set(errorMsg);
            } finally {
                this.isLoading.set(false);
            }
        }
    }
    clearErrors() {
        this.errorMessage.set(null);
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey && !this.isLoading()) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.scrollContainer) {
                const element = this.scrollContainer.nativeElement;
                element.scrollTo({
                    top: element.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 0);
    }
}
