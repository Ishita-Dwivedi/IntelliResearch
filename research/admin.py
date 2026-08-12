from django.contrib import admin
from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation


class PaperInline(admin.TabularInline):
    """Lets you edit a Research's papers (including order_position)
    right on the Research's own admin page, instead of navigating away."""
    model = Paper
    extra = 0
    fields = ["title", "file", "order_position", "ai_summary"]


class ResearchAdmin(admin.ModelAdmin):
    list_display = ["topic", "status", "created_at"]
    list_editable = ["status"]  # change status directly from the list view
    inlines = [PaperInline]


admin.site.register(Research, ResearchAdmin)
admin.site.register(Paper)
admin.site.register(Concept)
admin.site.register(PaperConcept)
admin.site.register(Prerequisite)
admin.site.register(Citation)