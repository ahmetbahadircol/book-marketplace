from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from bs4 import BeautifulSoup
import time
import random

def debug_scraper():
    url = "https://bookdepot.ca/Store/Browse?page=1&size=20&sort=arrival_1"
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
        )
        page = context.new_page()
        stealth = Stealth()
        stealth.apply_stealth_sync(page)
        
        try:
            print(f"Navigating to {url}...")
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(5) # Wait for cloudflare/loading
            
            content = page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            books = soup.select(".grid-item")
            print(f"Found {len(books)} books. Searching for discounted/line-through prices...")
            
            found_discounted = False
            for i, book in enumerate(books):
                if "line-through" in str(book) or "text-decoration:line-through" in str(book):
                    print(f"\n--- DISCOUNTED BOOK FOUND (Index {i}) ---")
                    print(book.prettify())
                    print("--- END DISCOUNTED BOOK ---\n")
                    found_discounted = True
                    
                    # Test logic specifically on this book
                    print("TESTING LOGIC ON THIS BOOK:")
                    
                    # New Price Logic
                raw_price_text = "0.00"
                price_strong = first_book.select_one(".caption strong")
                
                if price_strong:
                    # İndirimli ürün kontrolü
                    discount_span = price_strong.select_one("span[style*='line-through']")
                    if discount_span:
                        real_price_span = discount_span.find_next_sibling("span")
                        if real_price_span:
                            raw_price_text = real_price_span.get_text(strip=True)
                        else:
                            raw_price_text = price_strong.get_text(strip=True)
                    else:
                        raw_price_text = price_strong.get_text(strip=True)
                else:
                    price_elements = first_book.find_all(
                        lambda tag: tag.name in ["span"] 
                        and "$" in tag.text
                    )
                    
                    final_price_element = None
                    # ... (rest of fallback logic is same/less critical now as strong covers most)
                    if price_elements:
                         final_price_element = price_elements[0] # Simplification for debug
                    
                    if final_price_element:
                        raw_price_text = final_price_element.get_text(strip=True)
                        
                print(f"Price: {raw_price_text}")
            
            if not found_discounted:
                print("No books with 'line-through' found on this page.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    debug_scraper()
