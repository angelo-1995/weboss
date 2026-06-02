"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

exports.prisma = prisma;
exports.PrismaClient = PrismaClient;

// Re-export everything from @prisma/client
const client = require('@prisma/client');
Object.keys(client).forEach(key => {
  if (!exports[key]) exports[key] = client[key];
});
