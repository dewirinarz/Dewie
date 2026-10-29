export interface UserRecord {
  uid: string;
  email: string;
  createdAt: string;
}

const usersStore = new Map<string, UserRecord>();

export async function getOrCreateUser(uid: string, email: string): Promise<UserRecord> {
  const existing = usersStore.get(uid);
  if (existing) {
    existing.email = email;
    return existing;
  }
  const newUser: UserRecord = { uid, email, createdAt: new Date().toISOString() };
  usersStore.set(uid, newUser);
  return newUser;
}

export async function getUsers(): Promise<UserRecord[]> {
  return Array.from(usersStore.values());
}
