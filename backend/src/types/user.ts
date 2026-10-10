export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput {
  displayName: string;
}
