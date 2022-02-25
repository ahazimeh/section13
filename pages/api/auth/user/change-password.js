import { getSession } from "next-auth/client";
import { hashPassword, verifyPassword } from "../../../../lib/auth";
import { connectToDatabase } from "../../../../lib/db";
async function handler(req, res) {
    if (req.method !== "PATCH") {
        return;
    }

    const session = await getSession({ req: req });
    if (!session) {
        res.status(401).json({ message: 'Not authenticated!' });
        return;
    }

    const userEmail = session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const client = await connectToDatabase();
    const usersCollection = client.db().collection('users')
    console.log("email", userEmail)
    const user = await usersCollection.findOne({ email: userEmail })
    console.log("email", user)

    if (!user) {
        res.status(404).json({ message: 'User not found.' })
        client.close();
        return;
    }

    const currentPassword = user.password
    const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword)
    if (!passwordsAreEqual) {
        res.status(403).json({ message: 'Invalid Password.' })//403 authenticated not authorized, 422 means user input is incorrect
        client.close();
        return
    }
    const hashedPassword = await hashPassword(newPassword)
    usersCollection.updateOne({ email: userEmail }, { $set: { password: hashedPassword } })
    client.close()
    res.status(200).json({ message: 'Password Updated!' })
}

export default handler;