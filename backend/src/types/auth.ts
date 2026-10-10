export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  provider?: string;
}
