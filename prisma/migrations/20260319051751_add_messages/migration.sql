-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "name" TEXT,
    "body" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL DEFAULT 'Bot Bruna',
    "welcomeMsg" TEXT NOT NULL,
    "promotion" TEXT,
    "whatsappNumber" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Settings" ("id", "promotion", "welcomeMsg") SELECT "id", "promotion", "welcomeMsg" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
