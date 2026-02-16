export class ApiClient {
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const res = await fetch(endpoint, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Handle Auth Error
        if (res.status === 401) {
            // Allow the caller to handle it if needed, or redirect
            // In a real app, we might trigger a global event here
            window.location.href = '/auth/login';
            throw new Error('Unauthorized');
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `API Error: ${res.status}`);
        }

        return data as T;
    }

    static get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    static delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}
