import re

with open('temp-website/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the duplicate HTML ending
content = re.sub(r'</body>\s*</html>.*</body>\s*</html>', '</body>\n</html>', content, flags=re.DOTALL)
# It seems the duplication is:
# </body>
# </html>libs.min.js?v=1.0.47" defer></script>
#     <script src="./public/theme/scripts.min.js?v=1.0.47" defer></script>
# </body>
# </html>
# Let's fix this explicitly.
end_fix = """    <script src="./public/theme/libs.min.js?v=1.0.47" defer></script>
    <script src="./public/theme/scripts.min.js?v=1.0.47" defer></script>

</body>

</html>"""
content = re.sub(r'</body>\s*</html>libs\.min\.js.*</html>', end_fix, content, flags=re.DOTALL)

# 2. Metadata Updates
content = re.sub(r'<title>.*?</title>', '<title>Balnce AI | Reclaim Your Digital Sovereignty</title>', content)
content = re.sub(r'<meta property="og:title" content=".*?">', '<meta property="og:title" content="Balnce AI | Reclaim Your Digital Sovereignty">', content)
content = re.sub(r'<meta name="twitter:title" content=".*?">', '<meta name="twitter:title" content="Balnce AI | Reclaim Your Digital Sovereignty">', content)

desc = "Unlock your unlimited digital potential with a personal AI universe that puts you in control. Own your data, broadcast your intention, and ignite the Age of Imagination."
content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{desc}">', content)
content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{desc}">', content)
content = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{desc}">', content)

content = re.sub(r'content="Maze"', 'content="Balnce AI"', content)
content = re.sub(r'mazehq\.com', 'balnce.ai', content)
content = re.sub(r'Mazehq', 'Balnce', content)
content = re.sub(r'mazehq', 'balnce', content)

# 3. Branding replacement (Maze -> Balnce AI)
# We will do a smart replace for text
content = content.replace("Maze's", "Balnce's")
content = content.replace("Maze AI", "Balnce AI")
content = content.replace("Maze", "Balnce AI")

# Fix logo SVG class if needed, but instructions said "keep structure, classes, IDs". 
# So keep "svg-maze-logo" class, but if there's an alt text "Maze logo", it becomes "Balnce AI logo" (handled by above)

# 4. Navigation Links Updates
# We need to update the nav links in the header and mobile menu
# Current header navs: Mission, People, Universe, Roadmap, Contact. (Wait, looking at the first 500 lines, the header ALREADY had Mission, People, Universe, Roadmap, Contact! Let's check.)
# Ah, I see: `<a href="/mission" class="s-header__nav-link" data-ga='["click", "header-nav", "Mission"]'>Mission</a>`
# Wait! In the mobile menu it has: Home, Investigation, Remediation, Our Philosophy, Resources, Contact.
# Let's replace the mobile menu links to match the header.
mobile_nav = """      <li class="s-menu__nav-item js-item">
        <a href="/" class="s-menu__nav-link" data-ga='["click", "menu", "home"]'>Home</a>
      </li>
            <li class="s-menu__nav-item js-item">
        <a href="/mission" class="s-menu__nav-link" data-ga='["click", "menu", "Mission"]'>Mission</a>
      </li>
            <li class="s-menu__nav-item js-item">
        <a href="/people" class="s-menu__nav-link" data-ga='["click", "menu", "People"]'>People</a>
      </li>
            <li class="s-menu__nav-item js-item">
        <a href="/universe" class="s-menu__nav-link" data-ga='["click", "menu", "Universe"]'>Universe</a>
      </li>
            <li class="s-menu__nav-item js-item">
        <a href="/roadmap" class="s-menu__nav-link" data-ga='["click", "menu", "Roadmap"]'>Roadmap</a>
      </li>
            <li class="s-menu__nav-item js-item">
        <a href="/contact" class="s-menu__nav-link" data-ga='["click", "menu", "Contact"]'>Contact</a>
      </li>"""
content = re.sub(r'<li class="s-menu__nav-item js-item">\s*<a href="/" class="s-menu__nav-link".*?</li>.*?<div class="s-menu__social">', mobile_nav + '\n          </ul>\n    <div class="s-menu__social">', content, flags=re.DOTALL)

# 5. Vulnerability Text Replacements
# We need to replace the vulnerability management content in the stats boxes and sections with Balnce AI content.
# The user wants:
# Section 1: Problem of data exploitation by centralized platforms.
# Section 2: Solution: Web0, Personal AI Universe, and Intentcasting.
# Section 3: Benefits: Digital Sovereignty, Personal Economic AGI, and Superagency.

# Let's write a targeted replacement for the vulnerability stats and texts.
replacements = [
    # Story 1 stats
    ("40,000", "100%"),
    ("Vulnerabilities published in 2024", "Your data monetized by Big Tech"),
    ("Time to exploit is collapsing", "Attention is currency"),
    ("increase in 2024  in attackers exploiting vulnerabilities to gain initial access", "increase in ad-targeting and data brokering"),
    ("Rule-based logic and scoring criteria can’t accurately identify false-positives", "Traditional platforms lock you in walled gardens"),
    ("Manual triage is slow, expensive, and can’t keep up with the volume of vulnerabilities", "You generate the value, but centralized entities reap the rewards"),
    ("90% of all findings are false positives when investigated in context", "90% of your digital footprint is owned by someone else"),
    
    # Story 2 title & text (which used to be "Shrink your vulnerability backlog")
    ("Shrink your vulnerability<br />\nbacklog", "Embrace Web0 &<br />\nIntentcasting"),
    ("Confidently identify vulnerabilities that cannot be exploited in your environment, allowing you to remove 90% of your backlog.", "Step into a decentralized P2P network where your Personal AI Universe communicates directly. Broadcast your intentions and let your agents negotiate the best value."),
    
    # Story 2 - the stream list
    ("Vulnerabilities ingested from cloud vulnerability scanners", "Intentions broadcasted securely via your Personal AI"),
    ("AI Agents investigate every vulnerability in the context of your environment", "Fiduciary Agents negotiate directly with the Web0 network"),
    ("False positives removed and high-risk vulnerabilities identified", "Noise eliminated, delivering only highly relevant opportunities"),
    ("One-click mitigation and remediation actions sent to owners", "Seamless execution of your digital superagency"),
    
    # Story 3 (which was "Quickly identify the few vulnerabilities that matter")
    ("Quickly identify the few vulnerabilities that matter", "Achieve Digital Sovereignty & Economic AGI"),
    ("Identify the few vulnerabilities that are truly critical, so you can stop worrying about an unpatched vulnerability leading to a breach.", "Your digital self becomes your greatest asset. Build a Personal Economic AGI that acts as your savviest business partner, ensuring your prosperity."),
    
    # Story 4 (which was "Respond fast when needed")
    ("Respond fast when needed,<br />\nand stop project managing remediation", "Superagency:<br />\nDesign Your Future"),
    ("Use intelligent workflows to prepare immediate mitigations for critical vulnerabilities, and provide one-click remediation options to engineering teams.", "Experience technology that serves humanity. Your agents manage data, privacy, and prosperity, granting you unlimited digital potential."),
    
    # CTA
    ("Get cloud vulnerabilities<br> under control", "Unlock Your Unlimited<br>Digital Potential"),
    ("AI that investigates and resolves cloud vulnerabilities.", "A complete AI universe, personally yours. The New Digital Workforce: You."),
    
    # Event boxes (CVEs)
    ("CVE-2024-53194", "Intent: Secure Housing"),
    ("CVE-2024-53990", "Intent: Career Growth"),
    ("CVE-2025-21613", "Intent: Wealth Generation"),
    ("Exploitable", "Negotiating"),
    ("High Likelihood", "High Match"),
    ("Critical Impact", "Secured"),
    
    # Stream events
    ("Incident created", "Intent Broadcasted"),
    ("WAF policy deployed", "Agents Negotiating"),
    ("Ticket created", "Value Secured"),
    ("Slack notification sent to<br> #maze-alerts", "Notification sent to<br> your Personal AI"),
    
    # Hotspots in stream
    ("KDC Server Running", "Web0 Node Active"),
    ("Function reachable", "P2P Connection"),
    ("FTP Client Functionality", "Fiduciary Agent"),
    ("Access to package repositories", "Data Sovereignty"),
    ("JSON Payload Processing", "Intent Matching"),
    ("FOU tunnels configured", "Privacy Secured"),
    ("Image Parsing Configuration", "Identity Verified"),
    ("Framebuffer console enable", "Superagency Active")
]

for old, new in replacements:
    content = content.replace(old, new)

with open('temp-website/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
