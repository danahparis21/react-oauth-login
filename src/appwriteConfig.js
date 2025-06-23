import { Client, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://syd.cloud.appwrite.io/v1") // ✅ Region-specific
  .setProject("6858d7e50002f2db3a84");

export const account = new Account(client);
