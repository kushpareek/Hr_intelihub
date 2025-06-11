// frontend/services/api.ts
import { API_BASE_URL } from '../constants';
import { User } from '../types'; // Assuming User type is available

interface RequestOptions extends RequestInit {
  useAuth?: boolean; // Add this option
  // You can add other custom options here if needed
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem('hrIntelliHubAuthToken');
};

export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem('hrIntelliHubUser');
    if (userStr) {
        try {
            return JSON.parse(userStr) as User;
        } catch (e) {
            return null;
        }
    }
    return null;
};


export const apiClient = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  options?: RequestOptions // Use the extended RequestOptions
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const useAuth = options?.useAuth !== false; // Default to true if not specified or true

  if (useAuth) { // Check the useAuth flag
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (method !== 'GET' && !endpoint.includes('/auth/')) {
      // Only throw error for non-GET and non-auth requests if no token
      // This allows public GET routes or auth routes to proceed without a token
      console.warn('No auth token found for protected route.');
      // Depending on strictness, you might throw an error or let the backend handle it
    }
  }


  const config: RequestInit = {
    method,
    headers,
    ...options, // Spread other native RequestInit options
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred and error response was not JSON.' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json() as Promise<T>;
  } else {
      // If not JSON, resolve with null or a custom object indicating success but no JSON body
      // For now, assuming T can be null or void for such cases or backend always returns JSON.
      return null as any; // Adjust based on how you want to handle non-JSON success responses
  }
};

// Example usage:
// apiClient<User>('/auth/me', 'GET') -> automatically uses token
// apiClient<any>('/public/data', 'GET', null, { useAuth: false }) -> explicitly no token
