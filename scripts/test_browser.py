from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    logs = []
    page.on("console", lambda msg: logs.append(f"CONSOLE {msg.type}: {msg.text}"))
    page.on("pageerror", lambda exc: logs.append(f"PAGE ERROR: {exc}"))

    print("Visiting http://localhost:5173/")
    try:
        page.goto('http://localhost:5173', timeout=10000)
        page.wait_for_load_state('networkidle', timeout=5000)
    except Exception as e:
        print(f"Error during navigation: {e}")
        
    # Let's wait a bit to see if there's an infinite loop or more errors
    time.sleep(2)
    
    print("\n--- BROWSER LOGS ---")
    for log in logs:
        print(log)
        
    print("\n--- PAGE CONTENT ---")
    print(page.content()[:1000]) # First 1000 chars

    browser.close()
