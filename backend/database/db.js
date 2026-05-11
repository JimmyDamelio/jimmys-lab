import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";

const dbPath = path.resolve("database", "jimmys-lab.sqlite");
const schemaPath = path.resolve("database", "schema.sql");

sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

export function initDb() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
