import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const examplePath = new URL("../.env.example", import.meta.url);
const localPath = new URL("../.env", import.meta.url);

try {
  await readFile(localPath, "utf8");
  process.stdout.write(".env already exists; it was left unchanged.\n");
} catch {
  const template = await readFile(examplePath, "utf8");
  const secret = randomBytes(32).toString("base64url");
  await writeFile(localPath, template.replace("replace-this-with-openssl-rand-base64-32", secret), { flag: "wx", mode: 0o600 });
  process.stdout.write("Created .env with a fresh Better Auth secret.\n");
}
