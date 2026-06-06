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

function deleteAthlete(index) {
    if (confirm('정말로 이 선수를 삭제하시겠습니까?')) {
        players.splice(index, 1);
        renderPlayers();
        backToAthleteList();
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

function updatePlayer(e) {
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

    renderPlayers();
    viewAthlete(index); // 수정 후 다시 상세 페이지로
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

function submitPlayer(e) {
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

    players.unshift(newPlayer);
    renderPlayers();
    cancelRegister();
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

function renderLibrary() {
    const listGrid = document.getElementById('library-list-view');
    if (!listGrid) return;
    
    listGrid.innerHTML = library.map((i, index) => `
        <div class="card" style="cursor: pointer;" onclick="viewLibrary(${index})">
            <div class="tag-container">
                <span class="tag accent">${i.level}</span>
                ${i.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <h3 class="card-title">${i.name}</h3>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">대상 연령: ${i.age}</p>
            <p class="info-text" style="color: var(--text-secondary);">${i.purpose}</p>
            <div style="margin-top: 20px; font-size: 11px; font-weight: 800; color: var(--text-secondary); text-align: right;">
                CLICK TO VIEW DETAILS →
            </div>
        </div>
    `).join('');
}

function viewLibrary(index) {
    const i = library[index];
    document.getElementById('library-list-view').style.display = 'none';
    document.getElementById('library-detail-view').style.display = 'block';

    const detailContent = document.getElementById('library-detail-content');
    detailContent.innerHTML = `
        <div class="card">
            <div class="tag-container">
                <span class="tag accent">${i.level}</span>
                ${i.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <h3 class="card-title" style="font-size: 24px; margin-bottom: 20px;">${i.name}</h3>
            <table class="detail-table">
                <tr><th>대상 연령</th><td>${i.age}</td></tr>
                <tr><th>목적</th><td>${i.purpose}</td></tr>
                <tr><th>필요 인원</th><td>${i.personnel}</td></tr>
                <tr><th>필요 장비</th><td>${i.equip}</td></tr>
                <tr><th>공간</th><td>${i.space}</td></tr>
                <tr><th>진행 방식</th><td>${i.flow}</td></tr>
                <tr><th>코칭 포인트</th><td>${i.points}</td></tr>
                <tr><th>변형 규칙</th><td>${i.rules}</td></tr>
                <tr><th>평가 지표</th><td>${i.metrics}</td></tr>
                <tr><th>현장 후기</th><td>${i.review}</td></tr>
            </table>
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
                <tr><th>진행 방식</th><td>${i.method}</td></tr>
                <tr><th>평가 지표</th><td>${i.metrics}</td></tr>
            </table>
            ${i.warning ? '<p class="warning-text">⚠ 통증 발생 시 즉시 중단</p>' : ''}
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

// --- 더미 데이터 ---
const players = [
    { 
        name: "손흥민", 
        dob: "2008.07.08",
        school: "KFA High School",
        allectaOne: "Allecta Elite Team",
        basic: { age: "U18", grade: "고3", pos: "LW/ST", foot: "양발", footRatingLeft: 5, footRatingRight: 5, team: "KFA FC", exp: "7년" },
        body: { height: "183cm", weight: "78kg", growth: "완료", injury: "없음", maturity: "상" },
        tech: { dribble: 5, pass: 5, control: 5, heading: 4, defense1v1: 4 },
        tactic: { attacking: 5, space: 5, movement: 5, positioning: 4, understanding: 5 },
        phys: { speed: 5, agility: 5, explosiveness: 5, awareness: 5, balance: 5 },
        mental: { creativity: 5, aggressiveness: 4, confidence: 5, cooperation: 5, decision: 5 },
        life: { sleep: "8시간", nutrition: "철저", study: "보통", stress: "낮음" },
        match: { time: "90분", pos: "LW", play: "멀티골 및 수비 가담", feedback: "박스 안 침착성이 돋보임." },
        goal: { month: "스프린트 후 회복 속도 향상", task: "인터벌 트레이닝 2회 추가", feedback: "체력 안배 요망" },
        stats: { tech: 96, tactical: 90, phys: 92, mental: 98 }
    },
    { 
        name: "이강인", 
        dob: "2009.02.19",
        school: "KFA Middle School",
        allectaOne: "Allecta Youth A",
        basic: { age: "U18", grade: "고3", pos: "AM/RW", foot: "왼발", footRatingLeft: 5, footRatingRight: 3, team: "KFA FC", exp: "8년" },
        body: { height: "174cm", weight: "72kg", growth: "진행중", injury: "허벅지 미세통증", maturity: "중상" },
        tech: { dribble: 5, pass: 5, control: 5, heading: 3, defense1v1: 3 },
        tactic: { attacking: 4, space: 5, movement: 5, positioning: 3, understanding: 5 },
        phys: { speed: 4, agility: 5, explosiveness: 4, awareness: 5, balance: 5 },
        mental: { creativity: 5, aggressiveness: 4, confidence: 5, cooperation: 5, decision: 5 },
        life: { sleep: "7시간", nutrition: "우수", study: "우수", stress: "보통" },
        match: { time: "85분", pos: "AM", play: "키패스 5회, 공격 조율", feedback: "수비 전환 속도 보완 필요." },
        goal: { month: "수비 가담 빈도 및 효율성 증대", task: "트랜지션 훈련 집중", feedback: "수비 시 위치 선정 개선" },
        stats: { tech: 98, tactical: 92, phys: 80, mental: 90 }
    },
    { 
        name: "김민재", 
        dob: "2010.11.15",
        school: "KFA Middle School",
        allectaOne: "Allecta Youth B",
        basic: { age: "U15", grade: "중2", pos: "CB", foot: "오른발", footRatingLeft: 4, footRatingRight: 5, team: "KFA Youth Acad", exp: "4년" },
        body: { height: "178cm", weight: "68kg", growth: "폭풍성장기", injury: "없음", maturity: "중" },
        tech: { dribble: 3, pass: 4, control: 4, heading: 5, defense1v1: 5 },
        tactic: { attacking: 3, space: 4, movement: 4, positioning: 5, understanding: 5 },
        phys: { speed: 4, agility: 4, explosiveness: 5, awareness: 5, balance: 4 },
        mental: { creativity: 3, aggressiveness: 5, confidence: 5, cooperation: 5, decision: 4 },
        life: { sleep: "9시간", nutrition: "보통", study: "우수", stress: "낮음" },
        match: { time: "70분", pos: "CB", play: "대인 방어 및 제공권 장악", feedback: "성장기 체중 관리에 따른 순발력 유지가 관건." },
        goal: { month: "코어 근육 강화 및 빌드업 정확도 향상", task: "롱패스 정확도 훈련", feedback: "리더십 발휘 긍정적" },
        stats: { tech: 82, tactical: 85, phys: 88, mental: 92 }
    }
];

const library = [
    { 
        name: "4대2 로 rondo를 활용한 탈압박 훈련", 
        age: "U10, U12, U15",
        level: "중급",
        tags: ["Tactical", "Technical"], 
        purpose: "스캐닝, 패스 타이밍, 삼각형 형성", 
        personnel: "8~12명",
        equip: "콘, 조끼, 공",
        space: "15m x 15m",
        flow: "4대2 → 5대3 → 방향 전환 추가",
        points: "공 받기 전 고개 들기, 몸 방향 열기", 
        rules: "투터치 제한, 원터치 보너스, 압박자 추가",
        metrics: "패스 성공률, 전진 패스 횟수, 스캐닝 빈도",
        review: "탈압박 상황에서 어린 선수들의 상황 인식 속도가 눈에 띄게 개선됨."
    }
];

const physical = [
    { name: "햄스트링 강화 프로토콜", tags: ["Rehab"], method: "노르딕 햄스트링 컬 3세트, 싱글 레그 데드리프트 12회", metrics: "근지구력 측정, 통증 지수(VAS) 체크", warning: true },
    { name: "Plyometric Power Training", tags: ["Performance"], method: "박스 점프 10회, 버피 20회, 스프린트 30m 5회", metrics: "수직 점프 높이, 10m 스프린트 기록", warning: false }
];

const matches = [
    { 
        date: "2026.06.01", 
        team: "U13 / ○○FC", 
        formation: "4-3-3", 
        objective: "후방 빌드업 시도", 
        good: "센터백-6번 연결 성공", 
        bad: "압박 받을 때 측면 전환 부족", 
        feedback: "7번 선수: 공 받기 전 스캔 부족",
        next: "방향 전환 론도, 압박 회피 훈련" 
    }
];

// --- 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    renderPlayers();
    renderLibrary();
    renderPhysical();
    renderMatches();
    
    // 처음 접속 시 IDP 섹션(리스트 뷰)만 표시
    showSection('idp');
});
