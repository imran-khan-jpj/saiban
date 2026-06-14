export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function mapApiUserToAppUser(user: ApiUser) {
  return {
    id: user.id,
    name: user.name?.trim() || user.email.split("@")[0],
    email: user.email,
    role: user.role,
    avatar: "",
  };
}
