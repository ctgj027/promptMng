import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

const { GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET } = process.env;

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: GITHUB_OAUTH_CLIENT_ID ?? '',
      clientSecret: GITHUB_OAUTH_CLIENT_SECRET ?? ''
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    }
  }
};

export const { handlers: authHandlers, auth } = NextAuth(authOptions);
