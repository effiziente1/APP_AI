import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Services {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getAuth<T = unknown>(service: string): Observable<T> {
        return this.http.get<T>(this.baseUrl + service).pipe(
            catchError(this.handleError)
        );
    }

    get<T = unknown>(service: string): Observable<T> {
        return this.http.get<T>(this.baseUrl + service).pipe(
            catchError(this.handleError)
        );
    }

    getWithType<T>(service: string): Observable<T> {
        return this.http.get<T>(this.baseUrl + service).pipe(
            catchError(this.handleError)
        );
    }

    post<T = unknown>(service: string, body: unknown): Observable<T> {
        return this.http.post<T>(this.baseUrl + service, body)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => {
        switch (error.status) {
            case 400: {
                let errorMessage = "";

                if (typeof (error.error) === "string") {
                    return throwError(() => new Error(error.error));
                }

                // Handle validation errors from API
                if (error.error && error.error.errors) {
                    const validationErrors = error.error.errors;
                    const errorMessages: string[] = [];

                    // Iterate through each field that has validation errors
                    for (const field in validationErrors) {
                        if (validationErrors.hasOwnProperty(field)) {
                            const fieldErrors = validationErrors[field];
                            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                                // Create user-friendly message for each field
                                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
                            }
                        }
                    }

                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('\n');
                        return throwError(() => new Error(errorMessage));
                    }
                }

                return throwError(() => new Error(errorMessage || "Bad Request"));
            }
            case 409:
                return throwError(() => new Error(error.error || "Conflict"));
            case 403:
                return throwError(() => new Error("No Access"));
            case 404:
                return throwError(() => new Error("Not Found"));
            default:
                // Return an observable with a user-facing error message.
                return throwError(() => new Error("Unexpected error"));
        }
    }
}