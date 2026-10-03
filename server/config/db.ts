import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongooseConnected = false;

// In-memory + JSON file backup store for zero-friction out-of-the-box operation
// if MongoDB is not locally provisioned or running
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db_store.json');

export interface MemoryStoreData {
  users: any[];
  subjects: any[];
  topics: any[];
  studySessions: any[];
  tasks: any[];
  exams: any[];
  pomodoros: any[];
}

let memoryStore: MemoryStoreData = {
  users: [],
  subjects: [],
  topics: [],
  studySessions: [],
  tasks: [],
  exams: [],
  pomodoros: []
};

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Could not create data dir:', e);
  }
}

// Load persisted memory data if file exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    memoryStore = JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read existing local data file, starting fresh in-memory.');
  }
}

export function saveMemoryStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal
  }
}

export function getMemoryStore(): MemoryStoreData {
  return memoryStore;
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000
      });
      isMongooseConnected = true;
      console.log('✅ Connected to MongoDB via Mongoose:', mongoUri);
      return;
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection failed:', err.message);
      console.log('ℹ️ Activating Smart Study Planner Embedded Datastore (Zero-Config mode)...');
    }
  } else {
    console.log('ℹ️ MONGO_URI not provided. Running in high-reliability Embedded Datastore mode.');
  }
}

export function isDbConnected(): boolean {
  return isMongooseConnected;
}
