/**
 * Seed script — run with: npm run seed
 * Creates the opsagent database, campaigns table, and inserts 50 fake rows.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 5,
});

const CHANNELS = ['google', 'facebook', 'instagram', 'tiktok', 'email', 'affiliate'];

const CAMPAIGN_NAMES = [
  'Summer Blast', 'Brand Awareness Q3', 'Retargeting Wave', 'Black Friday Push',
  'New User Promo', 'Loyalty Program', 'Video Awareness', 'Influencer Collab',
  'Search Max', 'Display Reach', 'App Install Drive', 'Re-engagement Sprint',
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysAgo));
  return d.toISOString().split('T')[0];
}

async function seed(): Promise<void> {
  const conn = await pool.getConnection();

  try {
    await conn.query('CREATE DATABASE IF NOT EXISTS opsagent');
    await conn.query('USE opsagent');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        channel     VARCHAR(50)   NOT NULL,
        spend       DECIMAL(10,2) NOT NULL,
        clicks      INT           NOT NULL,
        conversions INT           NOT NULL,
        date        DATE          NOT NULL,
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query('TRUNCATE TABLE campaigns');

    const rows: unknown[][] = [];
    for (let i = 0; i < 50; i++) {
      const name    = CAMPAIGN_NAMES[rand(0, CAMPAIGN_NAMES.length - 1)];
      const channel = CHANNELS[rand(0, CHANNELS.length - 1)];
      const spend   = (rand(200, 15000) + Math.random()).toFixed(2);
      const clicks  = rand(100, 50000);
      const conversions = rand(5, Math.floor(clicks * 0.15));
      const date    = randomDate(60);
      rows.push([name, channel, spend, clicks, conversions, date]);
    }

    await conn.query(
      'INSERT INTO campaigns (name, channel, spend, clicks, conversions, date) VALUES ?',
      [rows]
    );

    console.log('Created campaigns table');
    console.log('Inserted 50 fake campaign rows');
    console.log('Done');
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch(console.error);
