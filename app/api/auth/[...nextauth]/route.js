import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database"; 
import User from "@models/user";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            try {
                // Ensure database connection
                await connectToDB();

                // Find the user in the database
                const sessionUser = await User.findOne({
                    email: session.user.email
                });

                // If user exists, update the session
                if (sessionUser) {
                    session.user.id = sessionUser._id.toString();
                }

                return session;
            } catch (error) {
                console.error("Session callback error:", error);
                return session;
            }
        },
        async signIn({ profile }) {
            try {
                await connectToDB();
    
                // check if user is in database
                const userExists = await User.findOne({
                    email: profile.email
                });
                //if not create a new user & add to database
                if(!userExists) {
                    await User.create({
                        email: profile.email,
                        username: profile.name.replaceAll(" ", "").toLowerCase(),
                        image: profile.picture
                    })
                }
    
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }
    },
    
    session: {
        strategy: 'jwt',
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    }
    
})

export { handler as GET, handler as POST };