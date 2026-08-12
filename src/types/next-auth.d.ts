import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      uid?: string | null;
      employeeCode?: string | null;
      roles: string[];
    } & DefaultSession["user"];
  }

  interface User {
    uid?: string | null;
    employeeCode?: string | null;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    uid?: string | null;
    employeeCode?: string | null;
    roles?: string[];
  }
}
