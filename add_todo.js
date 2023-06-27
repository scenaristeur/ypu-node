import * as fs from "fs";
import "dotenv/config";

let watch = process.env.WATCH;
let watchFolder = process.env.WATCH_FOLDER;

let todo = { operation: "hello-world" };
let date = Date.now();
let filename = watchFolder + date;

try {
  fs.writeFileSync(filename, JSON.stringify(todo));
  // file written successfully
} catch (err) {
  console.error(err);
}
