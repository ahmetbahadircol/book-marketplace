from django.db import models

from shared.models import TimestampedModel



class Book(TimestampedModel):
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=255, blank=True, null=True)
    isbn = models.CharField(max_length=13, unique=True, verbose_name="ISBN-13")
    format = models.CharField(max_length=50, blank=True, null=True)

    # Pricing fields
    book_depot_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # Links and Availability
    book_depot_url = models.URLField(max_length=1000, blank=True, null=True)
    stock = models.CharField(max_length=10, blank=True, null=True)  # e.g., "+10000"

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.isbn})"
