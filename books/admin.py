from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from books.models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "isbn",
        "book_depot_price",
        "updated_at",
    )
    search_fields = ("title", "isbn", "author")
    # Make sure 'stock' exists in models.py, otherwise use 'is_in_stock'
    readonly_fields = ("created_at", "updated_at")

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "add-books-from-depot/",
                self.admin_site.admin_view(self.add_books_from_depot),
                name="add-books-from-depot",
            ),
        ]
        return custom_urls + urls

    def add_books_from_depot(self, request):

        from books.tasks import scrape_books

        # 1. Run the scraper
        scrape_books.delay(1, 20)  # Adjust parameters as needed

        # 2. Success message
        self.message_user(request, "Scraping has started in the background!")

        # 3. Redirect back to the table view (Changelist)
        return redirect("admin:books_book_changelist")
