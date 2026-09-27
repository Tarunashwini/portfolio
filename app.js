/* The Autonomous Pipeline · Tarun Ashwini portfolio */
(() => {
  'use strict';

  // Contact alerts open a prefilled compose window: Gmail for the email
  // receiver, a wa.me chat for the WhatsApp receiver. The visitor presses send.
  const EMAIL = 'tarun.aashwini@gmail.com';
  const GMAIL_COMPOSE = 'https://mail.google.com/mail/?view=cm&fs=1';
  const WHATSAPP = '917674012022'; // country code + number, digits only

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hashOf = (str, len = 5) => {
    let h = 2166136261;
    for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0').slice(0, len);
  };

  /* ==========================================================
     Telemetry log (tail -f)
     ========================================================== */
  const logEl = $('#log');
  let evCount = 0, evTotal = 0;
  const pad2 = n => String(n).padStart(2, '0');
  const clock = d => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  function log(level, msg) {
    evCount++; evTotal++;
    const line = document.createElement('div');
    line.className = 'log-line lv-' + level.toLowerCase();
    line.innerHTML = `<span class="lv">[${level}]</span> <span class="t">${clock(new Date())}</span> ${esc(msg)}`;
    logEl.appendChild(line);
    while (logEl.children.length > 120) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }
  const throttled = new Map();
  function logOnce(key, level, msg, ms = 2500) {
    const now = Date.now();
    if (now - (throttled.get(key) || 0) < ms) return;
    throttled.set(key, now);
    log(level, msg);
  }

  /* ==========================================================
     Status bar
     ========================================================== */
  const sbClock = $('#sbClock'), sbStage = $('#sbStage');
  function tickClock() {
    // IST is UTC+05:30 with no DST; shift the UTC clock so every visitor sees Hyderabad time
    const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    sbClock.textContent = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} IST`;
  }
  tickClock(); setInterval(tickClock, 1000);

  let podTotal = 0, podReady = 0;
  function updateCluster() {
    $('#sbPods').textContent = `${podReady}/${podTotal}`;
    const healthy = podReady === podTotal;
    $('#sbStatus').textContent = healthy ? 'Healthy' : 'Degraded';
    $('#sbHealth').classList.toggle('degraded', !healthy);
  }

  /* ==========================================================
     Hero terminal
     ========================================================== */
  const termLog = $('#termLog');
  const PS1 = '<span class="ps1"><span class="u">devops@portfolio</span>:<span class="p">~</span>$</span>';
  const d0 = new Date();
  $('#motdLast').textContent = `Last login: ${d0.toDateString()} ${clock(d0)} from 10.0.0.1 on pts/0`;

  function outLine(html, cls = '') {
    const el = document.createElement('div');
    el.className = 'tl ' + cls;
    el.innerHTML = html;
    termLog.appendChild(el);
    return el;
  }
  async function typeCmd(text) {
    const el = outLine(`${PS1}<span class="t-cmd"></span><span class="caret"></span>`);
    const t = el.querySelector('.t-cmd');
    if (reduce) t.textContent = text;
    else for (const ch of text) { t.textContent += ch; await sleep(26 + Math.random() * 42); }
    await sleep(320);
    el.querySelector('.caret').remove();
  }
  async function runPipelineLine() {
    const stages = ['lint', 'test', 'provision', 'deploy'];
    const el = outLine('');
    const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
    const state = stages.map(() => 'wait');
    const render = f => {
      el.innerHTML = '<span class="t-dim">remote:</span> ' + stages.map((s, i) => {
        if (state[i] === 'ok') return `<span class="stage-chip t-ok">✓ ${s}</span>`;
        if (state[i] === 'run') return `<span class="stage-chip t-accent">${frames[f % frames.length]} ${s}</span>`;
        return `<span class="stage-chip t-dim">· ${s}</span>`;
      }).join('');
    };
    let f = 0;
    for (let i = 0; i < stages.length; i++) {
      state[i] = 'run';
      for (let k = 0; k < (reduce ? 1 : 7); k++) { render(f++); await sleep(80); }
      state[i] = 'ok'; render(f);
    }
  }

  const SCRIPT = async () => {
    await sleep(500);
    await typeCmd('git commit -m "Deploy Portfolio v3.0"');
    outLine('[main <span class="t-hash">7c1e9a2</span>] Deploy Portfolio v3.0');
    outLine('<span class="t-dim"> 6 files changed: about, skills, experience, projects, telemetry, contact</span>');
    await sleep(350);
    await typeCmd('git push origin main');
    outLine('<span class="t-dim">Enumerating objects: 42, done.  Writing objects: 100% (42/42), done.</span>');
    await sleep(200);
    outLine('<span class="t-dim">remote:</span> webhook fired → pipeline <span class="t-accent">#3023</span> created for main');
    await runPipelineLine();
    outLine('<span class="t-dim">remote:</span> <span class="t-ok">environment/production healthy · replicas 3/3</span>');
    outLine('To github.com:Tarunashwini/portfolio.git');
    outLine('   <span class="t-hash">a41f0d3..7c1e9a2</span>  main -&gt; main');
    log('SUCCESS', 'pipeline #3023: main@7c1e9a2 rolled out to production');
    await sleep(200);
    outLine('<span class="t-dim">Type</span> <span class="t-accent">help</span> <span class="t-dim">to explore, or scroll to follow the pipeline.</span>');
    mountPrompt();
  };

  let termInput = null;
  const history = [];
  let hIdx = 0;
  function mountPrompt() {
    const line = outLine(`${PS1}<input id="termInput" aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false">`, 'term-input-line');
    termInput = line.querySelector('input');
    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = termInput.value.trim();
        termInput.value = '';
        if (v) { history.push(v); hIdx = history.length; }
        runCommand(v, line);
      } else if (e.key === 'ArrowUp' && history.length) {
        hIdx = Math.max(0, hIdx - 1); termInput.value = history[hIdx]; e.preventDefault();
      } else if (e.key === 'ArrowDown' && history.length) {
        hIdx = Math.min(history.length, hIdx + 1); termInput.value = history[hIdx] || '';
      }
    });
  }
  $('#terminal').addEventListener('click', e => {
    if (termInput && !e.target.closest('a,button')) termInput.focus({ preventScroll: true });
  });

  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  const COMMANDS = {
    help: () => [
      '<span class="t-accent">whoami</span>            who is running this cluster',
      '<span class="t-accent">kubectl get pods</span>  list skill pods',
      '<span class="t-accent">git log</span>           career history  → /experience',
      '<span class="t-accent">terraform apply</span>   projects        → /projects',
      '<span class="t-accent">cat resume.pdf</span>    open the résumé',
      '<span class="t-accent">contact</span>           open an alert   → /observe',
      '<span class="t-accent">clear</span>             clear the screen'
    ],
    whoami: () => ['Tarun Ashwini. DevOps Engineer at TECHWAVE Consulting, India.',
      '3+ years of CI/CD, DevSecOps, Kubernetes, Terraform and observability on AWS and Azure.'],
    'kubectl get pods': () => {
      const rows = $$('.pod').map(p => {
        const n = p.dataset.podname.padEnd(22, ' ');
        const st = p.querySelector('.pod-state em').textContent;
        return `${esc(n)} ${p.dataset.s ? '0/1' : '1/1'}   <span class="${p.dataset.s ? 't-err' : 't-ok'}">${st}</span>`;
      });
      return ['<span class="t-dim">NAME                   READY STATUS</span>', ...rows];
    },
    'git log': () => { setTimeout(() => go('experience'), 300); return ['<span class="t-dim">opening git log --graph …</span>']; },
    'terraform apply': () => { setTimeout(() => go('projects'), 300); return ['<span class="t-dim">Acquiring state lock… applying projects</span>']; },
    'cat resume.pdf': () => { window.open('Tarun_Ashwini.pdf', '_blank', 'noopener'); return ['<span class="t-dim">opening Tarun_Ashwini.pdf in a new tab</span>']; },
    contact: () => { setTimeout(() => go('observe'), 300); return ['<span class="t-dim">routing to alertmanager …</span>']; },
    'sudo hire-me': () => { setTimeout(() => go('observe'), 700); return ['<span class="t-ok">[sudo] permission granted.</span> Routing you to the contact form.']; }
  };
  const ALIASES = { ls: 'help', skills: 'kubectl get pods', experience: 'git log', projects: 'terraform apply', resume: 'cat resume.pdf', 'hire-me': 'sudo hire-me' };

  function runCommand(raw, promptLine) {
    const echo = document.createElement('div');
    echo.className = 'tl';
    echo.innerHTML = `${PS1}<span class="t-cmd">${esc(raw)}</span>`;
    termLog.insertBefore(echo, promptLine);
    if (!raw) return;
    const key = raw.toLowerCase().replace(/\s+/g, ' ');
    log('INFO', `terminal command: ${raw}`);
    if (key === 'clear') {
      [...termLog.children].forEach(c => { if (c !== promptLine) c.remove(); });
      return;
    }
    const fn = COMMANDS[key] || COMMANDS[ALIASES[key]];
    const lines = fn ? fn() : [`<span class="t-err">command not found: ${esc(raw)}</span>. Try <span class="t-accent">help</span>.`];
    lines.forEach(l => {
      const el = document.createElement('div');
      el.className = 'tl'; el.innerHTML = l;
      termLog.insertBefore(el, promptLine);
    });
  }

  /* ==========================================================
     Pipeline rail, stage gates, scan beam, webhook packet
     ========================================================== */
  const node = $('#commitNode'), fill = $('#railFill'), packet = $('#packet');
  const stagesEl = $('#railStages'), beam = $('#scanbeam');
  const gates = $$('.gate').map(g => {
    const m = document.createElement('div');
    m.className = 'rail-stage';
    m.innerHTML = `<span>${g.dataset.stage}</span>`;
    stagesEl.appendChild(m);
    return { el: g, marker: m, p: 1, done: false };
  });
  let progress = 0;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);

  function layoutRail() {
    const max = maxScroll();
    gates.forEach(g => {
      const top = g.el.getBoundingClientRect().top + scrollY - innerHeight * 0.72;
      g.p = clamp(top / max, 0, 1);
      g.marker.style.top = (g.p * 100) + '%';
    });
  }

  function sweep() {
    if (reduce) return;
    beam.classList.remove('sweep'); void beam.offsetWidth; beam.classList.add('sweep');
  }
  let gateQueue = Promise.resolve();
  function passGate(g) {
    g.done = true;
    gateQueue = gateQueue.then(async () => {
      const st = g.el.querySelector('.gate-status');
      g.el.classList.add('running');
      st.textContent = '[RUNNING]';
      log('INFO', `stage "${g.el.dataset.name}" started`);
      await sleep(650);
      g.el.classList.remove('running'); g.el.classList.add('passed');
      st.textContent = '[SUCCESS 200 OK]';
      sweep();
      log('SUCCESS', `stage "${g.el.dataset.name}" passed · build integrity verified`);
    });
  }

  let firstScroll = true;
  function onScroll() {
    progress = clamp(scrollY / maxScroll(), 0, 1);
    node.style.top = (progress * 100) + '%';
    fill.style.height = (progress * 100) + '%';
    gates.forEach(g => {
      const reached = progress >= g.p - 0.0005;
      g.marker.classList.toggle('reached', reached);
      if (reached && !g.done) passGate(g);
    });
    if (firstScroll && scrollY > 40) {
      firstScroll = false;
      firePacket(gates[0].p);
    }
    revealGraph();
    followCommit();
  }

  function firePacket(targetP, then) {
    if (reduce) { then && then(); return; }
    packet.style.transition = 'none';
    packet.style.top = (progress * 100) + '%';
    packet.classList.add('live');
    void packet.offsetWidth;
    packet.style.transition = 'top .85s cubic-bezier(.6,0,.25,1)';
    packet.style.top = (Math.max(targetP, progress) * 100) + '%';
    setTimeout(() => { packet.classList.remove('live'); then && then(); }, 880);
  }

  $('#viewWork').addEventListener('click', () => {
    const g = gates[3];
    log('INFO', 'webhook fired: View work → /projects');
    firstScroll = false;
    firePacket(g.p, () => go('projects'));
  });

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }, { passive: true });

  // which section is in view → status bar stage + log
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      sbStage.textContent = e.target.dataset.stage;
      logOnce('sec-' + e.target.id, 'INFO', `user initiated scroll event: /${e.target.id === 'top' ? '' : e.target.id}`, 4000);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ==========================================================
     Skills: Kubernetes pods with HPA and chaos
     ========================================================== */
  const POOLS = [
    { id: 'cloud', pods: [
      { name: 'AWS', r: [['Compute', 'EC2 · Auto Scaling · Load Balancing'], ['Network & data', 'VPC · Route 53 · S3 · RDS'], ['Ops & access', 'IAM · CloudWatch · SNS']] },
      { name: 'Azure', r: [['App hosting', 'Web Apps · Virtual Machines · AKS'], ['Data', 'Storage Accounts · Azure SQL'], ['AI & secrets', 'AI Foundry · Key Vault']] }
    ] },
    { id: 'ci-cd', pods: [
      { name: 'GitLab CI/CD', r: [['Built from scratch', 'build · test · security scan · image · approvals'], ['Environments', 'Dev → QA → higher environments']] },
      { name: 'Azure DevOps', r: [['Apps', 'React UI · Django backend'], ['Stages', 'lint · security checks · build · deploy to Dev, UAT, Prod']] },
      { name: 'GitHub Actions', r: [['Workflows', 'integration · tests · quality checks'], ['Releases', 'release workflows · deployments']] }
    ] },
    { id: 'devsecops', pods: [
      { name: 'SAST', r: [['In every pipeline', 'automated source-code security analysis'], ['Output', 'vulnerability detection & reporting']] },
      { name: 'Checkmarx', r: [['Gate', 'Checkmarx scans inside GitLab CI/CD'], ['Reporting', 'security reports per build']] },
      { name: 'Secure CI/CD', r: [['Guards', 'secret detection · code quality'], ['Practice', 'security scanning before every deploy']] }
    ] },
    { id: 'containers', pods: [
      { name: 'Docker', r: [['Dockerfiles', 'written & optimized for Angular, .NET, Python'], ['Local stacks', 'Docker Compose']] },
      { name: 'Kubernetes', r: [['Platforms', 'AKS · clusters on Azure VMs'], ['Operations', 'deployments · troubleshooting · scaling']] },
      { name: 'Helm', r: [['Releases', 'charts for environment-specific deploys'], ['Used on', 'data & app modernization program']] }
    ] },
    { id: 'automation', pods: [
      { name: 'Terraform', r: [['IaC', 'cloud infrastructure as code'], ['Flow', 'plan → review → apply']] },
      { name: 'Python', r: [['Automation', 'linting · production release reporting'], ['Runtime', 'troubleshooting Python & Django apps']] },
      { name: 'Bash', r: [['Ops scripts', 'source-code cherry-picking · deploy workflows']] }
    ] },
    { id: 'observability', pods: [
      { name: 'ELK Stack', r: [['Shippers', 'Filebeat · Metricbeat'], ['Pipeline', 'Logstash → Elasticsearch'], ['Covers', 'app logs · VM metrics · infra']] },
      { name: 'Grafana', r: [['Dashboards', 'application, VM and infrastructure monitoring']] },
      { name: 'Prometheus', r: [['Metrics', 'monitoring & troubleshooting workloads']] }
    ] }
  ];

  const poolsEl = $('#pools');
  POOLS.forEach(pool => {
    const el = document.createElement('div');
    el.className = 'pool';
    el.innerHTML = `<div class="pool-head"><span>node-pool/<b>${pool.id}</b></span><span>${pool.pods.length} pods</span></div><div class="pool-pods"></div>`;
    const wrap = el.querySelector('.pool-pods');
    pool.pods.forEach(p => {
      podTotal++; podReady++;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      const h = hashOf(slug);
      const pod = document.createElement('div');
      pod.className = 'pod';
      pod.tabIndex = 0;
      pod.dataset.podname = `${slug}-${h}`;
      pod.setAttribute('aria-label', `${p.name} pod. ${p.r.map(x => x[0] + ': ' + x[1]).join('. ')}`);
      pod.innerHTML = `
        <span class="pod-state"><i></i><em>Running</em></span>
        <span class="pod-name">${p.name}</span>
        <span class="pod-meta">ready <b class="rd">1/1</b> · restarts <b class="rs">0</b></span>
        <button class="chaos" type="button">Simulate chaos</button>
        <div class="hpa">
          <div class="hpa-head">hpa/${slug} scaled 1 → ${p.r.length} replica${p.r.length > 1 ? 's' : ''}</div>
          ${p.r.map((r, i) => `<div class="replica" style="--i:${i}"><span class="r-id">${slug}-${h}-r${i + 1} · Running</span><b>${r[0]}</b><span>${r[1]}</span></div>`).join('')}
        </div>`;
      let restarts = 0;
      const setState = (s, text, ready) => {
        if (s) pod.dataset.s = s; else delete pod.dataset.s;
        pod.querySelector('.pod-state em').textContent = text;
        pod.querySelector('.rd').textContent = ready;
      };
      const scaleLog = () => logOnce('hpa-' + slug, 'INFO', `hover detected on pod [${p.name}] · HPA scaled 1 → ${p.r.length}`);
      pod.addEventListener('pointerenter', () => {
        const r = pod.getBoundingClientRect();
        pod.classList.toggle('flip', r.left + 280 > innerWidth - 12);
        scaleLog();
      });
      pod.addEventListener('focus', scaleLog);
      pod.addEventListener('click', e => {
        if (e.target.closest('.chaos')) return;
        if (e.pointerType === 'mouse') return;
        const open = !pod.classList.contains('open');
        $$('.pod.open').forEach(x => x.classList.remove('open'));
        pod.classList.toggle('open', open);
        const r = pod.getBoundingClientRect();
        pod.classList.toggle('flip', r.left + 280 > innerWidth - 12);
      });
      pod.querySelector('.chaos').addEventListener('click', async e => {
        e.stopPropagation();
        if (pod.dataset.s) return;
        pod.classList.remove('open');
        podReady--; updateCluster();
        setState('err', 'Error · OOMKilled', '0/1');
        log('ERROR', `pod/${slug}-${h} terminated: OOMKilled (exit code 137)`);
        await sleep(800);
        restarts++; pod.querySelector('.rs').textContent = restarts;
        setState('err', 'CrashLoopBackOff', '0/1');
        log('WARN', `pod/${slug}-${h} CrashLoopBackOff · back-off restarting failed container (restarts: ${restarts})`);
        await sleep(1700);
        setState('warn', 'ContainerCreating', '0/1');
        log('INFO', `pod/${slug}-${h} pulling image, starting container`);
        await sleep(1100);
        setState('', 'Running', '1/1');
        podReady++; updateCluster();
        pod.classList.add('healed');
        setTimeout(() => pod.classList.remove('healed'), 1300);
        log('SUCCESS', `pod/${slug}-${h} readiness probe passed · Pod Ready: 1/1`);
      });
      wrap.appendChild(pod);
    });
    poolsEl.appendChild(el);
  });
  document.addEventListener('click', e => { if (!e.target.closest('.pod')) $$('.pod.open').forEach(x => x.classList.remove('open')); });
  $('#podSummary').textContent = `→ ${podTotal} pods Running across ${POOLS.length} node pools`;
  updateCluster();

  /* ==========================================================
     Experience: git log --graph
     ========================================================== */
  const TECH = {
    gitlab: 'GitLab CI', 'azure-devops': 'Azure DevOps', 'github-actions': 'GitHub Actions',
    docker: 'Docker', kubernetes: 'Kubernetes', helm: 'Helm', aws: 'AWS', azure: 'Azure',
    sast: 'SAST', checkmarx: 'Checkmarx', elk: 'ELK', grafana: 'Grafana', prometheus: 'Prometheus',
    python: 'Python', bash: 'Bash', 'ai-foundry': 'AI Foundry'
  };
  const BR = {
    main: 'var(--accent)',
    'feature/healthcare-platform': 'var(--pink)',
    'feature/ai-banking': 'var(--warn)',
    'feature/data-app-modernization': 'var(--violet)',
    'release/btech-2023': 'var(--ok)'
  };
  const HC = 'feature/healthcare-platform', AI = 'feature/ai-banking', DA = 'feature/data-app-modernization', ED = 'release/btech-2023';
  const COMMITS = [
    { lane: 0, br: 'main', hash: '7c1e9a2', refs: [['head', 'HEAD -> main']], msg: 'Software Engineer – DevOps · TECHWAVE Consulting India', date: 'Apr 2023 – present',
      body: ['Primary DevOps engineer across three client engagements: data & application modernization, an AI-powered banking app, and a healthcare platform.',
        'CI/CD, DevSecOps, containers, Kubernetes, Terraform and observability across AWS and Azure.'] },
    { lane: 0, br: 'main', hash: '3fb0c61', refs: [['tag', 'tag: best-performer']], msg: 'award: Best Performer · TECHWAVE Consulting',
      body: ['Recognized for proactive ownership, rapid learning, problem-solving, decision-making and contribution to successful project delivery.'] },
    { lane: 0, br: 'main', merge: HC, hash: 'e41b7d0', msg: `Merge branch '${HC}'` },
    { lane: 1, br: HC, hash: 'b92c4f1', msg: 'ops(aws): run EC2, S3, RDS, VPC, Route 53, CloudWatch, SNS, ASG & ELB', tech: ['aws', 'docker', 'kubernetes', 'prometheus', 'grafana', 'elk'],
      body: ['Managed AWS infrastructure: EC2, S3, RDS, IAM, VPC, Route 53, CloudWatch, SNS, Auto Scaling and Load Balancing.',
        'Deployed and managed containerized workloads on Docker and Kubernetes for scalable, reliable delivery.',
        'Monitoring and troubleshooting with Prometheus, Grafana and the ELK Stack.'] },
    { lane: 1, br: HC, hash: '5a0e3c8', msg: 'chore(automation): Python & Bash for lint, cherry-picks and release reports', tech: ['python', 'bash'],
      body: ['Automated linting, source-code cherry-picking, production release reporting and deployment-related workflows with Python and Bash.'] },
    { lane: 1, br: HC, hash: '0d7f21a', msg: 'ci: GitHub Actions for integration, tests, quality checks and releases', tech: ['github-actions'],
      body: ['Supported and enhanced a healthcare platform for electronic visit verification (EVV), patient care coordination, claims management and HIPAA-compliant operations.',
        'Implemented and managed GitHub Actions pipelines for code integration, testing, quality checks, release workflows and deployments.'] },
    { lane: 0, br: 'main', merge: AI, hash: 'c3e88b5', msg: `Merge branch '${AI}'` },
    { lane: 1, br: AI, hash: '91fd0e6', msg: 'feat(ai): Whisper voice-to-text + OpenAI reports via Azure AI Foundry', tech: ['azure', 'ai-foundry'],
      body: ['Supported deployment of an AI workflow: Whisper AI turns speech into text, and an OpenAI model hosted on Azure AI Foundry generates reports from customer loan requirements.'] },
    { lane: 1, br: AI, hash: '4e2a9b3', msg: 'infra(azure): Web Apps, Storage, AI Foundry, Key Vault, SQL Server & DBs', tech: ['azure', 'ai-foundry'],
      body: ['Provisioned and managed Azure Web Apps, Storage Accounts, Azure AI Foundry, Key Vault, Azure SQL Server and SQL Databases.'] },
    { lane: 1, br: AI, hash: 'a17c5d2', msg: 'ci: Azure DevOps pipelines for React UI + Django across Dev, UAT, Prod', tech: ['azure-devops', 'python'],
      body: ['Designed and implemented Azure DevOps CI/CD for the React UI and Django backend, with linting, security checks, builds and deployments to Dev, UAT and Production.'] },
    { lane: 0, br: 'main', merge: DA, hash: 'f5d0a44', msg: `Merge branch '${DA}'` },
    { lane: 1, br: DA, hash: '2b6e1f9', msg: 'feat(obs): centralized ELK + Grafana for app logs, VM metrics and infra', tech: ['elk', 'grafana', 'kubernetes', 'python'],
      body: ['Designed centralized observability: Filebeat, Logstash, Metricbeat, Elasticsearch and Grafana for application logs, VM metrics and infrastructure monitoring.',
        'Troubleshot CI/CD, Docker, Kubernetes, Python runtime and deployment issues; worked with developers on 12-factor practices and cloud-native deployment standards.'] },
    { lane: 1, br: DA, hash: '8c3d7a0', msg: 'build: Dockerfiles for Angular, .NET & Python → Helm on Kubernetes + Azure VMs', tech: ['docker', 'kubernetes', 'helm', 'azure'],
      body: ['Created and optimized Dockerfiles for Angular, .NET and Python services and deployed them on Azure VMs and Kubernetes using Helm.'] },
    { lane: 1, br: DA, hash: '6f41b2e', msg: 'sec: SAST + Checkmarx gates with vulnerability reporting', tech: ['sast', 'checkmarx', 'gitlab'],
      body: ['Integrated SAST and Checkmarx into CI/CD for automated source-code security analysis, vulnerability detection and security reporting.'] },
    { lane: 1, br: DA, hash: '3a9c0d7', msg: 'ci: GitLab pipelines from scratch: build, test, scan, image, approvals, deploy', tech: ['gitlab', 'docker'],
      body: ['Owned end-to-end DevOps as the primary DevOps engineer in the early project phase: GitLab repositories, CI/CD, containerization, infrastructure, deployment and monitoring.',
        'Built GitLab pipelines for build, testing, security validation, Docker image creation, approvals and environment-specific deployments across Dev, QA and higher environments.'] },
    { lane: 0, br: 'main', hash: '1e0b9f3', refs: [['tag', 'tag: v2023.04']], msg: 'feat: join TECHWAVE Consulting India as Software Engineer – DevOps', date: 'Apr 2023',
      body: ['Started as Software Engineer – DevOps at TECHWAVE Consulting India Pvt. Ltd.'] },
    { lane: 0, br: 'main', merge: ED, hash: 'd82a6c1', msg: `Merge branch '${ED}'`, date: '2023' },
    { lane: 1, br: ED, hash: '7b3f5e2', msg: 'release: B.Tech in Information Technology · CGPA 7.87', date: '2019 – 2023',
      body: ['Bachelor of Technology in Information Technology, JB Institute of Engineering and Technology. CGPA 7.87.'] },
    { lane: 0, br: 'main', hash: 'a0c1e57', msg: 'Initial commit: JB Institute of Engineering and Technology', date: '2019',
      body: ['Began a B.Tech in Information Technology.'] }
  ];
  // merges inherit their branch's tech + a summary body
  COMMITS.forEach(c => {
    if (!c.merge) return;
    const kids = COMMITS.filter(k => k.br === c.merge);
    c.tech = [...new Set(kids.flatMap(k => k.tech || []))];
    c.body = kids.map(k => k.msg);
  });

  const graphEl = $('#graph'), svg = $('#graphSvg'), showEl = $('#show');
  const rows = COMMITS.map((c, i) => {
    const li = document.createElement('li');
    li.className = 'commit' + (c.merge ? ' merge' : '');
    li.tabIndex = 0;
    li.dataset.i = i;
    li.dataset.tech = (c.tech || []).join(' ');
    li.style.setProperty('--lane', c.lane);
    li.style.setProperty('--c', BR[c.merge || c.br] && c.lane === 0 ? BR.main : BR[c.br]);
    const refs = c.refs ? ` <span class="refs">(${c.refs.map(([t, r]) => `<span class="ref ${t}">${esc(r)}</span>`).join(', ')})</span>` : '';
    li.innerHTML = `
      <span class="dot"></span>
      <div class="c-line"><span class="c-hash">${c.hash}</span>${refs} <span class="c-msg">${esc(c.msg)}</span></div>
      <div class="c-meta">${c.date ? `<span>${c.date}</span>` : ''}<span class="c-branch" style="--c:${BR[c.merge || c.br]}">${c.merge ? 'merge → main' : c.br}</span>${(c.tech || []).map(t => `<button type="button" class="chip" data-t="${t}">${TECH[t]}</button>`).join('')}</div>
      ${c.body ? `<ul class="c-body">${c.body.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`;
    li.querySelector('.c-branch').style.color = BR[c.merge || c.br];
    graphEl.appendChild(li);
    return li;
  });

  let pinnedUntil = 0, activeRow = -1;
  function showCommit(i) {
    if (i === activeRow) return;
    activeRow = i;
    rows.forEach((r, k) => r.classList.toggle('active', k === i));
    const c = COMMITS[i];
    const full = c.hash + hashOf(c.msg, 8) + hashOf(c.hash, 8) + hashOf(c.br, 8) + hashOf(c.hash + c.msg, 8);
    showEl.innerHTML = `
      <div class="term-bar"><span class="lights"><i></i><i></i><i></i></span><span class="term-title">git show ${c.hash}</span></div>
      <div class="show-body">
        <div class="row"><span>commit</span><span class="t-hash">${full.slice(0, 40)}</span></div>
        ${c.merge ? `<div class="row"><span>Merge:</span><span>${COMMITS[i + 1].hash} ${COMMITS.find((k, j) => j > i && k.lane === 0 && k.br === 'main')?.hash || ''}</span></div>` : ''}
        <div class="row"><span>Author:</span><span>Tarun Ashwini &lt;${EMAIL}&gt;</span></div>
        ${c.date ? `<div class="row"><span>Date:</span><span>${c.date}</span></div>` : ''}
        <div class="row"><span>Branch:</span><span style="color:${BR[c.merge || c.br]}">${c.merge || c.br}</span></div>
        <div class="show-msg">${esc(c.msg)}</div>
        ${c.body ? `<ul class="show-diff">${c.body.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        ${c.tech && c.tech.length ? `<div class="show-tech">${c.tech.map(t => `<button type="button" class="chip" data-t="${t}">${TECH[t]}</button>`).join('')}</div>` : ''}
      </div>`;
  }
  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', () => { pinnedUntil = Date.now() + 2500; showCommit(i); logOnce('commit-' + i, 'INFO', `commit ${COMMITS[i].hash} inspected`, 5000); });
    r.addEventListener('focus', () => { pinnedUntil = Date.now() + 2500; showCommit(i); });
    r.addEventListener('click', e => {
      if (e.target.closest('.chip')) return;
      pinnedUntil = Date.now() + 4000; showCommit(i);
      r.classList.toggle('open');
    });
  });
  showCommit(0);

  function followCommit() {
    if (Date.now() < pinnedUntil) return;
    const box = graphEl.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) return;
    const y = innerHeight * 0.42;
    let best = 0, bestD = Infinity;
    rows.forEach((r, i) => {
      const rb = r.getBoundingClientRect();
      const d = Math.abs(rb.top + 20 - y);
      if (d < bestD) { bestD = d; best = i; }
    });
    showCommit(best);
  }

  // draw lanes from real node positions
  let graphH = 0;
  function drawGraph() {
    const box = graphEl.getBoundingClientRect();
    const pts = rows.map(r => {
      const d = r.querySelector('.dot').getBoundingClientRect();
      return { x: d.left - box.left + d.width / 2, y: d.top - box.top + d.height / 2 };
    });
    graphH = box.height;
    const paths = [];
    const mains = COMMITS.map((c, i) => c.lane === 0 ? i : -1).filter(i => i >= 0);
    paths.push({ c: BR.main, d: `M${pts[mains[0]].x} ${pts[mains[0]].y} L${pts[mains[0]].x} ${pts[mains[mains.length - 1]].y}` });
    Object.keys(BR).filter(b => b !== 'main').forEach(br => {
      const idx = COMMITS.map((c, i) => c.br === br ? i : -1).filter(i => i >= 0);
      if (!idx.length) return;
      const m = COMMITS.findIndex(c => c.merge === br);
      const top = idx[0], bot = idx[idx.length - 1];
      const f = COMMITS.findIndex((c, i) => i > bot && c.lane === 0);
      const x0 = pts[m].x, ym = pts[m].y, x1 = pts[top].x, yf = pts[f].y;
      paths.push({ c: BR[br], d: `M${x0} ${ym} C${x0} ${ym + 18},${x1} ${ym + 8},${x1} ${ym + 28} L${x1} ${yf - 28} C${x1} ${yf - 8},${x0} ${yf - 18},${x0} ${yf}` });
    });
    const p = paths.map(o => `<path d="${o.d}" style="stroke:${o.c};color:${o.c}"/>`).join('');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `<defs><clipPath id="gclip"><rect id="gclipRect" x="-20" y="0" width="${box.width + 40}" height="0"/></clipPath></defs>
      <g class="base">${p}</g><g class="lit" clip-path="url(#gclip)">${p}</g>`;
    revealGraph();
  }
  function revealGraph() {
    const rect = $('#gclipRect');
    if (!rect) return;
    const top = graphEl.getBoundingClientRect().top;
    const y = clamp(innerHeight * 0.62 - top, 0, graphH);
    rect.setAttribute('height', y);
    rows.forEach(r => r.classList.toggle('lit', r.offsetTop + 21 <= y));
  }
  new ResizeObserver(() => { drawGraph(); layoutRail(); onScroll(); }).observe(graphEl);

  // cherry-pick: tech legend + in-row chips
  const pickBar = $('#pickBar');
  const used = [...new Set(COMMITS.flatMap(c => c.tech || []))];
  used.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.t = t; b.textContent = TECH[t];
    pickBar.appendChild(b);
  });
  let locked = null;
  function pick(t) {
    graphEl.classList.toggle('picking', !!t);
    let n = 0;
    rows.forEach(r => {
      const on = !!t && r.dataset.tech.split(' ').includes(t);
      r.classList.toggle('picked', on);
      if (on) n++;
    });
    $$('.chip[data-t]').forEach(c => c.classList.toggle('on', !!t && c.dataset.t === t));
    if (t) logOnce('pick-' + t, 'INFO', `git cherry-pick --tech=${TECH[t]} → ${n} commits`);
  }
  document.addEventListener('pointerover', e => {
    const c = e.target.closest('.chip[data-t]');
    if (c && !locked) pick(c.dataset.t);
  });
  document.addEventListener('pointerout', e => {
    const c = e.target.closest('.chip[data-t]');
    if (c && !locked && !c.contains(e.relatedTarget)) pick(null);
  });
  document.addEventListener('focusin', e => { const c = e.target.closest('.chip[data-t]'); if (c && !locked) pick(c.dataset.t); });
  document.addEventListener('focusout', e => { const c = e.target.closest('.chip[data-t]'); if (c && !locked) pick(null); });
  document.addEventListener('click', e => {
    const c = e.target.closest('.chip[data-t]');
    if (!c) return;
    locked = locked === c.dataset.t ? null : c.dataset.t;
    pick(locked);
  });

  /* ==========================================================
     Projects: terraform plan → apply, isometric infra
     ========================================================== */
  const KIND = {
    ci:      ['#A48BFF', '#7461CF', '#5A4AA6'],
    compute: ['#46C8E6', '#2C93AD', '#20718A'],
    data:    ['#F2B544', '#BE8930', '#916724'],
    net:     ['#4ADE95', '#31A56E', '#237D53'],
    sec:     ['#FF7A7A', '#C9514F', '#9A3D3C'],
    obs:     ['#F27FB6', '#BB5A8A', '#8F4469'],
    ai:      ['#C7B8FF', '#9483DD', '#7362B6']
  };
  const PROJECTS = [
    {
      id: 'healthcare', mod: 'module.healthcare_platform', cloud: 'aws', title: 'Healthcare Platform',
      sum: 'GitHub Actions delivery and AWS operations for a HIPAA-compliant platform covering electronic visit verification, patient care coordination and claims management.',
      points: ['GitHub Actions for integration, tests, quality checks and releases', 'Ran EC2, S3, RDS, IAM, VPC, Route 53, CloudWatch, SNS, Auto Scaling and load balancing', 'Docker and Kubernetes workloads, monitored with Prometheus, Grafana and ELK'],
      tech: ['GitHub Actions', 'AWS', 'Docker', 'Kubernetes', 'Prometheus', 'Grafana', 'Python', 'Bash'],
      plan: ['aws_route53_record.app', 'aws_lb.app', 'aws_autoscaling_group.web  # az-a, az-b', 'aws_db_instance.primary', 'aws_s3_bucket.documents', 'aws_cloudwatch_metric_alarm.health', 'aws_sns_topic.alerts'],
      nodes: [
        { id: 'za', kind: 'zone', x: 3.4, y: -0.4, w: 2.2, d: 2.2, label: 'AZ-a' },
        { id: 'zb', kind: 'zone', x: 3.4, y: 2.9, w: 2.2, d: 2.2, label: 'AZ-b' },
        { id: 'r53', kind: 'net', x: 0, y: 2, h: 18, label: 'Route 53' },
        { id: 'alb', kind: 'net', x: 1.8, y: 2, h: 26, label: 'ALB' },
        { id: 'ec2a', kind: 'compute', x: 4, y: 0.2, h: 42, label: 'EC2 · ASG' },
        { id: 'ec2b', kind: 'compute', x: 4, y: 3.5, h: 42, label: 'EC2 · ASG' },
        { id: 'rds', kind: 'data', x: 6.7, y: 0.8, h: 30, label: 'RDS' },
        { id: 's3', kind: 'data', x: 6.7, y: 3.6, h: 22, label: 'S3' },
        { id: 'cw', kind: 'obs', x: 1.6, y: 4.6, h: 16, label: 'CloudWatch' }
      ],
      routes: [['r53', 'alb', 'ec2a', 'rds'], ['r53', 'alb', 'ec2b', 'rds'], ['r53', 'alb', 'ec2a', 's3'], ['r53', 'alb', 'ec2b', 's3']],
      deploy: [['cw', 'alb']],
      split: ['ec2a', 'ec2b'], splitLabels: ['az-a', 'az-b']
    },
    {
      id: 'banking', mod: 'module.ai_banking', cloud: 'azure', title: 'AI-Powered Banking Application',
      sum: 'Azure DevOps delivery for a React and Django app that turns spoken customer loan requirements into reports using Whisper and an OpenAI model on Azure AI Foundry.',
      points: ['Azure DevOps pipelines with linting, security checks, builds and deploys to Dev, UAT and Production', 'Provisioned Web Apps, Storage Accounts, AI Foundry, Key Vault, Azure SQL Server and databases', 'Supported the Whisper voice-to-text and report-generation workflow'],
      tech: ['Azure DevOps', 'Azure', 'AI Foundry', 'Key Vault', 'React', 'Django'],
      plan: ['azurerm_linux_web_app.react_ui', 'azurerm_linux_web_app.django_api', 'azurerm_ai_foundry.reports  # whisper + openai', 'azurerm_key_vault.secrets', 'azurerm_mssql_database.core', 'azurerm_storage_account.docs'],
      nodes: [
        { id: 'ado', kind: 'ci', x: 0, y: 2, h: 24, label: 'Azure DevOps' },
        { id: 'react', kind: 'compute', x: 2.3, y: 0.5, h: 30, label: 'React UI' },
        { id: 'django', kind: 'compute', x: 2.3, y: 3.4, h: 36, label: 'Django API' },
        { id: 'foundry', kind: 'ai', x: 5, y: 0.2, w: 1.3, d: 1.3, h: 40, label: 'AI Foundry' },
        { id: 'kv', kind: 'sec', x: 5, y: 2.6, h: 20, label: 'Key Vault' },
        { id: 'sql', kind: 'data', x: 5, y: 4.6, h: 28, label: 'Azure SQL' },
        { id: 'st', kind: 'data', x: 7.4, y: 2.4, h: 22, label: 'Storage' }
      ],
      routes: [['react', 'django', 'foundry'], ['react', 'django', 'sql'], ['react', 'django', 'kv'], ['react', 'django', 'foundry', 'st']],
      deploy: [['ado', 'react'], ['ado', 'django']]
    },
    {
      id: 'modernization', mod: 'module.data_app_modernization', cloud: 'azure + k8s', title: 'Data & Application Modernization',
      sum: 'Primary DevOps engineer from the first day: repositories, pipelines, security gates, containers, deployments and monitoring, all built from scratch.',
      points: ['GitLab CI/CD from scratch: build, test, security validation, images, approvals, env deploys', 'SAST and Checkmarx gates with vulnerability reporting', 'Dockerfiles for Angular, .NET and Python, shipped with Helm to Kubernetes and Azure VMs', 'Centralized ELK and Grafana for app logs, VM metrics and infrastructure'],
      tech: ['GitLab CI/CD', 'SAST', 'Checkmarx', 'Docker', 'Helm', 'Kubernetes', 'ELK', 'Grafana'],
      plan: ['gitlab_project.apps', 'gitlab_project_variable.checkmarx  (sensitive)', 'azurerm_linux_virtual_machine.app', 'helm_release.services', 'helm_release.elk_stack', 'grafana_dashboard.infra'],
      nodes: [
        { id: 'gl', kind: 'ci', x: 0, y: 2, h: 26, label: 'GitLab CI' },
        { id: 'cx', kind: 'sec', x: 2.1, y: 0.3, h: 20, label: 'Checkmarx' },
        { id: 'dk', kind: 'ci', x: 2.1, y: 3.5, h: 22, label: 'Docker' },
        { id: 'k8s', kind: 'compute', x: 4.4, y: 0.6, w: 1.5, d: 1.5, h: 46, label: 'K8s · Helm' },
        { id: 'vm', kind: 'compute', x: 4.6, y: 3.9, h: 32, label: 'Azure VM' },
        { id: 'elk', kind: 'obs', x: 7.2, y: 1.2, h: 30, label: 'ELK' },
        { id: 'gf', kind: 'obs', x: 7.2, y: 3.8, h: 24, label: 'Grafana' }
      ],
      routes: [['gl', 'cx'], ['gl', 'dk', 'k8s', 'elk', 'gf'], ['gl', 'dk', 'vm', 'elk', 'gf']],
      deploy: []
    }
  ];

  const TW = 56, TH = 28;
  const iso = (x, y, z) => [(x - y) * TW / 2, (x + y) * TH / 2 - z];
  const pt = p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const polyStr = arr => arr.map(pt).join(' ');

  function buildIso(P) {
    const byId = {};
    P.nodes.forEach(n => { n.w = n.w || 1; n.d = n.d || 1; n.h = n.h || 0; byId[n.id] = n; });
    const center = (n, z = 5) => iso(n.x + n.w / 2, n.y + n.d / 2, z);
    const all = [];
    const faces = n => {
      const { x, y, w, d, h } = n;
      return {
        top: [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)],
        left: [iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)],
        right: [iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)]
      };
    };
    P.nodes.forEach(n => { const f = faces(n); all.push(...f.top, ...f.left, ...f.right); });
    const minX = Math.min(...all.map(p => p[0])) - 46, maxX = Math.max(...all.map(p => p[0])) + 46;
    const minY = Math.min(...all.map(p => p[1])) - 26, maxY = Math.max(...all.map(p => p[1])) + 16;

    const edgeSet = new Set();
    P.routes.forEach(r => r.slice(1).forEach((b, i) => edgeSet.add(r[i] + '>' + b)));
    let edges = '';
    edgeSet.forEach(k => { const [a, b] = k.split('>'); edges += `<line class="edge" x1="${center(byId[a])[0]}" y1="${center(byId[a])[1]}" x2="${center(byId[b])[0]}" y2="${center(byId[b])[1]}"/>`; });
    P.deploy.forEach(([a, b]) => { edges += `<line class="edge deploy" x1="${center(byId[a])[0]}" y1="${center(byId[a])[1]}" x2="${center(byId[b])[0]}" y2="${center(byId[b])[1]}"/>`; });

    const sorted = [...P.nodes].sort((a, b) => (a.kind === 'zone' ? -1 : 0) - (b.kind === 'zone' ? -1 : 0) || (a.x + a.y) - (b.x + b.y));
    let zones = '', wires = '', solids = '', labels = '';
    let k = 0;
    sorted.forEach(n => {
      const f = faces(n);
      if (n.kind === 'zone') {
        const lp = iso(n.x + 0.12, n.y + n.d - 0.12, 0);
        zones += `<g class="zone"><polygon points="${polyStr(f.top)}"/><text x="${lp[0] + 4}" y="${lp[1] - 4}">${n.label}</text></g>`;
        return;
      }
      const c = KIND[n.kind];
      wires += `<polygon points="${polyStr(f.top)}"/><polygon points="${polyStr(f.left)}"/><polygon points="${polyStr(f.right)}"/>`;
      solids += `<g class="solid" style="--d:${k++ * 110}ms">
        <polygon points="${polyStr(f.left)}" fill="${c[1]}"/>
        <polygon points="${polyStr(f.right)}" fill="${c[2]}"/>
        <polygon points="${polyStr(f.top)}" fill="${c[0]}"/></g>`;
      const lp = iso(n.x + n.w / 2, n.y + n.d / 2, n.h);
      labels += `<text class="lbl" x="${lp[0]}" y="${lp[1] - 14}" text-anchor="middle">${n.label}</text>`;
    });
    const svgEl = `<svg class="iso" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" role="img" aria-label="${esc(P.title)} architecture sketch">
      ${zones}<g>${edges}</g><g class="wire">${wires}</g>${solids}<g>${labels}</g><g class="pkts"></g></svg>`;
    return { svgEl, byId, center };
  }

  const projList = $('#projectList');
  PROJECTS.forEach(P => {
    const { svgEl, byId, center } = buildIso(P);
    const card = document.createElement('article');
    card.className = 'proj';
    card.innerHTML = `
      <div class="proj-info">
        <p class="proj-mod"><b>${P.mod}</b> · provider: ${P.cloud}</p>
        <h3>${P.title}</h3>
        <p class="proj-sum">${P.sum}</p>
        <ul>${P.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="chips">${P.tech.map(t => `<span class="chip">${t}</span>`).join('')}</div>
        <div class="plan" aria-label="terraform plan">
          <div class="t-dim">$ terraform plan</div>
          ${P.plan.map(r => `<div class="pl"><span class="op">+</span> ${esc(r)}<span class="st"></span></div>`).join('')}
          <div class="sum">Plan: ${P.plan.length} to add, 0 to change, 0 to destroy.</div>
        </div>
      </div>
      <div class="proj-vis" tabindex="0" aria-label="Architecture diagram. Hover or focus to simulate traffic.">
        ${svgEl}
        <div class="vis-foot"><span class="vis-state">state: planned</span><span class="readout">hover to route traffic</span></div>
      </div>`;
    projList.appendChild(card);

    // apply when the card reaches mid-screen
    let applied = false;
    const io = new IntersectionObserver(async ents => {
      if (!ents[0].isIntersecting || applied) return;
      applied = true; io.disconnect();
      card.classList.add('scanning');
      log('INFO', `terraform apply ${P.mod} (${P.plan.length} resources)`);
      await sleep(450);
      card.classList.add('applied');
      $('.vis-state', card).textContent = 'state: applying…';
      const lines = $$('.pl', card);
      for (const [i, l] of lines.entries()) {
        await sleep(160);
        l.classList.add('done');
        l.querySelector('.st').textContent = `created [${(0.8 + i * 0.6).toFixed(1)}s]`;
      }
      $('.sum', card).textContent = `Apply complete! Resources: ${P.plan.length} added, 0 changed, 0 destroyed.`;
      $('.vis-state', card).textContent = 'state: applied';
      log('SUCCESS', `${P.mod}: apply complete, ${P.plan.length} added`);
      setTimeout(() => card.classList.remove('scanning'), 1200);
    }, { rootMargin: '-35% 0px -35% 0px' });
    io.observe(card);

    // traffic routing particles
    const vis = $('.proj-vis', card), layer = $('.pkts', card), readout = $('.readout', card);
    let running = false, raf = 0, lastSpawn = 0, rr = 0, served = 0;
    const counts = {};
    const particles = [];
    function spawn(now) {
      const route = P.routes[rr++ % P.routes.length];
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', 3.2); c.setAttribute('class', 'pkt');
      layer.appendChild(c);
      particles.push({ el: c, route, seg: 0, t0: now });
    }
    function frame(now) {
      if (running && now - lastSpawn > 170) { spawn(now); lastSpawn = now; }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const segDur = 420;
        let u = (now - p.t0) / segDur;
        if (u >= 1) {
          p.seg++; p.t0 = now; u = 0;
          const hit = p.route[p.seg];
          if (hit) counts[hit] = (counts[hit] || 0) + 1;
          if (p.seg >= p.route.length - 1) { p.el.remove(); particles.splice(i, 1); served++; continue; }
        }
        const a = center(byId[p.route[p.seg]], 6), b = center(byId[p.route[p.seg + 1]], 6);
        p.el.setAttribute('cx', a[0] + (b[0] - a[0]) * u);
        p.el.setAttribute('cy', a[1] + (b[1] - a[1]) * u);
      }
      if (P.split) readout.textContent = `requests ${served} · ${P.splitLabels[0]} ${counts[P.split[0]] || 0} / ${P.splitLabels[1]} ${counts[P.split[1]] || 0}`;
      else readout.textContent = `requests routed: ${served}`;
      if (running || particles.length) raf = requestAnimationFrame(frame);
      else raf = 0;
    }
    function start() {
      if (reduce || running) return;
      running = true;
      logOnce('traffic-' + P.id, 'INFO', `traffic routed through ${P.title}${P.split ? ' · load balanced across 2 AZs' : ''}`);
      if (!raf) raf = requestAnimationFrame(frame);
    }
    const stop = () => { running = false; };
    vis.addEventListener('pointerenter', start);
    vis.addEventListener('pointerleave', stop);
    vis.addEventListener('focus', start);
    vis.addEventListener('blur', stop);
  });

  /* ==========================================================
     Observability: tenure, gauge, live sparkline
     ========================================================== */
  const START = new Date(2023, 3, 1, 9, 0, 0);
  function tickTenure() {
    const now = new Date();
    let y = now.getFullYear() - START.getFullYear();
    let m = now.getMonth() - START.getMonth();
    let d = now.getDate() - START.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    $('#tenure').textContent = `${y}y ${m}m ${d}d`;
    $('#tenureClock').textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())} and counting`;
  }
  tickTenure(); setInterval(tickTenure, 1000);

  (function gauge() {
    const g = $('#gauge');
    const cx = 100, cy = 100, r = 74, a0 = -210, a1 = 30; // 240° sweep
    const pol = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const [sx, sy] = pol(a0), [ex, ey] = pol(a1);
    const arc = `M${sx.toFixed(1)} ${sy.toFixed(1)} A${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    const len = 2 * Math.PI * r * (240 / 360);
    const val = 7.87 / 10;
    const tick = (v, anchor) => { const [x, y] = [cx + (r + 16) * Math.cos((a0 + 240 * v) * Math.PI / 180), cy + (r + 16) * Math.sin((a0 + 240 * v) * Math.PI / 180)]; return `<text class="g-tick" x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}">${v * 10}</text>`; };
    g.setAttribute('viewBox', '0 0 200 150');
    g.innerHTML = `<path class="g-track" d="${arc}"/>
      <path class="g-val" id="gVal" d="${arc}" stroke-dasharray="${len}" stroke-dashoffset="${len}"/>
      <text class="g-num" x="100" y="108" text-anchor="middle">7.87</text>
      ${tick(0, 'end')}${tick(0.5, 'middle')}${tick(1, 'start')}`;
    const v = $('#gVal');
    const set = () => v.setAttribute('stroke-dashoffset', (len * (1 - val)).toFixed(1));
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { set(); io.disconnect(); } });
    io.observe(g);
  })();

  // live sparkline of the visitor's own interactions
  const cv = $('#spark'), ctx = cv.getContext('2d');
  const series = new Array(60).fill(0);
  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cv.width = cv.clientWidth * dpr; cv.height = 90 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  ['pointermove', 'keydown', 'wheel', 'touchmove'].forEach(t => addEventListener(t, () => { evCount += t === 'pointermove' ? 0.05 : 0.5; }, { passive: true }));
  let pulse = 0;
  setInterval(() => {
    series.push(Math.round(evCount * 10) / 10); series.shift();
    $('#evNow').textContent = Math.round(evCount);
    evCount = 0;
    $('#evTotal').textContent = evTotal;
  }, 1000);
  function drawSpark() {
    const w = cv.clientWidth, h = 90, top = 8, bot = h - 14;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(4, ...series);
    // grid
    ctx.strokeStyle = 'rgba(70,200,230,.08)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { const y = top + (bot - top) * i / 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = '#4E6070'; ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`${Math.ceil(max)}/s`, 2, top + 9); ctx.fillText('60s ago', 2, h - 2); ctx.fillText('now', w - 22, h - 2);
    const xs = i => (i / (series.length - 1)) * (w - 8);
    const ys = v => bot - (v / max) * (bot - top);
    const grad = ctx.createLinearGradient(0, top, 0, bot);
    grad.addColorStop(0, 'rgba(74,222,149,.35)'); grad.addColorStop(1, 'rgba(74,222,149,0)');
    ctx.beginPath(); ctx.moveTo(0, bot);
    series.forEach((v, i) => ctx.lineTo(xs(i), ys(v)));
    ctx.lineTo(xs(series.length - 1), bot); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); series.forEach((v, i) => i ? ctx.lineTo(xs(i), ys(v)) : ctx.moveTo(xs(i), ys(v)));
    ctx.strokeStyle = '#4ADE95'; ctx.lineWidth = 1.6; ctx.shadowColor = '#4ADE95'; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
    const ex = xs(series.length - 1), ey = ys(series[series.length - 1]);
    pulse = (pulse + 0.03) % 1;
    ctx.beginPath(); ctx.arc(ex, ey, 3 + pulse * 9, 0, Math.PI * 2); ctx.strokeStyle = `rgba(74,222,149,${1 - pulse})`; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fillStyle = '#DFFFEF'; ctx.fill();
    if (!reduce) requestAnimationFrame(drawSpark);
  }
  drawSpark();
  if (reduce) setInterval(drawSpark, 1000);

  /* ==========================================================
     Alertmanager contact form
     ========================================================== */
  const form = $('#alertForm'), afState = $('#afState'), afMsg = $('#afMsg'), fireBtn = $('#fireBtn'), whDot = $('#whDot');
  const fRecv = $('#fRecv'), whRecv = $('#whRecv');

  function syncReceiver() { whRecv.textContent = `receiver: ${fRecv.value}`; }
  fRecv.addEventListener('change', syncReceiver);
  syncReceiver();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#fName'), email = $('#fEmail'), msg = $('#fMsg'), sev = $('#fSev').value;
    const recv = fRecv.value, wa = recv === 'whatsapp';
    const bad = [];
    [name, msg].forEach(f => f.classList.toggle('bad', !f.value.trim()));
    if (!name.value.trim()) bad.push('your name');
    // reply_to is optional: the visitor sends from their own Gmail or WhatsApp account.
    const emailVal = email ? email.value.trim() : '';
    const emailOk = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (email) email.classList.toggle('bad', !emailOk);
    if (!emailOk) bad.push('a valid reply-to email');
    if (!msg.value.trim()) bad.push('a message');
    if (bad.length) {
      afMsg.className = 'af-msg err';
      afMsg.textContent = `Alert rejected: add ${bad.join(', ')}, then fire again.`;
      log('WARN', 'alertmanager rejected alert: missing labels');
      return;
    }

    const p = { name: name.value.trim(), email: emailVal, msg: msg.value.trim(), sev };
    const subject = `[${sev.toUpperCase()}] Let's connect: ${p.name}`;
    const sig = `- ${p.name}${p.email ? ` (${p.email})` : ''}`;
    const body = `${p.msg}\n\n${sig}`;
    const gmailHref = `${GMAIL_COMPOSE}&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const waText = `*[FIRING] LetsConnect* severity=${sev}\n\n${p.msg}\n\n${sig}`;
    const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`;
    const href = wa ? waHref : gmailHref;

    // Open inside the click gesture, otherwise the browser blocks the popup.
    window.open(href, '_blank', 'noopener');

    fireBtn.disabled = true;
    form.classList.remove('resolved'); form.classList.add('firing');
    afState.textContent = 'FIRING';
    afMsg.className = 'af-msg'; afMsg.textContent = `[FIRING] LetsConnect severity=${sev} receiver=${recv}`;
    log('ERROR', `[FIRING] alert LetsConnect severity=${sev} receiver=${recv} from ${p.name}`);
    whDot.classList.remove('go'); void whDot.offsetWidth; whDot.classList.add('go');

    await sleep(1200);
    fireBtn.disabled = false;
    form.classList.remove('firing'); form.classList.add('resolved');
    afState.textContent = 'RESOLVED';
    afMsg.className = 'af-msg ok';
    afMsg.innerHTML = wa
      ? `[RESOLVED] Alert routed to WhatsApp. Press send in the chat that opened. <a href="${esc(waHref)}" target="_blank" rel="noopener">Open WhatsApp</a> if nothing appeared.`
      : `[RESOLVED] Alert routed to Gmail. Press send in the draft that opened. <a href="${esc(gmailHref)}" target="_blank" rel="noopener">Open Gmail</a> if nothing appeared, or use <a href="${esc(mailHref)}">another mail app</a>.`;
    log('SUCCESS', `[RESOLVED] alert routed to receiver: ${recv}`);
  });

  /* ==========================================================
     Boot
     ========================================================== */
  log('INFO', 'visitor session started · tail -f attached');
  log('INFO', `cluster ready · ${podTotal} pods scheduled across ${POOLS.length} node pools`);
  SCRIPT();
  const relayout = () => { drawGraph(); layoutRail(); onScroll(); };
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  relayout();
})();
