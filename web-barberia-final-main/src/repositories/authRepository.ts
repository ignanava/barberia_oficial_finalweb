import initialUsers from "../data/users.json";
import { storageService } from "../services/storageService";
import type {
  LoginCredentials,
  User,
  UserRecord,
} from "../types/auth";


const SESSION_KEY = "app_session";


const users = initialUsers as UserRecord[];


export const authRepository = {
  login(credentials: LoginCredentials): User | null {
    const foundUser = users.find(
      (user) =>
        user.carnet === credentials.carnet &&
        user.password === credentials.password &&
        user.role === 'ADMIN'
    );


    if (!foundUser) {
      return null;
    }


    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      carnet: foundUser.carnet,
      role: foundUser.role,
    };


    storageService.set<User>(SESSION_KEY, sessionUser);


    return sessionUser;
  },


  logout(): void {
    storageService.remove(SESSION_KEY);
  },


  getCurrentUser(): User | null {
    const saved = storageService.get<User>(SESSION_KEY);
    if (!saved || typeof saved !== 'object') return null;
    const user = users.find(item => item.id === saved.id && item.carnet === saved.carnet && item.role === saved.role && item.role === 'ADMIN');
    return user ? { id: user.id, name: user.name, carnet: user.carnet, role: user.role } : null;
  },


  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
