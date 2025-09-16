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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            :root {
                /* Shadcn-inspired Matte Black Theme */
                --background: hsl(240 10% 3.9%);
                --foreground: hsl(210 20% 98%);
                --card: hsl(240 5.9% 10%);
                --border: hsl(240 3.7% 15.9%);
                --input: hsl(240 3.7% 15.9%);
                
                --primary: hsl(217.2 91.2% 59.8%);
                --primary-foreground: hsl(210 20% 98%);
                
                --secondary: hsl(240 3.7% 15.9%);
                --secondary-foreground: hsl(210 20% 98%);
                
                --muted: hsl(240 3.7% 15.9%);
                --muted-foreground: hsl(240 5% 64.9%);

                --ring: hsl(217.2 91.2% 59.8%);
                --radius: 0.75rem;
                
                --font-sans: 'Inter', sans-serif;
                --font-mono: 'JetBrains Mono', monospace;
            }
            
            /* Base & Reset */
            *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            html {
                scroll-behavior: smooth;
                scroll-padding-top: 8rem;
            }

            body {
                background-color: var(--background);
                color: var(--foreground);
                font-family: var(--font-sans);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow-x: hidden;
            }

            /* Cursor Aura Effect */
            .cursor-aura {
                position: fixed;
                top: 0;
                left: 0;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: radial-gradient(circle, hsla(217, 91%, 59%, 0.1), transparent 70%);
                pointer-events: none;
                transform: translate(-50%, -50%);
                z-index: 0;
                transition: width 0.3s ease, height 0.3s ease, background 0.3s ease;
            }
            
            main {
                position: relative;
                z-index: 1;
            }

            /* Typography */
            h1, h2, h3, h4, h5, h6 { line-height: 1.2; font-weight: 700; color: var(--foreground); }
            h1 { font-size: 3.5rem; letter-spacing: -0.05em; }
            h2 { font-size: 2.25rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
            h3 { font-size: 1.5rem; margin-bottom: 1.5rem; }
            p { color: var(--muted-foreground); margin-bottom: 1.25rem; line-height: 1.7; font-size: 1rem; }
            a { color: var(--primary); text-decoration: none; transition: color 0.2s; }
            a:hover { color: hsl(217.2 91.2% 69.8%); }
            .inline-code {
                font-family: var(--font-mono);
                background: var(--muted);
                padding: 0.2em 0.4em;
                border-radius: 0.3rem;
                font-size: 0.9em;
                color: var(--foreground);
            }

            /* Layout */
            .container {
                max-width: 1024px;
                margin: 0 auto;
                padding: 0 1.5rem;
            }

            /* Header */
            .header {
                text-align: center;
                padding: 6rem 0 4rem;
            }
            .header h1 {
                background: linear-gradient(90deg, hsl(210 40% 98%), hsl(210 40% 70%));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 800;
            }
            .header .subtitle {
                max-width: 600px;
                margin: 1.5rem auto 2.5rem;
                font-size: 1.125rem;
                color: var(--muted-foreground);
            }
            .header-buttons { display: flex; gap: 1rem; justify-content: center; }

            /* Buttons */
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .btn-primary {
                background-color: var(--primary);
                color: var(--primary-foreground);
                border-color: var(--primary);
            }
            .btn-primary:hover { background-color: hsl(217.2 91.2% 55.8%); }
            .btn-secondary {
                background-color: var(--secondary);
                color: var(--secondary-foreground);
                border-color: var(--border);
            }
            .btn-secondary:hover { background-color: hsl(240 3.7% 20%); }

            /* Navigation */
            .nav {
                position: sticky;
                top: 1rem;
                background: hsla(240, 10%, 4%, 0.5);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 100;
                margin: 1rem auto 3.5rem;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
                max-width: 1024px;
            }
            .nav-container { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; }
            .nav-logo { font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
            .nav-logo i { color: var(--primary); }
            .nav-links { display: flex; gap: 1.5rem; list-style: none; }
            .nav-link { color: var(--muted-foreground); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
            .nav-link:hover { color: var(--foreground); }
            .mobile-menu-button { display: none; background: transparent; border: none; color: var(--foreground); font-size: 1.5rem; cursor: pointer; }

            /* Card / Section */
            .section {
                background: transparent;
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 2.5rem;
                margin-bottom: 2rem;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            /* Code Blocks & Preview */
            .code-block {
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: 0.5rem;
                padding: 1rem;
                font-family: var(--font-mono);
                font-size: 0.9rem;
                color: var(--muted-foreground);
                margin-top: 1rem;
                overflow-x: auto;
                position: relative;
            }
            .preview { padding: 1.5rem; text-align: center; }
            .preview img { max-width: 100%; height: auto; border-radius: 0.3rem; }

            /* Builder & Forms */
            .builder {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 2rem;
            }
            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            .form-group { display: flex; flex-direction: column; }
            .form-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--muted-foreground);
                margin-bottom: 0.5rem;
            }
            .form-input, .form-select {
                background: var(--background);
                border: 1px solid var(--input);
                border-radius: 0.5rem;
                padding: 0.65rem 1rem;
                color: var(--foreground);
                font-size: 0.95rem;
                font-family: var(--font-sans);
                transition: border-color 0.2s, box-shadow 0.2s;
                width: 100%;
            }
            .form-input:focus, .form-select:focus {
                outline: none;
                border-color: var(--ring);
                box-shadow: 0 0 0 1px var(--ring);
            }
            .url-display {
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: 0.5rem;
                padding: 1rem;
                font-family: var(--font-mono);
                font-size: 0.85rem;
                color: var(--muted-foreground);
                word-break: break-all;
                text-align: left;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .url-display:hover { background: var(--secondary); }
            
            /* Cards Grid (Examples) */
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.5rem;
            }
            .card {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                transition: border-color 0.2s, transform 0.2s;
            }
            .card:hover { border-color: var(--primary); transform: translateY(-3px); }
            .card h4 { font-size: 1.1rem; margin-bottom: 1rem; }
            .card img { margin: auto 0 1.5rem; }
            .card .code-snippet { margin-top: auto; padding: 0.75rem; font-size: 0.8rem; background: var(--background); }
            
            .footer {
                text-align: center;
                padding: 4rem 0 2rem;
                color: var(--muted-foreground);
                font-size: 1rem;
                border-top: 1px solid var(--border);
                margin-top: 4rem;
            }
            .footer p { margin-bottom: 0.5rem; }
            .footer .cta {
                margin-top: 1.5rem;
                font-size: 0.875rem;
                color: var(--muted-foreground);
            }
            .footer .cta p { line-height: 1.6; }

            /* Scroll Animation */
            .fade-in-section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            .fade-in-section.is-visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Responsive */
            @media (max-width: 768px) {
                h1 { font-size: 2.5rem; }
                h2 { font-size: 1.75rem; }
                .nav-links { display: none; }
                .mobile-menu-button { display: block; }
                .nav {
                    top: 0;
                    border-radius: 0;
                    margin: 0 auto;
                }
                 .nav-links.active {
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--card);
                    padding: 1rem;
                    border: 1px solid var(--border);
                    border-top: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="cursor-aura"></div>
        
        <nav class="nav">
            <div class="nav-container">
                <a href="#" class="nav-logo"><i class="fas fa-chart-line"></i> Commit Badge API</a>
                <ul class="nav-links">
                    <li><a href="#quick-start" class="nav-link">Quick Start</a></li>
                    <li><a href="#builder" class="nav-link">Builder</a></li>
                    <li><a href="#parameters" class="nav-link">Parameters</a></li>
                    <li><a href="#examples" class="nav-link">Examples</a></li>
                </ul>
                <button class="mobile-menu-button" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
            </div>
        </nav>

        <div class="container">
            <header class="header fade-in-section">
                <h1>GitHub Commit Badge API</h1>
                <p class="subtitle">Dynamic, modern, and highly customizable SVG badges to showcase your GitHub commit activity and consistency.</p>
                <div class="header-buttons">
                    <a href="#quick-start" class="btn btn-primary"><i class="fas fa-rocket"></i> Get Started</a>
                    <a href="#builder" class="btn btn-secondary"><i class="fas fa-wand-magic-sparkles"></i> Live Builder</a>
                </div>
            </header>

            <main>
                <section id="quick-start" class="section fade-in-section">
                    <h2>Quick Start</h2>
                    <p>Embed a real-time badge in your profiles or projects. Just replace <span class="inline-code">USERNAME</span> with a GitHub username.</p>
                    <div class="code-block">${baseUrl}/commits?account=USERNAME</div>
                    <p style="margin-top: 1.5rem; margin-bottom: 0.5rem;"><strong>Live example for "octocat":</strong></p>
                    <div class="preview">
                        <img src="/commits?account=octocat&theme=dark" alt="Basic commit badge example" />
                    </div>
                </section>
                
                <section id="builder" class="section fade-in-section">
                    <h2>Interactive Badge Builder</h2>
                    <p>Use the controls below to customize your badge in real-time. The URL will update automatically.</p>
                    <div class="builder">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="username" class="form-label">GitHub Username</label>
                                <input type="text" id="username" class="form-input" placeholder="e.g., octocat" value="octocat">
                            </div>
                            <div class="form-group">
                                <label for="period" class="form-label">Time Period</label>
                                <select id="period" class="form-select">
                                    <option value="week">Week</option>
                                    <option value="month" selected>Month</option>
                                    <option value="quarter">Quarter</option>
                                    <option value="half">Half Year</option>
                                    <option value="year">Year</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="theme" class="form-label">Theme</label>
                                <select id="theme" class="form-select">
                                    <option value="default">Default</option>
                                    <option value="dark" selected>Dark</option>
                                    <option value="github-dark">GitHub Dark</option>
                                    <option value="dracula">Dracula</option>
                                    <option value="monokai">Monokai</option>
                                    <option value="gradient">Gradient</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="sunset">Sunset</option>
                                    <option value="neon">Neon</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="style" class="form-label">Style</label>
                                <select id="style" class="form-select">
                                    <option value="flat" selected>Flat</option>
                                    <option value="flat-square">Flat Square</option>
                                    <option value="plastic">Plastic</option>
                                    <option value="for-the-badge">For The Badge</option>
                                </select>
                            </div>
                        </div>
                        <div class="preview">
                            <img id="previewImg" src="/commits?account=octocat&theme=dark" alt="Badge preview">
                            <div class="url-display" id="badgeUrl" title="Click to copy">/commits?account=octocat&theme=dark</div>
                        </div>
                    </div>
                </section>

                <section id="parameters" class="section fade-in-section">
                    <h2>Parameter Reference</h2>
                    <p>Combine these query parameters to further customize your badge.</p>
                     <div class="cards-grid">
                        <div class="card">
                            <h4>Core</h4>
                            <p><span class="inline-code">account</span> GitHub username (required).</p>
                            <p><span class="inline-code">period</span> Values: week, month, quarter, half, year.</p>
                        </div>
                        <div class="card">
                            <h4>Appearance</h4>
                            <p><span class="inline-code">theme</span> Select from a list of color presets.</p>
                            <p><span class="inline-code">style</span> Badge shape and style. Values: flat, plastic, etc.</p>
                            <p><span class="inline-code">color</span> Custom hex color (e.g., 4f46e5) to override theme.</p>
                        </div>
                         <div class="card">
                            <h4>Enhancements</h4>
                            <p><span class="inline-code">icon</span> Values: fire, rocket, trophy, etc.</p>
                            <p><span class="inline-code">animated</span> Values: pulse, glow, slide.</p>
                            <p><span class="inline-code">sparkline</span> Show mini activity graph (true).</p>
                            <p><span class="inline-code">border</span> Enable border outline (true).</p>
                        </div>
                    </div>
                </section>
                
                <section id="examples" class="section fade-in-section">
                    <h2>Theme Gallery & Examples</h2>
                    <div class="cards-grid">
                        <div class="card">
                            <h4>Dracula & Rocket</h4>
                            <img src="/commits?account=octocat&theme=dracula&icon=rocket" alt="Dracula theme">
                            <div class="code-snippet">?theme=dracula&icon=rocket</div>
                        </div>
                        <div class="card">
                            <h4>Gradient & Sparkline</h4>
                            <img src="/commits?account=octocat&theme=gradient&sparkline=true" alt="Gradient theme">
                            <div class="code-snippet">?theme=gradient&sparkline=true</div>
                        </div>
                        <div class="card">
                            <h4>Neon with Glow</h4>
                            <img src="/commits?account=octocat&theme=neon&animated=glow" alt="Neon theme">
                            <div class="code-snippet">?theme=neon&animated=glow</div>
                        </div>
                        <div class="card">
                            <h4>For The Badge Style</h4>
                            <img src="/commits?account=octocat&theme=ocean&style=for-the-badge" alt="Ocean theme">
                            <div class="code-snippet">?theme=ocean&style=for-the-badge</div>
                        </div>
                    </div>
                </section>

                <footer class="footer fade-in-section">
                    <p>
                        Made with ❤️ by <a href="https://github.com/Prithvi-raptee" target="_blank" rel="noopener noreferrer">8bitSaiyan</a> for the open source community.
                    </p>
                    <div class="cta">
                        <p>
                            Digging this? The whole thing lives on <a href="https://github.com/Prithvi-raptee/github-commit-badge-api" target="_blank" rel="noopener noreferrer">GitHub</a>.
                        </p>
                        <p>
                           If it made your README a little snazzier, a ⭐️ would be awesome!
                           <br>
                           Got ideas to make it even better? Fork it, break it, and send a PR. Go nuts.
                        </p>
                    </div>
                </footer>
            </main>
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                
                const aura = document.querySelector('.cursor-aura');
                if (aura) {
                    document.addEventListener('mousemove', (e) => {
                        aura.style.transform = \`translate(\${e.clientX - aura.offsetWidth / 2}px, \${e.clientY - aura.offsetHeight / 2}px)\`;
                    });

                    document.querySelectorAll('a, button, input, select, .url-display, .card').forEach(el => {
                        el.addEventListener('mouseenter', () => {
                            aura.style.width = '600px';
                            aura.style.height = '600px';
                            aura.style.background = 'radial-gradient(circle, hsla(217, 91%, 59%, 0.15), transparent 70%)';
                        });
                         el.addEventListener('mouseleave', () => {
                            aura.style.width = '400px';
                            aura.style.height = '400px';
                            aura.style.background = 'radial-gradient(circle, hsla(217, 91%, 59%, 0.1), transparent 70%)';
                        });
                    });
                }
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                        }
                    });
                }, { threshold: 0.1 });

                document.querySelectorAll('.fade-in-section').forEach(section => {
                    observer.observe(section);
                });
                
                const mobileMenuButton = document.querySelector('.mobile-menu-button');
                const navLinks = document.querySelector('.nav-links');
                if (mobileMenuButton) {
                    mobileMenuButton.addEventListener('click', () => {
                        navLinks.classList.toggle('active');
                    });
                }
                
                function updatePreview() {
                    const username = document.getElementById('username').value.trim() || 'octocat';
                    const params = new URLSearchParams({ account: username });
                    const fields = ['period', 'theme', 'style', 'animated', 'icon'];
                    const defaults = { period: 'month', theme: 'dark', style: 'flat' };
                    
                    fields.forEach(id => {
                        const el = document.getElementById(id);
                        if (el && el.value && el.value !== (defaults[id] || '')) {
                            params.set(id, el.value);
                        }
                    });
                    
                    const relativeUrl = '/commits?' + params.toString();
                    const fullUrl = window.location.origin + relativeUrl;

                    document.getElementById('previewImg').src = relativeUrl;
                    
                    const badgeUrlEl = document.getElementById('badgeUrl');
                    badgeUrlEl.textContent = fullUrl;
                }

                document.querySelectorAll('#builder .form-input, #builder .form-select').forEach(el => {
                    el.addEventListener('change', updatePreview);
                    el.addEventListener('keyup', updatePreview);
                });

                document.getElementById('badgeUrl').addEventListener('click', function() {
                    navigator.clipboard.writeText(this.textContent).then(() => {
                        const originalText = this.textContent;
                        this.textContent = 'Copied!';
                        setTimeout(() => { this.textContent = originalText; }, 2000);
                    });
                });

                updatePreview();
            });
        </script>
    </body>
    </html>`;
};

module.exports = { getDocumentationHTML };