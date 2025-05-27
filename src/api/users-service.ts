import axios, { type AxiosInstance } from 'axios';
import type { UserRequest, UserResponse } from '../models/user.model';
import type { Result } from '../models/result.model';

export class UserService {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL
    });
  }

  async getUserByEmail(email: string): Promise<Result<UserResponse>> {
    const response = await this.http.get<Result<UserResponse>>(`/users/email/${email}`);
    return response.data;
  }

  async saveUser(user: UserRequest): Promise<Result<UserResponse>> {
    const response = await this.http.post<Result<UserResponse>>('/users', user);
    return response.data;
  }
}