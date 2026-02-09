import threading
from celery import shared_task
from playwright.sync_api import sync_playwright

from playwright_stealth import Stealth
from bs4 import BeautifulSoup
import re
import time
import random
from .models import Book
from shared.utils import clean_price_string


def run_scraper(page_number, page_size=20, result_list=None):
    url = f"https://bookdepot.ca/Store/Browse?page={page_number}&size={page_size}&sort=arrival_1"

    with sync_playwright() as p:
        # Tarayıcıyı başlatıyoruz
        browser = p.chromium.launch(headless=True)

        # Gerçekçi bir tarayıcı ortamı oluşturuyoruz
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
        )
        page = context.new_page()

        stealth = Stealth()
        stealth.apply_stealth_sync(page)

        try:
            # Sayfaya git
            page.goto(url, wait_until="domcontentloaded", timeout=60000)

            # Cloudflare'in çözülmesi için rastgele insansı bekleme
            time.sleep(random.uniform(5, 8))

            content = page.content()
            soup = BeautifulSoup(content, "html.parser")

            books = soup.select(".grid-item")

            if not books:
                print(
                    "Kitap bulunamadı. Sayfa yapısı değişmiş veya Cloudflare engeline takılmış olabiliriz."
                )
                # Sayfa içeriğini debug için yazdırabilirsin: print(soup.prettify()[:500])
                return -1

            print(f"Sayfa {page_number}: {len(books)} kitap bulundu.\n")

            for book in books:
                # 1. Başlık
                title_tag = book.select_one("a.truncate")
                title = (
                    title_tag.get_text(strip=True) if title_tag else "Title not found"
                )

                # 2. Yazar
                author_tag = book.select_one('a[href*="Na="]')
                author = (
                    author_tag.get_text(strip=True)
                    if author_tag
                    else "Author not found"
                )

                # 3. Format
                format_tag = book.select_one('a[href*="Nb="]')
                book_format = (
                    format_tag.get_text(strip=True)
                    if format_tag
                    else "Format not found"
                )

                # 4. Fiyat Mantığı - Sadece ham metni (raw text) alıyoruz
                raw_price_text = "0.00"
                price_elements = book.find_all(
                    lambda tag: tag.name in ["span", "strong", "div"]
                    and "$" in tag.text
                )

                final_price_element = None
                for el in price_elements:
                    style = el.get("style", "")
                    # Eğer üzeri çizili fiyat (eski fiyat) bulursak, bir sonrakini al
                    if "line-through" in style:
                        next_el = el.find_next_sibling()
                        final_price_element = (
                            next_el if next_el else el.find_next("span")
                        )
                        break
                    # Üzeri çizili yoksa, bulduğun ilk dolar işaretli elementi al
                    if not final_price_element:
                        final_price_element = el

                if final_price_element:
                    raw_price_text = final_price_element.get_text(strip=True)

                # 5. ISBN Mantığı
                isbn = "ISBN not found"
                isbn_element = book.find(
                    lambda tag: tag.name in ["span", "div", "p"] and "ISBN:" in tag.text
                )
                if isbn_element:
                    isbn_match = re.search(r"ISBN:\s*(\d{13})", isbn_element.text)
                    if isbn_match:
                        isbn = isbn_match.group(1)

                # 6. Stok/Miktar Mantığı
                quantity = "0"
                quantity_tag = book.select_one(".caption .dropdown .small")
                if quantity_tag:
                    qty_match = re.search(
                        r"Qty:\s*(\d+\+?)", quantity_tag.get_text(strip=True)
                    )
                    if qty_match:
                        quantity = qty_match.group(1)

                # ISBN yoksa kaydetme (Unique constraint hatasını önler)
                if isbn == "ISBN not found":
                    continue

                extracted_data = {
                    "title": title,
                    "author": author,
                    "format": book_format,
                    "book_depot_price": raw_price_text,
                    "isbn": isbn,
                    "stock": quantity,
                }

                result_list.append(extracted_data)

            return page_number + 1

        except Exception as e:
            print(f"Beklenmeyen bir hata oluştu: {e}")
            return None
        finally:
            browser.close()


@shared_task
def scrape_books(page_number, page_size=20):
    extracted_books = []
    # 3. Playwright'ı Django'dan kaçırma operasyonu
    thread = threading.Thread(
        target=run_scraper, args=(page_number, page_size, extracted_books)
    )
    thread.start()
    thread.join()  # Thread bitene kadar Celery worker'ı bekletir

    for data in extracted_books:
        Book.objects.update_or_create(
            isbn=data["isbn"],
            defaults={
                "title": data["title"],
                "author": data["author"],
                "format": data["format"],
                "book_depot_price": clean_price_string(data["book_depot_price"]),
                "stock": data["stock"],
            },
        )

    return f"Sayfa {page_number} tamamlandı."
