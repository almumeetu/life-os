import { spawnSync } from "node:child_process";
import { copyFile, mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

// Run locally with Poppler installed. Original PDFs and page images stay out of Git.
// Usage: node scripts/prepare-learning-books.mjs /path/to/spoken.pdf /path/to/ielts.pdf
const sources = process.argv.slice(2);
if (sources.length !== 2) throw new Error("Provide the Spoken English PDF followed by the IELTS PDF.");
const root = path.resolve(process.env.LEARNING_BOOKS_DIR || ".local/learning-books");
await mkdir(root, { recursive: true });
for (const [index, [id, expectedPages]] of [["spoken", 104], ["ielts", 352]].entries()) {
  const destination = path.join(root, id);
  const temporary = path.join(root, `${id}-preparing-${process.pid}`);
  await mkdir(temporary, { recursive: true });
  try {
    await copyFile(path.resolve(sources[index]), path.join(temporary, "book.pdf"));
    const info = spawnSync("pdfinfo", [path.join(temporary, "book.pdf")], { encoding: "utf8" });
    if (info.status !== 0 || Number(info.stdout.match(/^Pages:\s+(\d+)/m)?.[1]) !== expectedPages) {
      throw new Error(`Unexpected PDF page count for ${id}; expected ${expectedPages}.`);
    }
    console.log(`Preparing ${id}: ${expectedPages} pages…`);
    const render = spawnSync("pdftoppm", ["-jpeg", "-jpegopt", "quality=85", "-scale-to", "1600", path.join(temporary, "book.pdf"), path.join(temporary, "page")], { stdio: "inherit" });
    if (render.status !== 0) throw new Error(`Unable to render ${id}. Install Poppler and retry.`);
    const images = (await readdir(temporary)).filter((file) => /^page-\d+\.jpg$/.test(file));
    if (images.length !== expectedPages) throw new Error(`Incomplete rendering for ${id}.`);
    // Poppler's zero padding varies with the PDF page count; normalise it.
    for (const file of images) {
      const page = Number(file.match(/\d+/)[0]);
      const name = `page-${String(page).padStart(3, "0")}.jpg`;
      if (file !== name) await rename(path.join(temporary, file), path.join(temporary, name));
    }
    await rm(destination, { recursive: true, force: true });
    await rename(temporary, destination);
    console.log(`Ready: ${id}`);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
