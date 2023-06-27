import * as Y from "yjs";
import * as W from "y-websocket";
import WebSocket from "ws";
import { Awareness } from "y-protocols/awareness.js";

import "dotenv/config";
import * as fs from "fs";
import { Command } from "commander";
import chalk from "chalk";
/* import inquirer from "inquirer";
import { input } from '@inquirer/prompts';*/

console.log(chalk.blue("Welcome to ypu-node!"));

// watch
let watch = process.env.WATCH;
let watchFolder = process.env.WATCH_FOLDER;
console.log("#WATCH:", watch, "\t#WATCH_FOLDER:", watchFolder);

const program = new Command();

program
  .option("-c, --continuous <n>", "set the continuous mode", parseInt)
  .option("-h, --headless [headless]", "set the headless mode")
  .option("-s, --speak [speak]", "set the speak mode")
  .parse(process.argv);

program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
//   console.log(program.args[0].split(options.separator, limit));
console.log("args", program.args);

// const answer = /*await*/ input({ message: "Enter your name" });
// console.log("you say", answer);
// inquirer
//   .prompt([
//     /* Pass your questions in here */
//     "what do you want to do ?",
//   ])
//   .then((answers) => {
//     // Use user feedback for... whatever!!
//     console.log("you say ", answers);
//   })
//   .catch((error) => {
//     if (error.isTtyError) {
//       console.log(error);
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       console.log("error2", error);
//       // Something else went wrong
//     }
//   });

// nodejs pendant of ypu / $initWEbsSocketBus plugin

const doc = new Y.Doc();
let awareness = new Awareness(doc);
const wsProvider = new W.WebsocketProvider(
  "ws://localhost:1234",
  "my-ypu",
  doc,
  { WebSocketPolyfill: WebSocket, awareness: awareness }
);

wsProvider.on("status", (event) => {
  console.log(chalk.blue("websocket provider", event.status)); // logs "connected" or "disconnected"
});

let memory = doc.getArray("memory");
let registers = doc.getArray("registers");
let todos = doc.getMap("todos");
let pending = doc.getMap("pending");
let done = doc.getMap("done");

//YJS ONLINE OBSERVE

memory.observe((memoryEvent) => {
  memoryEvent.target === memory; // => true
  console.log("memory", memory.toArray());
  //store.commit('ypu/setMemory', memory.toArray())
  // Find out what changed:
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  console.log(memoryEvent.changes.delta);
});

todos.observe((ymapEvent) => {
  //  ymapEvent.target === ymap // => true
  // store.commit('ypu/setTodos', todos.toJSON())
  console.log("todos", todos.toJSON());
  // Find out what changed:
  // Option 1: A set of keys that changed
  //ymapEvent.keysChanged // => Set<strings>
  // Option 2: Compute the differences
  //ymapEvent.changes.keys // => Map<string, { action: 'add'|'update'|'delete', oldValue: any}>

  // sample code.
  ymapEvent.changes.keys.forEach((change, key) => {
    //  console.log(change, key)
    if (change.action === "add") {
      // app.config.globalProperties.$prepare(key)
      console.log("Prepare", key);
      //console.log(`Property "${key}" was added. Initial value: "${ymap.get(key)}".`)
    }
    //  else if (change.action === 'update') {
    //   console.log(`Property "${key}" was updated. New value: "${ymap.get(key)}". Previous value: "${change.oldValue}".`)
    // } else if (change.action === 'delete') {
    //   console.log(`Property "${key}" was deleted. New value: undefined. Previous value: "${change.oldValue}".`)
    // }
  });
});

pending.observe((pendingEvent) => {
  pendingEvent.target === pending; // => true
  console.log("ypu/setPending", pending.toJSON());
  // store.commit('ypu/setPending', pending.toJSON())
  // Find out what changed:
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  //  console.log(pendingEvent.changes.delta)
});

done.observe((doneEvent) => {
  doneEvent.target === done; // => true
  console.log("ypu/setDone", done.toJSON());
  // store.commit('ypu/setDone', done.toJSON())
  // Find out what changed:
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  //  console.log(doneEvent.changes.delta)
});

registers.observe((registersEvent) => {
  registersEvent.target === registers; // => true

  // Find out what changed:
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  console.log("register", registersEvent.changes.delta);
});

awareness.on("change", (changes) => {
  console.log(changes);
  // let usersStates = {changes: changes, users: {}}
  awareness.getStates().forEach((state) => {
    console.log("awareness", state);
    // if (state.user ) {
    //   //console.log('state.user', state.user)
    //   //  this.store.commit('actor/setUserByID', state.user)
    //   // usersStates.users[state.user.clientID] = state.user
    //   console.log(usersStates)
    // }
  });
  //console.log(usersStates)
  // this.store.commit('actor/updateUsersStates', usersStates)
});

// WATCH
//https://www.codeproject.com/Articles/699468/Monitoring-a-Folder-for-Changes-in-Files-and-Folde
fs.watch(watchFolder, { persistent: true }, function (event, fileName) {
  console.log("Event: " + event);
  console.log(fileName + "\n");
});
