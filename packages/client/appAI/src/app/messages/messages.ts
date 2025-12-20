import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewChecked } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { Loading } from '../loading/loading';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [MarkdownModule, Loading],
    templateUrl: './messages.html',
    styleUrls: ['./messages.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

    @Input({ required: true }) messages: ChatMessage[] = [];
    @Input() isLoading = false;
    @Output() copied = new EventEmitter<ClipboardEvent>();

    private lastMessageCount = 0;
    private wasLoading = false;

    ngAfterViewChecked(): void {
        // Check if messages changed or loading state changed
        const messageCountChanged = this.messages.length !== this.lastMessageCount;
        const loadingChanged = this.isLoading !== this.wasLoading;

        if (messageCountChanged || loadingChanged) {
            this.lastMessageCount = this.messages.length;
            this.wasLoading = this.isLoading;
            this.scrollToBottom();
        }
    }

    onCopy(event: ClipboardEvent): void {
        const selection = window.getSelection();
        if (selection) {
            let selectedText = selection.toString().trim();
            if (selectedText && event.clipboardData) {
                event.preventDefault();
                event.clipboardData.setData('text/plain', selectedText);
            }
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
