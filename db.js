const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const pool = new Pool({
    connectionString,
    ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false }
});

async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS library (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS physical (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);
}

async function seedIfEmpty() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM players');
    if (rows[0].n > 0) return; // already seeded

    const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8'));
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const p of seed.players) {
            await client.query('INSERT INTO players (id, data) VALUES ($1, $2)', [p.id, p]);
        }
        for (const l of seed.library) {
            await client.query('INSERT INTO library (id, data) VALUES ($1, $2)', [l.id, l]);
        }
        for (const ph of seed.physical) {
            await client.query('INSERT INTO physical (id, data) VALUES ($1, $2)', [ph.id, ph]);
        }
        for (const m of seed.matches) {
            await client.query('INSERT INTO matches (id, data) VALUES ($1, $2)', [m.id, m]);
        }
        for (const post of seed.posts) {
            await client.query('INSERT INTO posts (id, data) VALUES ($1, $2)', [post.id, post]);
        }
        await client.query('COMMIT');
        console.log('DB가 비어있어 초기 시드 데이터를 넣었습니다.');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function init() {
    await initSchema();
    await seedIfEmpty();
}

// ---------- Players ----------
async function listPlayers() {
    const { rows } = await pool.query('SELECT data FROM players ORDER BY created_at DESC');
    return rows.map(r => r.data);
}

async function createPlayer(player) {
    const id = crypto.randomUUID();
    const data = { ...player, id };
    await pool.query('INSERT INTO players (id, data) VALUES ($1, $2)', [id, data]);
    return data;
}

async function updatePlayer(id, player) {
    const { rows } = await pool.query('SELECT data FROM players WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const data = { ...rows[0].data, ...player, id };
    await pool.query('UPDATE players SET data = $2 WHERE id = $1', [id, data]);
    return data;
}

async function deletePlayer(id) {
    const { rowCount } = await pool.query('DELETE FROM players WHERE id = $1', [id]);
    return rowCount > 0;
}

// ---------- Library / Physical (read-only reference data) ----------
async function listLibrary() {
    const { rows } = await pool.query('SELECT data FROM library ORDER BY id');
    return rows.map(r => r.data);
}

async function listPhysical() {
    const { rows } = await pool.query('SELECT data FROM physical ORDER BY id');
    return rows.map(r => r.data);
}

// ---------- Matches ----------
async function listMatches() {
    const { rows } = await pool.query('SELECT data FROM matches ORDER BY created_at ASC');
    return rows.map(r => r.data);
}

async function createMatch(match) {
    const id = crypto.randomUUID();
    const data = { ...match, id };
    await pool.query('INSERT INTO matches (id, data) VALUES ($1, $2)', [id, data]);
    return data;
}

// ---------- Posts ----------
async function listPosts() {
    const { rows } = await pool.query('SELECT data FROM posts ORDER BY created_at DESC');
    return rows.map(r => r.data);
}

async function createPost(post) {
    const id = crypto.randomUUID();
    const data = {
        id,
        title: post.title,
        content: post.content,
        author: post.author || '현장 지도자',
        date: new Date().toLocaleDateString('ko-KR'),
        likes: 0,
        replies: []
    };
    await pool.query('INSERT INTO posts (id, data) VALUES ($1, $2)', [id, data]);
    return data;
}

async function addComment(id, content) {
    const { rows } = await pool.query('SELECT data FROM posts WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const data = rows[0].data;
    data.replies.push({
        author: '현장 지도자',
        content,
        date: new Date().toLocaleDateString('ko-KR')
    });
    await pool.query('UPDATE posts SET data = $2 WHERE id = $1', [id, data]);
    return data;
}

async function likePost(id) {
    const { rows } = await pool.query('SELECT data FROM posts WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const data = rows[0].data;
    data.likes += 1;
    await pool.query('UPDATE posts SET data = $2 WHERE id = $1', [id, data]);
    return data;
}

module.exports = {
    pool,
    init,
    listPlayers, createPlayer, updatePlayer, deletePlayer,
    listLibrary, listPhysical,
    listMatches, createMatch,
    listPosts, createPost, addComment, likePost
};
