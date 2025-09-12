// views/documentation.js

const getDocumentationHTML = (req) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GitHub Commit Badge API | Professional Badge Generator</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-900: #0f172a; --primary-800: #1e293b; --primary-700: #334155;
                --primary-600: #475569; --primary-500: #64748b; --primary-400: #94a3b8;
                --primary-300: #cbd5e1; --primary-200: #e2e8f0; --primary-100: #f1f5f9;
                --primary-50: #f8fafc; --accent-500: #3b82f6; --accent-600: #2563eb;
                --font-sans: 'Inter', sans-serif; --font-mono: 'JetBrains Mono', monospace;
                --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                --border-radius: 8px; --border-radius-lg: 12px; --border-radius-xl: 16px;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html { scroll-behavior: smooth; }
            body { font-family: var(--font-sans); line-height: 1.7; color: var(--primary-100); background: var(--primary-900); }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
            .header { padding: 4rem 0 3rem; text-align: center; }
            .header::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 4px; background: var(--accent-500); border-radius: 2px; }
            .header h1 { font-size: 2.75rem; color: var(--primary-50); margin-bottom: 1rem; }
            .header .subtitle { font-size: 1.25rem; color: var(--primary-300); max-width: 600px; margin: 0 auto; }
            .nav { background: rgba(30, 41, 59, 0.8); border: 1px solid var(--primary-700); border-radius: var(--border-radius-lg); padding: 1rem; margin-bottom: 3rem; position: sticky; top: 1rem; z-index: 100; backdrop-filter: blur(12px); }
            .nav-links { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
            .nav-link { color: var(--primary-300); text-decoration: none; font-weight: 500; padding: 0.5rem 1rem; border-radius: var(--border-radius); transition: all 0.2s ease; }
            .nav-link:hover { color: var(--accent-500); background: var(--primary-700); }
            .section { margin-bottom: 4rem; background: var(--primary-800); border: 1px solid var(--primary-700); border-radius: var(--border-radius-xl); padding: 2.5rem; box-shadow: var(--shadow-lg); }
            .section h2 { font-size: 2rem; color: var(--primary-50); margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--primary-700); position: relative; }
            .section h2::before { content: ''; position: absolute; bottom: -2px; left: 0; width: 60px; height: 2px; background: var(--accent-500); }
            .section p { color: var(--primary-300); margin-bottom: 1.5rem; font-size: 1.05rem; }
            .code-block { background: var(--primary-900); border: 1px solid var(--primary-600); border-radius: var(--border-radius-lg); padding: 1.5rem; font-family: var(--font-mono); font-size: 0.9rem; color: var(--primary-200); margin: 1.5rem 0; overflow-x: auto; }
            .inline-code { background: var(--primary-700); color: var(--accent-500); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9em; border: 1px solid var(--primary-600); }
            .builder { background: var(--primary-900); border: 2px solid var(--accent-500); border-radius: var(--border-radius-xl); padding: 2rem; margin: 2rem 0; }
            .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
            .form-group { display: flex; flex-direction: column; }
            .form-label { color: var(--primary-300); font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
            .form-input, .form-select { background: var(--primary-800); border: 1px solid var(--primary-600); border-radius: var(--border-radius); padding: 0.75rem; color: var(--primary-100); font-size: 1rem; font-family: inherit; }
            .btn { background: var(--accent-500); color: white; border: none; padding: 1rem 2rem; border-radius: var(--border-radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; text-decoration: none; }
            .btn:hover { background: var(--accent-600); transform: translateY(-1px); box-shadow: var(--shadow-lg); }
            .preview { background: var(--primary-700); border-radius: var(--border-radius-lg); padding: 2rem; text-align: center; margin: 2rem 0; }
            .preview img { margin: 1rem 0; border-radius: var(--border-radius); box-shadow: var(--shadow-md); }
            .url-display { background: var(--primary-900); border-radius: var(--border-radius); padding: 1rem; font-family: var(--font-mono); font-size: 0.85rem; color: var(--primary-300); word-break: break-all; margin-top: 1rem; }
            .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
            .card { background: var(--primary-700); border: 1px solid var(--primary-600); border-radius: var(--border-radius-lg); padding: 1.5rem; transition: all 0.3s ease; }
            .card:hover { transform: translateY(-4px); border-color: var(--accent-500); box-shadow: var(--shadow-lg); }
            .card h4 { color: var(--primary-50); font-size: 1.1rem; margin-bottom: 1rem; }
            .card img { margin: 1rem 0; border-radius: var(--border-radius); max-width: 200px; }
            .card .code-snippet { background: var(--primary-900); border-radius: var(--border-radius); padding: 0.75rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-500); margin-top: 1rem; }
            .params-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
            .param-group { background: var(--primary-700); border-radius: var(--border-radius-lg); padding: 1.5rem; }
            .param-group h4 { color: var(--accent-500); font-size: 1.1rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--primary-600); }
            .param-item { display: flex; align-items: flex-start; gap: 0.75rem; margin: 0.75rem 0; }
            .param-name { background: var(--primary-900); color: var(--accent-500); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85rem; white-space: nowrap; }
            .param-desc { color: var(--primary-300); font-size: 0.9rem; }
            .footer { margin-top: 5rem; padding: 3rem 0; border-top: 2px solid var(--primary-700); text-align: center; color: var(--primary-400); }
            .heart { color: #ef4444; animation: heartbeat 1.5s ease-in-out infinite; }
            @keyframes heartbeat { 0%, 50%, 100% { transform: scale(1); } 25%, 75% { transform: scale(1.1); } }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>GitHub Commit Badge API</h1>
                <p class="subtitle">Professional, customizable badges for showcasing your GitHub commit activity with advanced theming and visual enhancements.</p>
            </header>

            <nav class="nav">
                <div class="nav-links">
                    <a href="#quick-start" class="nav-link">Quick Start</a>
                    <a href="#builder" class="nav-link">Badge Builder</a>
                    <a href="#parameters" class="nav-link">Parameters</a>
                    <a href="#examples" class="nav-link">Examples</a>
                    <a href="#usage" class="nav-link">Usage</a>
                </div>
            </nav>

            <section id="quick-start" class="section">
                <h2>Quick Start</h2>
                <p>Generate a badge for any GitHub user by replacing <span class="inline-code">USERNAME</span> with their GitHub username:</p>
                <div class="code-block">${baseUrl}/commits?account=USERNAME</div>
                <p><strong>Live example for "octocat":</strong></p>
                <div class="preview" style="padding: 1rem;">
                    <img src="/commits?account=octocat" alt="Basic commit badge example" />
                </div>
            </section>

            <section id="builder" class="section">
                <h2>Interactive Badge Builder</h2>
                <p>Customize your badge in real-time and generate the perfect URL for your needs.</p>
                <div class="builder">
                    <div class="form-grid">
                        <div class="form-group"><label class="form-label">GitHub Username</label><input type="text" id="username" class="form-input" placeholder="Enter username" value="octocat"></div>
                        <div class="form-group"><label class="form-label">Time Period</label><select id="period" class="form-select"><option value="week">Week</option><option value="month" selected>Month</option><option value="quarter">Quarter</option><option value="half">Half Year</option><option value="year">Year</option></select></div>
                        <div class="form-group"><label class="form-label">Theme</label><select id="theme" class="form-select"><option value="default" selected>Default</option><option value="dark">Dark</option><option value="github-dark">GitHub Dark</option><option value="dracula">Dracula</option><option value="monokai">Monokai</option><option value="gradient">Gradient</option><option value="ocean">Ocean</option><option value="sunset">Sunset</option><option value="neon">Neon</option></select></div>
                        <div class="form-group"><label class="form-label">Style</label><select id="style" class="form-select"><option value="flat" selected>Flat</option><option value="flat-square">Flat Square</option><option value="plastic">Plastic</option><option value="for-the-badge">For The Badge</option></select></div>
                        <div class="form-group"><label class="form-label">Animation</label><select id="animated" class="form-select"><option value="">No Animation</option><option value="pulse">Pulse</option><option value="glow">Glow</option><option value="slide">Slide</option></select></div>
                        <div class="form-group"><label class="form-label">Icon</label><select id="icon" class="form-select"><option value="">No Icon</option><option value="fire">Fire</option><option value="rocket">Rocket</option><option value="trophy">Trophy</option><option value="star">Star</option><option value="code">Code</option><option value="chart">Chart</option></select></div>
                    </div>
                    <div class="preview">
                        <img id="previewImg" src="/commits?account=octocat" alt="Badge preview">
                        <div class="url-display" id="badgeUrl"></div>
                    </div>
                </div>
            </section>

            <section id="parameters" class="section">
                <h2>Parameter Reference</h2>
                <div class="params-grid">
                    <div class="param-group">
                        <h4>Core</h4>
                        <div class="param-item"><span class="param-name">account</span><span class="param-desc">GitHub username (required)</span></div>
                        <div class="param-item"><span class="param-name">period</span><span class="param-desc">week | month | quarter | half | year</span></div>
                    </div>
                    <div class="param-group">
                        <h4>Visual Styling</h4>
                        <div class="param-item"><span class="param-name">theme</span><span class="param-desc">Color theme preset</span></div>
                        <div class="param-item"><span class="param-name">color</span><span class="param-desc">Custom color override</span></div>
                        <div class="param-item"><span class="param-name">style</span><span class="param-desc">Badge style variant</span></div>
                    </div>
                    <div class="param-group">
                        <h4>Enhancements</h4>
                        <div class="param-item"><span class="param-name">animated</span><span class="param-desc">pulse | glow | slide</span></div>
                        <div class="param-item"><span class="param-name">icon</span><span class="param-desc">Icon type to display</span></div>
                        <div class="param-item"><span class="param-name">sparkline</span><span class="param-desc">Show activity graph (true)</span></div>
                        <div class="param-item"><span class="param-name">border</span><span class="param-desc">Enable border outline (true)</span></div>
                    </div>
                </div>
            </section>

            <section id="examples" class="section">
                <h2>Theme Gallery & Examples</h2>
                <div class="cards-grid">
                    <div class="card"><h4>Dracula Theme</h4><img src="/commits?account=octocat&theme=dracula&icon=rocket" alt="Dracula theme"><div class="code-snippet">?theme=dracula&icon=rocket</div></div>
                    <div class="card"><h4>Gradient & Sparkline</h4><img src="/commits?account=octocat&theme=gradient&sparkline=true" alt="Gradient theme"><div class="code-snippet">?theme=gradient&sparkline=true</div></div>
                    <div class="card"><h4>Neon Glow Effect</h4><img src="/commits?account=octocat&theme=neon&animated=glow" alt="Neon theme"><div class="code-snippet">?theme=neon&animated=glow</div></div>
                    <div class="card"><h4>Professional Style</h4><img src="/commits?account=octocat&theme=ocean&style=for-the-badge" alt="Ocean theme"><div class="code-snippet">?theme=ocean&style=for-the-badge</div></div>
                </div>
            </section>

            <section id="usage" class="section">
                <h2>Markdown & HTML Usage</h2>
                <p>Copy and paste these examples into your README.md or HTML files.</p>
                <h4 style="color: var(--primary-300); margin: 2rem 0 1rem 0;">Basic Markdown</h4>
                <div class="code-block">![Daily Commits](${baseUrl}/commits?account=yourusername)</div>
                <h4 style="color: var(--primary-300); margin: 2rem 0 1rem 0;">Styled Markdown</h4>
                <div class="code-block">![Commits](${baseUrl}/commits?account=yourusername&theme=dark&icon=fire)</div>
                <h4 style="color: var(--primary-300); margin: 2rem 0 1rem 0;">HTML Integration</h4>
                <div class="code-block">&lt;img src="${baseUrl}/commits?account=yourusername&theme=dracula" alt="GitHub Commits" /&gt;</div>
            </section>

            <footer class="footer">
                <p>Made with <span class="heart">♥</span> by <a href="https://github.com/Prithvi-raptee" class="footer-link" style="text-decoration:none; color: #a6e22e;">8bitSaiyan</a> for the developer community.</p>
            </footer>
        </div>

        <script>
            function updatePreview() {
                const username = document.getElementById('username').value.trim() || 'octocat';
                const params = new URLSearchParams({ account: username });
                const fields = ['period', 'theme', 'style', 'animated', 'icon'];
                const defaults = { period: 'month', theme: 'default', style: 'flat' };
                fields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el.value && el.value !== (defaults[id] || '')) {
                        params.set(id, el.value);
                    }
                });
                const url = '/commits?' + params.toString();
                document.getElementById('previewImg').src = url;
                document.getElementById('badgeUrl').textContent = window.location.origin + url;
            }
            document.querySelectorAll('select, input').forEach(el => el.addEventListener('input', updatePreview));
            window.addEventListener('load', updatePreview);
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
                });
            });
        </script>
    </body>
    </html>
    `;
};

module.exports = { getDocumentationHTML };