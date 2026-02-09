import requests
import cloudscraper
from bs4 import BeautifulSoup
from celery import shared_task
from models import Book
import httpx


@shared_task
def scrape_books(page_number, page_size=2000):
    url = f"https://bookdepot.ca/Store/Browse?page={page_number}&size={page_size}&sort=arrival_1"
    # scraper = cloudscraper.create_scraper(
    #     browser={"browser": "chrome", "platform": "windows", "desktop": True}
    # )
    # scraper.headers.update(
    #     {
    #         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    #         "Accept-Language": "en-US,en;q=0.5",
    #         "DNT": "1",
    #         "Connection": "keep-alive",
    #         "Upgrade-Insecure-Requests": "1",
    #     }
    # )
    # Source - https://stackoverflow.com/a/73444576

    client = httpx.Client(http2=True)

    try:
        response = client.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Find all book containers based on analysis
        # The browser analysis suggested .grid-item is the main container
        books = soup.select(".grid-item")

        if not books:
            print("No books found. The page structure might have changed.")
            return -1

        print(f"Found {len(books)} books on the first page:\n")

        for book in books:
            # Extract Title
            title_tag = book.select_one("a.truncate")
            title = title_tag.get_text(strip=True) if title_tag else "Title not found"

            # Extract Author - looking for links with 'Na=' in href
            author_tag = book.select_one('a[href*="Na="]')
            author = (
                author_tag.get_text(strip=True) if author_tag else "Author not found"
            )

            # Extract Format - looking for links with 'Nb=' in href
            format_tag = book.select_one('a[href*="Nb="]')
            book_format = (
                format_tag.get_text(strip=True) if format_tag else "Format not found"
            )

            # Extract Price
            price = "Price not found"
            # Look for price elements
            price_elements = book.find_all(
                lambda tag: tag.name in ["span", "strong", "div"] and "$" in tag.text
            )

            final_price_element = None
            for el in price_elements:
                # Check if this element is struck through
                style = el.get("style", "")
                if (
                    "text-decoration:line-through" in style
                    or "text-decoration: line-through" in style
                ):
                    # This is the old price, look for the next sibling/element
                    next_el = el.find_next_sibling()
                    if next_el:
                        final_price_element = next_el
                    else:
                        # Sometimes it might be the next span in the parent
                        final_price_element = el.find_next("span")
                    break
                else:
                    # If we found a price element and it's NOT struck through, it might be the regular price
                    # But we should prefer the one that comes AFTER a struck-through one if it exists.
                    # Simpler approach: If we haven't found a struck-through one yet, keep this as candidate
                    if not final_price_element:
                        final_price_element = el

            if final_price_element:
                import re

                price_match = re.search(r"\$\d+(?:\.\d+)?", final_price_element.text)
                if price_match:
                    price = price_match.group(0)

            # Extract ISBN
            # Look for text "ISBN:" in the caption or any span/div
            isbn = "ISBN not found"
            isbn_element = book.find(
                lambda tag: tag.name in ["span", "div", "p"] and "ISBN:" in tag.text
            )
            if isbn_element:
                import re

                isbn_match = re.search(r"ISBN:\s*(\d{13})", isbn_element.text)
                if isbn_match:
                    isbn = isbn_match.group(1)

            # Extract Quantity
            quantity = "Quantity not found"
            # Based on browser inspection, quantity is in .caption .dropdown .small
            # Text format example: "List: $16.99 - Qty: 1000+"
            quantity_tag = book.select_one(".caption .dropdown .small")
            if quantity_tag:
                import re

                qty_match = re.search(
                    r"Qty:\s*(\d+\+?)", quantity_tag.get_text(strip=True)
                )
                if qty_match:
                    quantity = qty_match.group(1)

            print(f"Title:  {title}")
            print(f"Author: {author}")
            print(f"Format: {book_format}")
            print(f"ISBN:   {isbn}")
            print(f"Price:  {price}")
            print(f"Quantity: {quantity}")
            print("-" * 40)
            Book.objects.update_or_create(
                isbn=isbn,
                defaults={
                    "title": title,
                    "author": author,
                    "format": book_format,
                    "book_depot_price": float(price.replace("$", ""), 2),
                    "stock": quantity,
                },
            )

        return page_number + 1

    except requests.exceptions.RequestException as e:
        print(f"Error scraping {url}: {e}")
        if "response" in locals():
            print("Response content (first 500 chars):")
            print(response.text[:500])
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    # page = 1
    # while page:
    #     page = scrape_books(page)
    scrape_books(1, page_size=10)
