from django.contrib import admin
from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation

admin.site.register(Research)
admin.site.register(Paper)
admin.site.register(Concept)
admin.site.register(PaperConcept)
admin.site.register(Prerequisite)
admin.site.register(Citation)