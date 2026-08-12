from rest_framework.routers import DefaultRouter
from .views import ResearchViewSet, PaperViewSet, ConceptViewSet, PrerequisiteViewSet, CitationViewSet

router = DefaultRouter()
router.register("research", ResearchViewSet)
router.register("papers", PaperViewSet)
router.register("concepts", ConceptViewSet)
router.register("prerequisites", PrerequisiteViewSet)
router.register("citations", CitationViewSet)

urlpatterns = router.urls