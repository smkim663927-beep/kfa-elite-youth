require('dotenv').config();
const express = require('express');
const db = require('./db');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

function asyncRoute(handler) {
    return (req, res) => handler(req, res).catch(err => {
        console.error(err);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    });
}

// ---------- Players (IDP) ----------
app.get('/api/players', asyncRoute(async (req, res) => {
    res.json(await db.listPlayers());
}));

app.post('/api/players', asyncRoute(async (req, res) => {
    const body = req.body || {};
    if (!body.name || !body.basic || !body.basic.pos) {
        return res.status(400).json({ error: '선수 이름과 포지션은 필수입니다.' });
    }
    const player = await db.createPlayer(body);
    res.status(201).json(player);
}));

app.put('/api/players/:id', asyncRoute(async (req, res) => {
    const updated = await db.updatePlayer(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' });
    res.json(updated);
}));

app.delete('/api/players/:id', asyncRoute(async (req, res) => {
    const deleted = await db.deletePlayer(req.params.id);
    if (!deleted) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' });
    res.status(204).end();
}));

// ---------- Training Library (read-only reference data) ----------
app.get('/api/library', asyncRoute(async (req, res) => {
    res.json(await db.listLibrary());
}));

// ---------- Physical & Rehab (read-only reference data) ----------
app.get('/api/physical', asyncRoute(async (req, res) => {
    res.json(await db.listPhysical());
}));

// ---------- Match Analysis ----------
app.get('/api/matches', asyncRoute(async (req, res) => {
    res.json(await db.listMatches());
}));

app.post('/api/matches', asyncRoute(async (req, res) => {
    const body = req.body || {};
    if (!body.date || !body.team) {
        return res.status(400).json({ error: '경기 날짜와 팀 정보는 필수입니다.' });
    }
    const match = await db.createMatch(body);
    res.status(201).json(match);
}));

// ---------- Communication Hub ----------
app.get('/api/posts', asyncRoute(async (req, res) => {
    res.json(await db.listPosts());
}));

app.post('/api/posts', asyncRoute(async (req, res) => {
    const body = req.body || {};
    if (!body.title || !body.content) {
        return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    }
    const post = await db.createPost(body);
    res.status(201).json(post);
}));

app.post('/api/posts/:id/comments', asyncRoute(async (req, res) => {
    const content = (req.body || {}).content;
    if (!content || !content.trim()) {
        return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }
    const post = await db.addComment(req.params.id, content);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.status(201).json(post);
}));

app.post('/api/posts/:id/like', asyncRoute(async (req, res) => {
    const post = await db.likePost(req.params.id);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.json(post);
}));

db.init()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`KFA Elite Youth server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('DB 초기화 실패:', err.message);
        process.exit(1);
    });
