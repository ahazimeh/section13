import { MongoClient } from "mongodb";

export async function connectToDatabase() {

    const adminPassword = encodeURIComponent(process.env.password)
    let url = `mongodb+srv://root:${adminPassword}@cluster0.svlvw.mongodb.net/auth-demo?retryWrites=true&w=majority`;
    const client = await MongoClient.connect(url);
    return client;
}