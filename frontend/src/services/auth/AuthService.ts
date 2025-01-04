interface User {
    id: string;
    phoneNumber: string;
    type: 'driver' | 'passenger';
}

interface AuthResponse {
    token: string;
    user: User;
}

export class AuthService {
    private static BASE_URL = `${import.meta.env.VITE_API_URL}/auth`;

    static async register(phoneNumber: string, password: string, type: 'driver' | 'passenger'): Promise<AuthResponse> {
        const response = await fetch(`${this.BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, password, type }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка регистрации');
        }

        return response.json();
    }

    static async login(phoneNumber: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${this.BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка входа');
        }

        return response.json();
    }

    static setToken(token: string) {
        localStorage.setItem('token', token);
    }

    static getToken(): string | null {
        return localStorage.getItem('token');
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static setUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static removeUser() {
        localStorage.removeItem('user');
    }

    static logout() {
        this.removeToken();
        this.removeUser();
    }
}
