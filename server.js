const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadData();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ---------- Players (IDP) ----------
app.get('/api/players', (req, res) => {
    res.json(db.players);
});

app.post('/api/players', (req, res) => {
    const body = req.body || {};
    if (!body.name || !body.basic || !body.basic.pos) {
        return res.status(400).json({ error: '선수 이름과 포지션은 필수입니다.' });
    }
    const player = { ...body, id: crypto.randomUUID() };
    db.players.unshift(player);
    saveData(db);
    res.status(201).json(player);
});

app.put('/api/players/:id', (req, res) => {
    const idx = db.players.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' });
    const updated = { ...db.players[idx], ...req.body, id: db.players[idx].id };
    db.players[idx] = updated;
    saveData(db);
    res.json(updated);
});

app.delete('/api/players/:id', (req, res) => {
    const idx = db.players.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '선수를 찾을 수 없습니다.' });
    db.players.splice(idx, 1);
    saveData(db);
    res.status(204).end();
});

// ---------- Training Library (read-only reference data) ----------
app.get('/api/library', (req, res) => {
    res.json(db.library);
});

// ---------- Physical & Rehab (read-only reference data) ----------
app.get('/api/physical', (req, res) => {
    res.json(db.physical);
});

// ---------- Match Analysis ----------
app.get('/api/matches', (req, res) => {
    res.json(db.matches);
});

app.post('/api/matches', (req, res) => {
    const body = req.body || {};
    if (!body.date || !body.team) {
        return res.status(400).json({ error: '경기 날짜와 팀 정보는 필수입니다.' });
    }
    const match = { ...body, id: crypto.randomUUID() };
    db.matches.unshift(match);
    saveData(db);
    res.status(201).json(match);
});

// ---------- Communication Hub ----------
app.get('/api/posts', (req, res) => {
    res.json(db.posts);
});

app.post('/api/posts', (req, res) => {
    const body = req.body || {};
    if (!body.title || !body.content) {
        return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    }
    const post = {
        id: crypto.randomUUID(),
        title: body.title,
        content: body.content,
        author: body.author || '현장 지도자',
        date: new Date().toLocaleDateString('ko-KR'),
        likes: 0,
        replies: []
    };
    db.posts.unshift(post);
    saveData(db);
    res.status(201).json(post);
});

app.post('/api/posts/:id/comments', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    const content = (req.body || {}).content;
    if (!content || !content.trim()) {
        return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }
    const comment = {
        author: '현장 지도자',
        content: content,
        date: new Date().toLocaleDateString('ko-KR')
    };
    post.replies.push(comment);
    saveData(db);
    res.status(201).json(post);
});

app.post('/api/posts/:id/like', (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    post.likes += 1;
    saveData(db);
    res.json(post);
});

app.listen(PORT, () => {
    console.log(`KFA Elite Youth server running at http://localhost:${PORT}`);
});
