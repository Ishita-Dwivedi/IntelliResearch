from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Research, Paper, Concept, PaperConcept, Prerequisite, Citation
from .serializers import (
    ResearchSerializer, PaperSerializer, ConceptSerializer,
    PrerequisiteSerializer, CitationSerializer, PaperConceptSerializer,
)


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all().order_by("-created_at")
    serializer_class = ResearchSerializer

    @action(detail=True, methods=["post"])
    def chat(self, request, pk=None):
        """Placeholder chat endpoint. Replace this body with a call to the
        teammate's RAG service once its contract is finalized."""
        research = self.get_object()
        question = request.data.get("message", "")

        # TODO: replace with real call to teammate's RAG/AI service,
        # passing research.id and question, returning their grounded answer.
        answer = (
            f"(placeholder) You asked about \"{question}\" regarding "
            f"\"{research.topic}\". This will be answered by the AI "
            f"research assistant once it's connected."
        )

        return Response({"answer": answer, "evidence": []})


class PaperViewSet(viewsets.ModelViewSet):
    queryset = Paper.objects.all()
    serializer_class = PaperSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        research_id = self.request.query_params.get("research")
        if research_id:
            qs = qs.filter(research_id=research_id)
        return qs


class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        research_id = self.request.query_params.get("research")
        if research_id:
            qs = qs.filter(research_id=research_id)
        return qs


class PrerequisiteViewSet(viewsets.ModelViewSet):
    queryset = Prerequisite.objects.all()
    serializer_class = PrerequisiteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        research_id = self.request.query_params.get("research")
        if research_id:
            qs = qs.filter(paper__research_id=research_id)
        return qs


class CitationViewSet(viewsets.ModelViewSet):
    queryset = Citation.objects.all()
    serializer_class = CitationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        research_id = self.request.query_params.get("research")
        if research_id:
            qs = qs.filter(citing_paper__research_id=research_id)
        return qs

class PaperConceptViewSet(viewsets.ModelViewSet):
    queryset = PaperConcept.objects.all()
    serializer_class = PaperConceptSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        research_id = self.request.query_params.get("research")
        if research_id:
            qs = qs.filter(paper__research_id=research_id)
        return qs