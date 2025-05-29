import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    console.log('Starting Google sign in process...');
                    // Register user in backend
                    const response = await fetch('http://localhost:5000/api/auth/google', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            picture: user.image,
                            googleId: profile.sub
                        }),
                    });

                    const data = await response.json();
                    console.log('Backend response:', data);
                    
                    if (!response.ok) {
                        console.error('Backend registration failed:', data);
                        return false;
                    }

                    // Store the backend token
                    if (data.status === true && data.data.token) {
                        user.accessToken = data.data.token;
                        console.log('Token stored in user object');
                        return true;
                    } else {
                        console.error('Invalid response format from backend');
                        return false;
                    }
                } catch (error) {
                    console.error('Error during Google sign in:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.accessToken = user.accessToken;
                console.log('Token stored in JWT');
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            console.log('Token stored in session');
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
