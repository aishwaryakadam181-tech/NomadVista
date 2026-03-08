const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT ||3000;

// --- CONFIGURATION ---
const SUPABASE_URL = 'process.env.https://qfxoawvtxhlsttexbifp.supabase.co';
const SUPABASE_KEY = 'process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmeG9hd3Z0eGhsc3R0ZXhiaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODgzNTUsImV4cCI6MjA4ODQ2NDM1NX0.sQ__59cBWwJkT3SBKH62ADkKMJ3OhR3NyCRoiv4s71w';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());

// --- THE UI (HTML/CSS/JS) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>NomadVista | Secure</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
        <style>
            body { background: #05070a; color: white; font-family: 'Space Grotesk', sans-serif; margin: 0; }
            nav { padding: 20px 5%; display: flex; justify-content: space-between; border-bottom: 1px solid #222; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; }
            .auth-box { max-width: 400px; margin: 100px auto; padding: 40px; background: #111; border: 1px solid #222; border-radius: 20px; text-align: center; }
            input { width: 100%; padding: 12px; margin: 10px 0; background: #000; border: 1px solid #333; color: white; border-radius: 8px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; padding: 50px 5%; }
            .card { background: #111; border: 1px solid #222; border-radius: 20px; overflow: hidden; }
            .card img { width: 100%; height: 200px; object-fit: cover; }
            .btn { background: #00f2ff; color: black; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; }
            .hidden { display: none; }
            .logout-btn { background: transparent; color: #ff4d4d; border: 1px solid #ff4d4d; padding: 5px 15px; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <nav>
            <div>NOMAD<span style="color:#00f2ff">VISTA</span></div>
            <div id="nav-user" class="hidden">
                <span id="user-email" style="margin-right:15px; font-size:0.9rem; color:#888"></span>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        </nav>

        <div id="auth-section" class="auth-box">
            <h2 id="auth-title">Welcome Back</h2>
            <input type="email" id="email" placeholder="Email Address">
            <input type="password" id="password" placeholder="Password">
            <button class="btn" id="auth-btn" onclick="handleAuth()">Login</button>
            <p style="margin-top:15px; font-size:0.8rem; color:#888; cursor:pointer" onclick="toggleAuth()">
                Don't have an account? <span style="color:#00f2ff">Sign Up</span>
            </p>
        </div>

        <div id="travel-section" class="hidden">
            <div style="text-align:center; padding: 50px 5% 0;">
                <h1 style="font-size:3rem">BEYOND THE HORIZON</h1>
                <p style="color:#888">Premium Destinations for Members Only</p>
            </div>
            <div id="grid" class="grid"></div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        <script>
            const _supabase = supabase.createClient('${SUPABASE_URL}', '${SUPABASE_KEY}');
            let isLogin = true;

            function toggleAuth() {
                isLogin = !isLogin;
                document.getElementById('auth-title').innerText = isLogin ? 'Welcome Back' : 'Join NomadVista';
                document.getElementById('auth-btn').innerText = isLogin ? 'Login' : 'Sign Up';
            }

            async function handleAuth() {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                if (isLogin) {
                    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
                    if (error) alert(error.message);
                    else checkUser();
                } else {
                    const { data, error } = await _supabase.auth.signUp({ email, password });
                    if (error) alert(error.message);
                    else alert('Check your email for the confirmation link!');
                }
            }

            async function logout() {
                await _supabase.auth.signOut();
                location.reload();
            }

            async function checkUser() {
                const { data: { user } } = await _supabase.auth.getUser();
                if (user) {
                    document.getElementById('auth-section').classList.add('hidden');
                    document.getElementById('travel-section').classList.remove('hidden');
                    document.getElementById('nav-user').classList.remove('hidden');
                    document.getElementById('user-email').innerText = user.email;
                    loadPackages();
                }
            }

            async function loadPackages() {
                // Fetching from your API
                const res = await fetch('/api/packages');
                const data = await res.json();
                document.getElementById('grid').innerHTML = data.map(p => \`
                    <div class="card">
                        <img src="\${p.img}">
                        <div style="padding:20px">
                            <div style="color:#00f2ff; font-size:0.7rem; letter-spacing:2px">\${p.location}</div>
                            <h3>\${p.title}</h3>
                            <p style="color:#888">Transport: \${p.vehicle}</p>
                            <div style="font-size:1.5rem">$\${p.price}</div>
                            <button class="btn" style="margin-top:15px">BOOK NOW</button>
                        </div>
                    </div>
                \`).join('');
            }

            checkUser();
        </script>
    </body>
    </html>
    `);
});

// --- THE API (STILL CONNECTED TO SUPABASE) ---
app.get('/api/packag', async (req, res) => {
    const { data, error } = await supabase.from('packag').select('*');
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.listen(port, () => console.log('NomadVista Live at http://localhost:3000'));