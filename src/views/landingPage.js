/**
 * Server-Side HTML Renderer for landing page.
 * Sets Continue button / Form action dynamically to the verified Routeclk tracking URL.
 */

function renderLandingPage(trackingUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Insurance Quotes — Protect Your Home in Minutes</title>
    <!-- Google Fonts: Plus Jakarta Sans for bold headers & Inter for body -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            /* WarmClay Theme Palette */
            --bg-page: #faf7f5;
            --text-heading: #261e1b;
            --text-body: #574d47;
            --text-muted: #82756d;
            
            --card-bg: #ffffff;
            --card-border: #ede4dd;
            --card-shadow: 0 4px 18px rgba(60, 40, 30, 0.05);
            
            --hero-card-bg: #f9ede4;
            --hero-card-border: #ebd3c2;
            --hero-card-shadow: 0 10px 28px -4px rgba(180, 83, 9, 0.09);
            
            --btn-primary-bg: #c25e2e;
            --btn-primary-hover: #a54b20;
            --btn-primary-text: #ffffff;
            --focus-ring: rgba(194, 94, 46, 0.25);
            
            --star-color: #f59e0b;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-body);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 24px 60px;
        }
        /* Main Container */
        .main-container {
            width: 100%;
            max-width: 1040px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        /* Main Headline */
        h1.hero-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: clamp(28px, 3.4vw, 42px);
            font-weight: 800;
            color: var(--text-heading);
            line-height: 1.25;
            letter-spacing: -0.025em;
            max-width: 860px;
            margin-bottom: 16px;
        }
        /* Subtitle */
        p.hero-sub {
            font-size: clamp(15px, 1.6vw, 17px);
            line-height: 1.55;
            color: var(--text-body);
            max-width: 800px;
            margin-bottom: 32px;
            font-weight: 400;
        }
        /* Trust Badges Row */
        .rating-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
            margin-bottom: 38px;
            width: 100%;
        }
        .rating-badge {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            padding: 11px 20px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 9px;
            box-shadow: var(--card-shadow);
            font-size: 14px;
            font-weight: 600;
            color: var(--text-heading);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .rating-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        .stars-group {
            display: inline-flex;
            gap: 2.5px;
            align-items: center;
        }
        .star-svg {
            width: 15px;
            height: 15px;
            fill: var(--star-color);
        }
        .reviews-count {
            color: var(--text-heading);
            font-weight: 600;
            font-size: 14px;
            margin-left: 2px;
        }
        /* Brand / Authority Badge Icons */
        .badge-brand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 15px;
            color: #4285F4;
        }
        /* Central Question Card */
        .quiz-card {
            background: var(--hero-card-bg);
            border: 1px solid var(--hero-card-border);
            border-radius: 20px;
            padding: 38px 46px 42px;
            width: 100%;
            max-width: 530px;
            margin-bottom: 44px;
            box-shadow: var(--hero-card-shadow);
            position: relative;
            text-align: center;
        }
        .quiz-card h2 {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: var(--text-heading);
            margin-bottom: 8px;
            letter-spacing: -0.015em;
        }
        .quiz-card p.card-desc {
            font-size: 15px;
            color: var(--text-body);
            line-height: 1.45;
            margin-bottom: 22px;
        }
        .form-group {
            position: relative;
            margin-bottom: 12px;
            text-align: left;
        }
        .custom-select-wrapper {
            position: relative;
            width: 100%;
        }
        .select-input {
            width: 100%;
            appearance: none;
            -webkit-appearance: none;
            background-color: var(--card-bg);
            color: var(--text-heading);
            border: 1.5px solid #d4c5bb;
            border-radius: 9px;
            padding: 13px 42px 13px 18px;
            font-size: 15.5px;
            font-family: inherit;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .select-input:focus {
            border-color: var(--btn-primary-bg);
            box-shadow: 0 0 0 3px var(--focus-ring);
        }
        .select-arrow {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            width: 16px;
            height: 16px;
            color: #82756d;
        }
        .cta-btn {
            width: 100%;
            background-color: var(--btn-primary-bg);
            color: var(--btn-primary-text);
            border: none;
            border-radius: 9px;
            padding: 14px 22px;
            font-size: 16.5px;
            font-weight: 700;
            font-family: 'Plus Jakarta Sans', sans-serif;
            letter-spacing: 0.01em;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(194, 94, 46, 0.2);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }
        .cta-btn:hover {
            background-color: var(--btn-primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(194, 94, 46, 0.28);
        }
        .cta-btn:active {
            transform: translateY(0);
        }
        /* Testimonials Section */
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            width: 100%;
            max-width: 1040px;
        }
        .testimonial-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 14px;
            padding: 26px 24px 24px;
            box-shadow: var(--card-shadow);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .testimonial-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
        }
        .testimonial-stars {
            margin-bottom: 12px;
            display: inline-flex;
            gap: 2.5px;
        }
        .testimonial-quote {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-heading);
            line-height: 1.4;
            letter-spacing: -0.01em;
        }
        /* Responsive Breakpoints */
        @media (max-width: 768px) {
            body {
                padding: 30px 16px 40px;
                justify-content: flex-start;
            }
            .rating-row {
                flex-direction: column;
                align-items: stretch;
                max-width: 360px;
            }
            .rating-badge {
                justify-content: center;
            }
            .quiz-card {
                padding: 28px 22px 30px;
            }
            .testimonials-grid {
                grid-template-columns: 1fr;
                max-width: 440px;
                gap: 14px;
            }
        }
    </style>
</head>
<body>
    <!-- Reusable SVG Star Symbol Definition -->
    <svg style="display: none;">
        <symbol id="star-icon" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </symbol>
    </svg>
    <main class="main-container">
        <!-- Main Headline -->
        <h1 class="hero-title">Protect Your Home in Minutes — Coverage That Actually Has Your Back</h1>
        <!-- Subheading -->
        <p class="hero-sub">Get free instant quotes from leading home insurers in 90 seconds. Compare rates and coverage side-by-side—zero commitment required.</p>
        <!-- Social Proof / Trust Badges -->
        <div class="rating-row">
            <!-- Badge 1: Google G -->
            <div class="rating-badge">
                <span class="badge-brand-icon">G</span>
                <span class="stars-group">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </span>
                <span class="reviews-count">100+ reviews</span>
            </div>
            <!-- Badge 2: Star Review -->
            <div class="rating-badge">
                <span class="stars-group">
                    <svg class="star-svg" style="fill: #eab308;"><use href="#star-icon"/></svg>
                </span>
                <span class="stars-group">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </span>
                <span class="reviews-count">100+ reviews</span>
            </div>
            <!-- Badge 3: Verified Shield -->
            <div class="rating-badge">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="#dc2626"/>
                    <path d="M12 2v20c4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="#991b1b"/>
                    <path d="M10 12.5l-1.5-1.5L7 12.5 10 15.5l7-7-1.5-1.5-5.5 5.5z" fill="#ffffff"/>
                </svg>
                <span class="stars-group">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </span>
                <span class="reviews-count">100+ reviews</span>
            </div>
        </div>
        <!-- Central Question Card -->
        <div class="quiz-card">
            <h2>What is Your Age Group?</h2>
            <p class="card-desc">We'll use this to find the best rates for your demographic.</p>
            <form id="quoteForm" action="${trackingUrl || '#'}" method="get">
                <div class="form-group">
                    <div class="custom-select-wrapper">
                        <select id="ageSelect" class="select-input" required>
                            <option value="" disabled selected>Select Age Group...</option>
                            <option value="18-25">18 – 25</option>
                            <option value="26-35">26 – 35</option>
                            <option value="36-45">36 – 45</option>
                            <option value="46-55">46 – 55</option>
                            <option value="56+">56+</option>
                        </select>
                        <svg class="select-arrow" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                </div>
                <button type="submit" class="cta-btn" href="${trackingUrl || '#'}">
                    Continue
                </button>
            </form>
        </div>
        <!-- Social Proof Testimonial Cards -->
        <div class="testimonials-grid">
            <!-- Testimonial 1 -->
            <div class="testimonial-card">
                <div class="testimonial-stars">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </div>
                <div class="testimonial-quote">"Saved over $600 on our premium"</div>
            </div>
            <!-- Testimonial 2 -->
            <div class="testimonial-card">
                <div class="testimonial-stars">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </div>
                <div class="testimonial-quote">"We found better coverage for less"</div>
            </div>
            <!-- Testimonial 3 -->
            <div class="testimonial-card">
                <div class="testimonial-stars">
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                    <svg class="star-svg"><use href="#star-icon"/></svg>
                </div>
                <div class="testimonial-quote">"So easy to compare options"</div>
            </div>
        </div>
    </main>

    <script>
    document.addEventListener("DOMContentLoaded", async function () {
        let destinationUrl = "${trackingUrl || '#'}";

        try {
            const endpoint = (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/home/index.html' && window.location.pathname !== '/index.html')
                ? (window.location.pathname + window.location.search)
                : ('/api/v1/tracking/resolve' + window.location.search);
            const response = await fetch(endpoint, {
                headers: { 'Accept': 'application/json' }
            }).catch(() => fetch('/api/v1/tracking/resolve' + window.location.search, { headers: { 'Accept': 'application/json' } }));

            const data = await response.json();
            console.log("Tracking API Response:", data);

            if (data && data.isFallback && data.destinationUrl) {
                window.location.replace(data.destinationUrl);
                return;
            }

            if (data && data.destinationUrl) {
                destinationUrl = data.destinationUrl;
                const form = document.getElementById("quoteForm");
                if (form) form.action = destinationUrl;
                const btn = document.querySelector(".cta-btn");
                if (btn) btn.setAttribute("href", destinationUrl);
            }
        } catch (err) {
            console.log("Static mode or tracking resolve:", err);
        }

        const form = document.getElementById("quoteForm");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                const age = document.getElementById("ageSelect")?.value;
                if (!age) {
                    alert("Please select your age group.");
                    return;
                }
                const target = destinationUrl || form.getAttribute("action");
                if (target && target !== "#") {
                    window.location.href = target;
                }
            });
        }
    });
    </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
