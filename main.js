const API = '/api';

async function apiGet(path) {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error('요청 실패: ' + path);
    return res.json();
}

async function apiSend(method, path, body) {
    const res = await fetch(API + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '요청 실패: ' + path);
    }
    if (res.status === 204) return null;
    return res.json();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(s => {
        s.style.display = 'none';
    });

    const menuItems = document.querySelectorAll('.nav-menu li');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    const targetSection = document.getElementById('section-' + sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    const activeMenu = document.getElementById('menu-' + sectionId);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }

    // 각 탭 전환 시 항상 리스트 뷰로 상태 초기화
    if (sectionId === 'idp') {
        document.getElementById('idp-detail-view').style.display = 'none';
        document.getElementById('idp-register-view').style.display = 'none';
        document.getElementById('idp-edit-view').style.display = 'none';
        document.getElementById('idp-list-view').style.display = 'grid';
    }
    if (sectionId === 'library') {
        document.getElementById('library-detail-view').style.display = 'none';
        document.getElementById('library-list-view').style.display = 'grid';
        resetLibraryFilter();
    }
    if (sectionId === 'physical') {
        document.getElementById('physical-detail-view').style.display = 'none';
        document.getElementById('physical-list-view').style.display = 'grid';
    }

    window.scrollTo(0, 0);
}

// --- 공통 유틸리티 ---
function getFootDisplay(p) {
    const foot = p.basic.foot;
    const left = p.basic.footRatingLeft || 5;
    const right = p.basic.footRatingRight || 5;
    return `${foot} ${left}/${right}`;
}

function renderStat(label, value) {
    return `
        <div class="stat-item">
            <div class="stat-info">
                <span>${label}</span>
                <span>${value}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${value}%"></div>
            </div>
        </div>
    `;
}

function renderDots(value) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        dots += `<div class="dot ${i <= value ? 'active' : ''}"></div>`;
    }
    return `<div class="rating-dots">${dots}</div>`;
}

function renderPositionMap(activePosString) {
    const activePositions = activePosString.split('/').map(s => s.trim().toUpperCase());
    
    const allPositions = [
        { id: 'ST', x: 50, y: 12 },
        { id: 'LW', x: 20, y: 20 },
        { id: 'RW', x: 80, y: 20 },
        { id: 'AM', x: 50, y: 35 },
        { id: 'LM', x: 15, y: 45 },
        { id: 'RM', x: 85, y: 45 },
        { id: 'LCM', x: 35, y: 55 },
        { id: 'CM', x: 50, y: 55 },
        { id: 'RCM', x: 65, y: 55 },
        { id: 'DM', x: 50, y: 72 },
        { id: 'LB', x: 15, y: 82 },
        { id: 'RB', x: 85, y: 82 },
        { id: 'LCB', x: 35, y: 88 },
        { id: 'CB', x: 50, y: 88 },
        { id: 'RCB', x: 65, y: 88 },
        { id: 'GK', x: 50, y: 96 }
    ];

    const dotsHtml = allPositions.map(pos => {
        const isActive = activePositions.includes(pos.id);
        return `
            <div class="pos-dot ${isActive ? 'active' : ''}" style="top: ${pos.y}%; left: ${pos.x}%;"></div>
            <div class="pos-label-mini" style="top: ${pos.y}%; left: ${pos.x}%;">${pos.id}</div>
        `;
    }).join('');

    return `
        <div class="position-map-container">
            <svg class="pitch-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <!-- Outer boundary -->
                <rect x="5" y="5" width="90" height="90" class="pitch-line" />
                <!-- Halfway line -->
                <line x1="5" y1="50" x2="95" y2="50" class="pitch-line" />
                <!-- Center circle -->
                <circle cx="50" cy="50" r="12" class="pitch-line" />
                <!-- Penalty areas -->
                <rect x="25" y="5" width="50" height="15" class="pitch-line" />
                <rect x="25" y="80" width="50" height="15" class="pitch-line" />
                <!-- Goal areas -->
                <rect x="38" y="5" width="24" height="6" class="pitch-line" />
                <rect x="38" y="89" width="24" height="6" class="pitch-line" />
            </svg>
            <div class="pos-dots-layer">
                ${dotsHtml}
            </div>
        </div>
    `;
}

function renderPlayers() {
    const listGrid = document.getElementById('idp-list-view');
    if (!listGrid) return;
    
    listGrid.innerHTML = players.map((p, index) => `
        <div class="card" style="cursor: pointer; position: relative;" onclick="viewAthlete(${index})">
            <div class="tag-container">
                <span class="tag accent">${p.basic.pos}</span>
                <span class="tag">${getFootDisplay(p)}</span>
            </div>
            <h3 class="player-name">${p.name}</h3>
            <p class="player-feedback" style="margin-bottom: 15px; font-size: 12px; color: var(--text-secondary);">
                ${p.match.feedback}
            </p>
            <div class="stats-container">
                ${renderStat('OVERALL TECH', p.stats.tech)}
                ${renderStat('OVERALL PHYS', p.stats.phys)}
            </div>
            <div style="margin-top: 20px; font-size: 11px; font-weight: 800; color: var(--text-secondary); text-align: right;">
                CLICK TO VIEW DETAILS →
            </div>
        </div>
    `).join('');
}

function viewAthlete(index) {
    const p = players[index];
    
    document.getElementById('idp-list-view').style.display = 'none';
    document.getElementById('idp-register-view').style.display = 'none';
    document.getElementById('idp-edit-view').style.display = 'none';
    document.getElementById('idp-detail-view').style.display = 'block';
    
    const detailActions = document.getElementById('idp-detail-actions');
    detailActions.innerHTML = `
        <button class="btn-add" style="background-color: var(--border-color); color: var(--text-primary); margin-right: 10px;" onclick="editAthlete(${index})">EDIT ATHLETE</button>
        <button class="btn-add" style="background-color: var(--warning-red); color: white;" onclick="deleteAthlete(${index})">DELETE ATHLETE</button>
    `;

    const detailContent = document.getElementById('idp-detail-content');
    
    detailContent.innerHTML = `
        <div class="analysis-container">
            <!-- SECTION 1: CORE BIOMETRICS -->
            <div class="analysis-section">
                <h4 class="section-subtitle">CORE BIOMETRICS</h4>
                <div class="biometrics-header">
                    <div class="bio-main-info">
                        <div class="bio-details-grid">
                            <div class="biometrics-item">
                                <span class="bio-label">NAME / DOB</span>
                                <span class="bio-value">${p.name} (${p.dob || '미입력'})</span>
                            </div>
                            <div class="biometrics-item">
                                <span class="bio-label">TEAM / SCHOOL</span>
                                <span class="bio-value">${p.basic.team} / ${p.school || '미입력'}</span>
                            </div>
                            <div class="biometrics-item">
                                <span class="bio-label">POSITION / FOOT</span>
                                <span class="bio-value">${p.basic.pos} (${getFootDisplay(p)})</span>
                            </div>
                            <div class="biometrics-item">
                                <span class="bio-label">PHYSICAL</span>
                                <span class="bio-value">${p.body.height} / ${p.body.weight}</span>
                            </div>
                        </div>
                        <div class="biometrics-item" style="margin-top: 5px;">
                            <span class="bio-label">ALLECTA ONE</span>
                            <span class="bio-value">${p.allectaOne || '미입력'}</span>
                        </div>
                    </div>
                    <div id="pos-map-wrapper">
                        ${renderPositionMap(p.basic.pos)}
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <!-- SECTION 2: PERFORMANCE METRICS -->
            <div class="analysis-section">
                <h4 class="section-subtitle">PERFORMANCE METRICS (5-POINT SCALE)</h4>
                <div class="metrics-category-grid">
                    <!-- Technical -->
                    <div class="category-box">
                        <h5 class="category-title">TECHNICAL</h5>
                        <div class="rating-item"><span class="rating-label">드리블 (Dribble)</span> ${renderDots(p.tech.dribble)}</div>
                        <div class="rating-item"><span class="rating-label">패싱 & 리시빙 (Passing)</span> ${renderDots(p.tech.pass)}</div>
                        <div class="rating-item"><span class="rating-label">볼 컨트롤 (Control)</span> ${renderDots(p.tech.control)}</div>
                        <div class="rating-item"><span class="rating-label">헤딩 (Heading)</span> ${renderDots(p.tech.heading)}</div>
                        <div class="rating-item"><span class="rating-label">1v1 수비 (Defense)</span> ${renderDots(p.tech.defense1v1)}</div>
                    </div>
                    <!-- Tactical -->
                    <div class="category-box">
                        <h5 class="category-title">TACTICAL</h5>
                        <div class="rating-item"><span class="rating-label">공격 가담 (Attacking)</span> ${renderDots(p.tactic.attacking)}</div>
                        <div class="rating-item"><span class="rating-label">공간 활용 & 창출 (Space)</span> ${renderDots(p.tactic.space)}</div>
                        <div class="rating-item"><span class="rating-label">볼 받는 움직임 (Movement)</span> ${renderDots(p.tactic.movement)}</div>
                        <div class="rating-item"><span class="rating-label">수비 위치선정 (Positioning)</span> ${renderDots(p.tactic.positioning)}</div>
                        <div class="rating-item"><span class="rating-label">포지에 대한 이해 (Understanding)</span> ${renderDots(p.tactic.understanding)}</div>
                    </div>
                    <!-- Physical -->
                    <div class="category-box">
                        <h5 class="category-title">PHYSICAL</h5>
                        <div class="rating-item"><span class="rating-label">스피드 (Speed)</span> ${renderDots(p.phys.speed)}</div>
                        <div class="rating-item"><span class="rating-label">민첩성 (Agility)</span> ${renderDots(p.phys.agility)}</div>
                        <div class="rating-item"><span class="rating-label">순발력 (Explosiveness)</span> ${renderDots(p.phys.explosiveness)}</div>
                        <div class="rating-item"><span class="rating-label">상황인지 (Awareness)</span> ${renderDots(p.phys.awareness)}</div>
                        <div class="rating-item"><span class="rating-label">코디네이션 & 밸런스 (Balance)</span> ${renderDots(p.phys.balance)}</div>
                    </div>
                    <!-- Psychological -->
                    <div class="category-box">
                        <h5 class="category-title">PSYCHOLOGICAL</h5>
                        <div class="rating-item"><span class="rating-label">창의성 (Creativity)</span> ${renderDots(p.mental.creativity)}</div>
                        <div class="rating-item"><span class="rating-label">적극성 (Aggressiveness)</span> ${renderDots(p.mental.aggressiveness)}</div>
                        <div class="rating-item"><span class="rating-label">자신감 (Confidence)</span> ${renderDots(p.mental.confidence)}</div>
                        <div class="rating-item"><span class="rating-label">협동심 (Cooperation)</span> ${renderDots(p.mental.cooperation)}</div>
                        <div class="rating-item"><span class="rating-label">선택 & 결정 (Decision)</span> ${renderDots(p.mental.decision)}</div>
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <!-- SECTION 3: STRATEGIC FEEDBACK -->
            <div class="analysis-section">
                <h4 class="section-subtitle">STRATEGIC FEEDBACK</h4>
                <div class="feedback-container">
                    <div class="comment-box">
                        <span class="bio-label" style="display: block; margin-bottom: 10px;">COACH COMMENTS</span>
                        <div style="font-size: 15px; line-height: 1.6;">${p.match.feedback}</div>
                    </div>
                    <div class="focus-box">
                        <div class="focus-title">Development Focus</div>
                        <div class="focus-content">${p.goal.task}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

async function deleteAthlete(index) {
    if (!confirm('정말로 이 선수를 삭제하시겠습니까?')) return;
    const player = players[index];
    try {
        await apiSend('DELETE', `/players/${player.id}`);
        players.splice(index, 1);
        renderPlayers();
        backToAthleteList();
    } catch (err) {
        alert(err.message);
    }
}

function editAthlete(index) {
    const p = players[index];
    
    document.getElementById('idp-detail-view').style.display = 'none';
    document.getElementById('idp-edit-view').style.display = 'block';
    
    // Core Biometrics
    document.getElementById('edit-index').value = index;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-dob').value = p.dob || '';
    document.getElementById('edit-school').value = p.school || '';
    document.getElementById('edit-team').value = p.basic.team;
    document.getElementById('edit-allecta').value = p.allectaOne || '';
    document.getElementById('edit-pos').value = p.basic.pos;
    document.getElementById('edit-foot').value = p.basic.foot;
    document.getElementById('edit-foot-left').value = p.basic.footRatingLeft || 5;
    document.getElementById('edit-foot-right').value = p.basic.footRatingRight || 5;
    document.getElementById('edit-height').value = p.body.height;
    document.getElementById('edit-weight').value = p.body.weight;
    
    // Technical
    document.getElementById('edit-t-dribble').value = p.tech.dribble || 3;
    document.getElementById('edit-t-pass').value = p.tech.pass || 3;
    document.getElementById('edit-t-control').value = p.tech.control || 3;
    document.getElementById('edit-t-heading').value = p.tech.heading || 3;
    document.getElementById('edit-t-defense').value = p.tech.defense1v1 || 3;
    
    // Tactical
    document.getElementById('edit-ta-attacking').value = p.tactic.attacking || 3;
    document.getElementById('edit-ta-space').value = p.tactic.space || 3;
    document.getElementById('edit-ta-movement').value = p.tactic.movement || 3;
    document.getElementById('edit-ta-positioning').value = p.tactic.positioning || 3;
    document.getElementById('edit-ta-understanding').value = p.tactic.understanding || 3;
    
    // Physical
    document.getElementById('edit-p-speed').value = p.phys.speed || 3;
    document.getElementById('edit-p-agility').value = p.phys.agility || 3;
    document.getElementById('edit-p-explosiveness').value = p.phys.explosiveness || 3;
    document.getElementById('edit-p-awareness').value = p.phys.awareness || 3;
    document.getElementById('edit-p-balance').value = p.phys.balance || 3;
    
    // Psychological
    document.getElementById('edit-m-creativity').value = p.mental.creativity || 3;
    document.getElementById('edit-m-aggressiveness').value = p.mental.aggressiveness || 3;
    document.getElementById('edit-m-confidence').value = p.mental.confidence || 3;
    document.getElementById('edit-m-cooperation').value = p.mental.cooperation || 3;
    document.getElementById('edit-m-decision').value = p.mental.decision || 3;
    
    document.getElementById('edit-feedback').value = p.match.feedback;
    document.getElementById('edit-focus').value = p.goal.task;
}

async function updatePlayer(e) {
    e.preventDefault();
    const index = document.getElementById('edit-index').value;
    const p = players[index];

    // Core Biometrics
    p.name = document.getElementById('edit-name').value;
    p.dob = document.getElementById('edit-dob').value;
    p.school = document.getElementById('edit-school').value;
    p.basic.team = document.getElementById('edit-team').value;
    p.allectaOne = document.getElementById('edit-allecta').value;
    p.basic.pos = document.getElementById('edit-pos').value;
    p.basic.foot = document.getElementById('edit-foot').value;
    p.basic.footRatingLeft = parseInt(document.getElementById('edit-foot-left').value);
    p.basic.footRatingRight = parseInt(document.getElementById('edit-foot-right').value);
    p.body.height = document.getElementById('edit-height').value;
    p.body.weight = document.getElementById('edit-weight').value;
    
    // Technical
    p.tech.dribble = parseInt(document.getElementById('edit-t-dribble').value);
    p.tech.pass = parseInt(document.getElementById('edit-t-pass').value);
    p.tech.control = parseInt(document.getElementById('edit-t-control').value);
    p.tech.heading = parseInt(document.getElementById('edit-t-heading').value);
    p.tech.defense1v1 = parseInt(document.getElementById('edit-t-defense').value);
    
    // Tactical
    p.tactic.attacking = parseInt(document.getElementById('edit-ta-attacking').value);
    p.tactic.space = parseInt(document.getElementById('edit-ta-space').value);
    p.tactic.movement = parseInt(document.getElementById('edit-ta-movement').value);
    p.tactic.positioning = parseInt(document.getElementById('edit-ta-positioning').value);
    p.tactic.understanding = parseInt(document.getElementById('edit-ta-understanding').value);
    
    // Physical
    p.phys.speed = parseInt(document.getElementById('edit-p-speed').value);
    p.phys.agility = parseInt(document.getElementById('edit-p-agility').value);
    p.phys.explosiveness = parseInt(document.getElementById('edit-p-explosiveness').value);
    p.phys.awareness = parseInt(document.getElementById('edit-p-awareness').value);
    p.phys.balance = parseInt(document.getElementById('edit-p-balance').value);
    
    // Psychological
    p.mental.creativity = parseInt(document.getElementById('edit-m-creativity').value);
    p.mental.aggressiveness = parseInt(document.getElementById('edit-m-aggressiveness').value);
    p.mental.confidence = parseInt(document.getElementById('edit-m-confidence').value);
    p.mental.cooperation = parseInt(document.getElementById('edit-m-cooperation').value);
    p.mental.decision = parseInt(document.getElementById('edit-m-decision').value);
    
    // Recalculate basic stats (%)
    p.stats.tech = Math.round((p.tech.dribble + p.tech.pass + p.tech.control + p.tech.heading + p.tech.defense1v1) * 4);
    p.stats.tactical = Math.round((p.tactic.attacking + p.tactic.space + p.tactic.movement + p.tactic.positioning + p.tactic.understanding) * 4);
    p.stats.phys = Math.round((p.phys.speed + p.phys.agility + p.phys.explosiveness + p.phys.awareness + p.phys.balance) * 4);
    p.stats.mental = Math.round((p.mental.creativity + p.mental.aggressiveness + p.mental.confidence + p.mental.cooperation + p.mental.decision) * 4);
    
    p.match.feedback = document.getElementById('edit-feedback').value;
    p.goal.task = document.getElementById('edit-focus').value;

    try {
        const updated = await apiSend('PUT', `/players/${p.id}`, p);
        players[index] = updated;
        renderPlayers();
        viewAthlete(index); // 수정 후 다시 상세 페이지로
    } catch (err) {
        alert(err.message);
    }
}

function cancelEdit() {
    const index = document.getElementById('edit-index').value;
    document.getElementById('edit-form').reset();
    document.getElementById('idp-edit-view').style.display = 'none';
    document.getElementById('idp-detail-view').style.display = 'block';
}

function renderPerformanceMetric(label, value) {
    return `
        <div class="metric-item">
            <div class="metric-header">
                <span class="metric-name">${label}</span>
                <span class="metric-percentage">${value}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${value}%"></div>
            </div>
        </div>
    `;
}


function backToAthleteList() {
    document.getElementById('idp-detail-view').style.display = 'none';
    document.getElementById('idp-register-view').style.display = 'none';
    document.getElementById('idp-edit-view').style.display = 'none';
    document.getElementById('idp-list-view').style.display = 'grid';
}

function showRegisterForm() {
    document.getElementById('idp-list-view').style.display = 'none';
    document.getElementById('idp-detail-view').style.display = 'none';
    document.getElementById('idp-edit-view').style.display = 'none';
    document.getElementById('idp-register-view').style.display = 'block';
}

function cancelRegister() {
    document.getElementById('register-form').reset();
    backToAthleteList();
}

async function submitPlayer(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const dob = document.getElementById('reg-dob').value;
    const school = document.getElementById('reg-school').value;
    const team = document.getElementById('reg-team').value;
    const allecta = document.getElementById('reg-allecta').value;
    const pos = document.getElementById('reg-pos').value;
    const foot = document.getElementById('reg-foot').value;
    const leftRating = parseInt(document.getElementById('reg-foot-left').value);
    const rightRating = parseInt(document.getElementById('reg-foot-right').value);
    const height = document.getElementById('reg-height').value;
    const weight = document.getElementById('reg-weight').value;
    
    const tech = {
        dribble: parseInt(document.getElementById('reg-t-dribble').value),
        pass: parseInt(document.getElementById('reg-t-pass').value),
        control: parseInt(document.getElementById('reg-t-control').value),
        heading: parseInt(document.getElementById('reg-t-heading').value),
        defense1v1: parseInt(document.getElementById('reg-t-defense').value)
    };
    const tactic = {
        attacking: parseInt(document.getElementById('reg-ta-attacking').value),
        space: parseInt(document.getElementById('reg-ta-space').value),
        movement: parseInt(document.getElementById('reg-ta-movement').value),
        positioning: parseInt(document.getElementById('reg-ta-positioning').value),
        understanding: parseInt(document.getElementById('reg-ta-understanding').value)
    };
    const phys = {
        speed: parseInt(document.getElementById('reg-p-speed').value),
        agility: parseInt(document.getElementById('reg-p-agility').value),
        explosiveness: parseInt(document.getElementById('reg-p-explosiveness').value),
        awareness: parseInt(document.getElementById('reg-p-awareness').value),
        balance: parseInt(document.getElementById('reg-p-balance').value)
    };
    const mental = {
        creativity: parseInt(document.getElementById('reg-m-creativity').value),
        aggressiveness: parseInt(document.getElementById('reg-m-aggressiveness').value),
        confidence: parseInt(document.getElementById('reg-m-confidence').value),
        cooperation: parseInt(document.getElementById('reg-m-cooperation').value),
        decision: parseInt(document.getElementById('reg-m-decision').value)
    };
    
    const feedback = document.getElementById('reg-feedback').value;
    const focus = document.getElementById('reg-focus').value;

    const newPlayer = {
        name: name,
        dob: dob,
        school: school,
        allectaOne: allecta,
        basic: { age: "U18", grade: "-", pos: pos, foot: foot, footRatingLeft: leftRating, footRatingRight: rightRating, team: team, exp: "-" },
        body: { height: height, weight: weight, growth: "-", injury: "없음", maturity: "-" },
        tech: tech,
        tactic: tactic,
        phys: phys,
        mental: mental,
        life: { sleep: "-", nutrition: "-", study: "-", stress: "-" },
        match: { time: "0분", pos: pos, play: "-", feedback: feedback },
        goal: { month: focus, task: focus, feedback: "-" },
        stats: { 
            tech: Math.round((tech.dribble + tech.pass + tech.control + tech.heading + tech.defense1v1) * 4), 
            tactical: Math.round((tactic.attacking + tactic.space + tactic.movement + tactic.positioning + tactic.understanding) * 4), 
            phys: Math.round((phys.speed + phys.agility + phys.explosiveness + phys.awareness + phys.balance) * 4), 
            mental: Math.round((mental.creativity + mental.aggressiveness + mental.confidence + mental.cooperation + mental.decision) * 4) 
        }
    };

    try {
        const created = await apiSend('POST', '/players', newPlayer);
        players.unshift(created);
        renderPlayers();
        cancelRegister();
    } catch (err) {
        alert(err.message);
    }
}

// ==========================================
// Disqus Integration Helper
// ==========================================
function loadDisqus(identifier, url, title) {
    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = url;
                this.page.title = title;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.identifier = identifier;
            this.page.url = url;
            this.page.title = title;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://min-16.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
}

// ==========================================
// 2. TACTICAL & TECH (Library) 로직
// ==========================================

function renderLibrary(filterTag = '') {
    const listGrid = document.getElementById('library-list-view');
    if (!listGrid) return;
    
    const filteredData = filterTag 
        ? library.filter(i => i.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())))
        : library;

    if (filteredData.length === 0) {
        listGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">'${filterTag}' 태그가 포함된 훈련이 없습니다.</div>`;
        return;
    }

    listGrid.innerHTML = filteredData.map((i, index) => `
        <div class="card" onclick="viewLibrary(${library.indexOf(i)})">
            <div class="tag-list" style="margin-bottom: 12px;">
                ${i.tags.map(t => `<span class="hashtag-chip" onclick="event.stopPropagation(); setLibraryFilter('${t}')">${t}</span>`).join('')}
            </div>
            <h3 class="card-title">${i.name}</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">대상: ${i.age} | ${i.level}</p>
            <p class="info-text" style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">${i.purpose}</p>
            
            <div class="card-footer-link">
                VIEW TRAINING LOG →
            </div>
        </div>
    `).join('');
}

function filterLibrary() {
    const query = document.getElementById('library-search').value;
    renderLibrary(query);
}

function setLibraryFilter(tag) {
    document.getElementById('library-search').value = tag;
    renderLibrary(tag);
}

function resetLibraryFilter() {
    document.getElementById('library-search').value = '';
    renderLibrary();
}

function viewLibrary(index) {
    const i = library[index];
    document.getElementById('library-list-view').style.display = 'none';
    document.getElementById('library-detail-view').style.display = 'block';

    // Tactical Diagram SVG helper
    const renderTacticalDiagram = (type) => {
        if (type === 'u12-rondo') {
            return `
                <svg viewBox="0 0 100 80" class="pitch-svg" style="background-color: #1a3a1a; border-radius: 8px;">
                    <rect x="20" y="10" width="60" height="60" class="pitch-line" stroke-dasharray="2" />
                    <!-- Players -->
                    <circle cx="50" cy="15" r="3" fill="#E00000" /> <!-- Attacker 1 -->
                    <circle cx="50" cy="65" r="3" fill="#E00000" /> <!-- Attacker 2 -->
                    <circle cx="25" cy="40" r="3" fill="#E00000" /> <!-- Attacker 3 -->
                    <circle cx="75" cy="40" r="3" fill="#E00000" /> <!-- Attacker 4 -->
                    <circle cx="45" cy="40" r="3" fill="#fff" /> <!-- Defender 1 -->
                    <circle cx="55" cy="40" r="3" fill="#fff" /> <!-- Defender 2 -->
                    <!-- Ball -->
                    <circle cx="30" cy="35" r="2" fill="#FFD700" />
                    <!-- Movement Arrow -->
                    <path d="M 32 35 Q 50 35 68 38" fill="none" stroke="#FFD700" stroke-width="1" stroke-dasharray="2" marker-end="url(#arrow)" />
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFD700" />
                        </marker>
                    </defs>
                </svg>`;
        } else {
            return `
                <svg viewBox="0 0 100 80" class="pitch-svg" style="background-color: #1a3a1a; border-radius: 8px;">
                    <rect x="5" y="5" width="90" height="70" class="pitch-line" />
                    <line x1="50" y1="5" x2="50" y2="75" class="pitch-line" />
                    <circle cx="50" cy="40" r="10" class="pitch-line" />
                    <!-- Defenders -->
                    <circle cx="40" cy="20" r="3" fill="#E00000" />
                    <circle cx="40" cy="40" r="3" fill="#E00000" />
                    <circle cx="40" cy="60" r="3" fill="#E00000" />
                    <!-- Attackers -->
                    <circle cx="60" cy="30" r="3" fill="#fff" />
                    <circle cx="60" cy="50" r="3" fill="#fff" />
                    <!-- Action -->
                    <path d="M 58 30 L 42 22" fill="none" stroke="#FFD700" stroke-width="1.5" marker-end="url(#arrow2)" />
                    <defs>
                        <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFD700" />
                        </marker>
                    </defs>
                </svg>`;
        }
    };

    const detailContent = document.getElementById('library-detail-content');
    detailContent.innerHTML = `
        <div class="training-split-container">
            <!-- Left Panel: Content -->
            <div class="training-info-panel">
                <div>
                    <div class="tag-list">
                        ${i.tags.map(t => `<span class="hashtag-chip">${t}</span>`).join('')}
                    </div>
                    <h3 class="card-title" style="font-size: 32px; margin-bottom: 10px;">${i.name}</h3>
                    <p style="color: var(--text-secondary); font-weight: 700;">GBT Research Archive | ${i.age} 세션</p>
                </div>

                <div class="gbt-content-box">
                    <span class="gbt-label">훈련 목표 (Training Objective)</span>
                    <div class="gbt-text" style="font-weight: 800; color: var(--accent-color);">
                        ${i.objective || i.purpose}
                    </div>
                </div>

                <div class="gbt-content-box">
                    <span class="gbt-label">구성 및 진행 (Organization & Process)</span>
                    <ul class="process-list">
                        ${(i.organization || i.flow).split('\n').map(step => `
                            <li class="process-item">${step.trim()}</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="gbt-content-box">
                    <span class="gbt-label">코칭 포인트 (Coaching Points)</span>
                    <div class="gbt-text">${i.points}</div>
                </div>

                <div class="gbt-content-box">
                    <span class="gbt-label">세부 데이터 (Session Details)</span>
                    <table class="detail-table" style="margin-top: 0;">
                        <tr><th>필요 인원</th><td>${i.personnel}</td></tr>
                        <tr><th>필요 장비</th><td>${i.equip}</td></tr>
                        <tr><th>공간 규격</th><td>${i.space}</td></tr>
                        <tr><th>변형 규칙</th><td>${i.rules}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Right Panel: Media & Tactical Board -->
            <div class="training-media-panel">
                <span class="gbt-label">미디어 분석 (Media Analysis)</span>
                <div class="video-placeholder" style="background: #000;">
                    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${i.videoId || '2_kI57G5YI0'}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>

                <span class="gbt-label">전술 시각화 (Tactical Visualization)</span>
                <div class="position-map-container" style="height: auto; aspect-ratio: 4/3; background: #1a3a1a; padding: 10px;">
                    ${renderTacticalDiagram(i.diagramType)}
                </div>

                <div class="gbt-content-box" style="background-color: rgba(224, 0, 0, 0.05); border-color: rgba(224, 0, 0, 0.2);">
                    <span class="gbt-label" style="color: #ff4d4d;">지도자 연구 후기 (Coach's Review)</span>
                    <div class="gbt-text" style="font-style: italic;">"${i.review}"</div>
                </div>
            </div>
        </div>
    `;

    // Load or Reset Disqus for the current training item
    const identifier = 'library-' + index;
    const url = window.location.origin + window.location.pathname + '#!library-' + index;
    loadDisqus(identifier, url, i.name);

    window.scrollTo(0, 0);
}

function backToLibraryList() {
    document.getElementById('library-detail-view').style.display = 'none';
    document.getElementById('library-list-view').style.display = 'grid';
}

// ==========================================
// 3. PHYSICAL & REHAB 로직
// ==========================================

function renderPhysical() {
    const listGrid = document.getElementById('physical-list-view');
    if (!listGrid) return;
    
    listGrid.innerHTML = physical.map((i, index) => `
        <div class="card" style="cursor: pointer;" onclick="viewPhysical(${index})">
            <div class="tag-container">
                ${i.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <h3 class="card-title">${i.name}</h3>
            <div style="margin-top: 20px; font-size: 11px; font-weight: 800; color: var(--text-secondary); text-align: right;">
                CLICK TO VIEW DETAILS →
            </div>
            ${i.warning ? '<p class="warning-text" style="margin-top: 10px;">⚠ 통증 발생 시 즉시 중단</p>' : ''}
        </div>
    `).join('');
}

function viewPhysical(index) {
    const i = physical[index];
    document.getElementById('physical-list-view').style.display = 'none';
    document.getElementById('physical-detail-view').style.display = 'block';

    const detailContent = document.getElementById('physical-detail-content');
    detailContent.innerHTML = `
        <div class="card">
            <div class="tag-container">
                ${i.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <h3 class="card-title" style="font-size: 24px; margin-bottom: 20px;">${i.name}</h3>
            <table class="detail-table">
                <tr><th>훈련 목표</th><td>${i.objective}</td></tr>
                <tr><th>진행 방식</th><td>${i.method.replace(/\n/g, '<br>')}</td></tr>
                <tr><th>빈도/강도</th><td>${i.frequency}</td></tr>
                <tr><th>필요 장비</th><td>${i.equipment}</td></tr>
                <tr><th>평가 지표</th><td>${i.metrics}</td></tr>
            </table>
            ${i.warning ? '<p class="warning-text" style="margin-top: 20px;">⚠ 통증 발생 시 즉시 중단 (과도한 훈련 주의)</p>' : ''}
        </div>
    `;
    window.scrollTo(0, 0);
}

function backToPhysicalList() {
    document.getElementById('physical-detail-view').style.display = 'none';
    document.getElementById('physical-list-view').style.display = 'grid';
}

// ==========================================
// 4. MATCH ANALYSIS 로직 (단일 뷰 유지)
// ==========================================

function renderMatches() {
    const grid = document.getElementById('match-grid');
    if (!grid) return;
    grid.innerHTML = matches.map(i => `
        <div class="card">
            <div class="tag-container">
                <span class="tag accent">${i.formation}</span>
                <span class="tag">${i.team}</span>
            </div>
            <h3 class="card-title">${i.date}</h3>
            <table class="detail-table">
                <tr><th>경기 목표</th><td>${i.objective}</td></tr>
                <tr><th>잘된 점</th><td>${i.good}</td></tr>
                <tr><th>부족한 점</th><td>${i.bad}</td></tr>
                <tr><th>개인 피드백</th><td>${i.feedback}</td></tr>
                <tr><th>다음 훈련 연결</th><td>${i.next}</td></tr>
            </table>
        </div>
    `).join('');
}

// ==========================================
// 5. COMMUNICATION HUB 로직
// ==========================================

function renderCommunication() {
    const list = document.getElementById('comm-list');
    if (!list) return;

    list.innerHTML = posts.map((p, index) => `
        <div class="card" style="margin-bottom: 15px; cursor: pointer;" onclick="viewPost(${index})">
            <div class="tag-container" style="justify-content: space-between; width: 100%;">
                <span class="tag accent">${p.author}</span>
                <span style="font-size: 11px; color: var(--text-secondary);">${p.date}</span>
            </div>
            <h3 class="card-title" style="margin: 10px 0;">${p.title}</h3>
            <p style="font-size: 14px; line-height: 1.6; color: var(--text-primary); margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${p.content.replace(/\n/g, ' ')}
            </p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; gap: 15px;">
                <span style="font-size: 12px; color: var(--text-secondary);">💬 댓글 ${p.replies.length}</span>
                <span style="font-size: 12px; color: var(--text-secondary);">👍 추천 ${p.likes}</span>
            </div>
        </div>
    `).join('');
}

function viewPost(index) {
    const p = posts[index];
    document.getElementById('comm-list-view').style.display = 'none';
    document.getElementById('comm-detail-view').style.display = 'block';

    const detailContent = document.getElementById('comm-detail-content');
    detailContent.innerHTML = `
        <div class="card">
            <div class="tag-container" style="justify-content: space-between; width: 100%;">
                <span class="tag accent">${p.author}</span>
                <span style="font-size: 11px; color: var(--text-secondary);">${p.date}</span>
            </div>
            <h3 class="card-title" style="font-size: 24px; margin: 15px 0;">${p.title}</h3>
            <p style="font-size: 16px; line-height: 1.8; color: var(--text-primary); margin-bottom: 20px;">
                ${p.content.replace(/\n/g, '<br>')}
            </p>
            <div style="text-align: right;">
                <button class="btn-add" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);" onclick="likePost(${index})">👍 추천하기 (${p.likes})</button>
            </div>
        </div>
    `;

    renderComments(index);
    
    // 댓글 등록 버튼 이벤트 바인딩
    const addCommentBtn = document.getElementById('add-comment-btn');
    addCommentBtn.onclick = () => addComment(index);
    
    window.scrollTo(0, 0);
}

function renderComments(postIndex) {
    const p = posts[postIndex];
    const commentList = document.getElementById('comment-list');
    
    if (!p.replies || p.replies.length === 0) {
        commentList.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
        return;
    }

    commentList.innerHTML = p.replies.map(r => `
        <div style="padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 800; font-size: 13px; color: var(--text-primary);">${r.author}</span>
                <span style="font-size: 11px; color: var(--text-secondary);">${r.date}</span>
            </div>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">${r.content.replace(/\n/g, '<br>')}</p>
        </div>
    `).join('');
}

async function addComment(postIndex) {
    const commentInput = document.getElementById('new-comment');
    if (!commentInput.value.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    const post = posts[postIndex];
    try {
        const updated = await apiSend('POST', `/posts/${post.id}/comments`, { content: commentInput.value });
        posts[postIndex] = updated;
        commentInput.value = '';
        renderComments(postIndex);
        renderCommunication(); // 메인 리스트의 댓글 수 업데이트를 위해
    } catch (err) {
        alert(err.message);
    }
}

async function likePost(postIndex) {
    const post = posts[postIndex];
    try {
        const updated = await apiSend('POST', `/posts/${post.id}/like`);
        posts[postIndex] = updated;
        viewPost(postIndex);
    } catch (err) {
        alert(err.message);
    }
}

function backToCommList() {
    document.getElementById('comm-detail-view').style.display = 'none';
    document.getElementById('comm-list-view').style.display = 'block';
}

async function addPost() {
    const title = document.getElementById('comm-title');
    const content = document.getElementById('comm-content');

    if (!title.value.trim() || !content.value.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    try {
        const created = await apiSend('POST', '/posts', {
            title: title.value,
            content: content.value
        });
        posts.unshift(created); // 최신글이 위로
        renderCommunication();

        title.value = '';
        content.value = '';
        alert('성공적으로 등록되었습니다.');
    } catch (err) {
        alert(err.message);
    }
}

// --- 서버 연동 데이터 (초기값은 빈 배열, DOMContentLoaded 시점에 API로 채워짐) ---
let posts = [];
let players = [];
let library = [];
let physical = [];
let matches = [];

// --- 초기화 ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        [players, library, physical, matches, posts] = await Promise.all([
            apiGet('/players'),
            apiGet('/library'),
            apiGet('/physical'),
            apiGet('/matches'),
            apiGet('/posts')
        ]);
    } catch (err) {
        alert('서버에서 데이터를 불러오지 못했습니다. 서버(node server.js)가 실행 중인지 확인해주세요.\n' + err.message);
    }

    renderPlayers();
    renderLibrary();
    renderPhysical();
    renderMatches();
    renderCommunication();

    // 처음 접속 시 IDP 섹션(리스트 뷰)만 표시
    showSection('idp');
});
