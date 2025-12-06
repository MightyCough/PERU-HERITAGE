from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from typing import Type, Optional
from django.db.models import Model


class BaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet base con funcionalidad común para todas las vistas.
    Proporciona métodos de respuesta estandarizados y manejo de errores.
    """
    
    def success_response(self, data, message: str = "Operación exitosa", status_code=status.HTTP_200_OK):
        """Respuesta exitosa estandarizada."""
        return Response({
            'success': True,
            'message': message,
            'data': data
        }, status=status_code)
    
    def error_response(self, message: str, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Respuesta de error estandarizada."""
        response_data = {
            'success': False,
            'message': message,
        }
        if errors:
            response_data['errors'] = errors
        return Response(response_data, status=status_code)
    
    def create(self, request, *args, **kwargs):
        """Sobrescribe el método create para respuesta personalizada."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return self.success_response(
                serializer.data,
                message="Registro creado exitosamente",
                status_code=status.HTTP_201_CREATED
            )
        return self.error_response(
            message="Error al crear el registro",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def update(self, request, *args, **kwargs):
        """Sobrescribe el método update para respuesta personalizada."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            return self.success_response(
                serializer.data,
                message="Registro actualizado exitosamente"
            )
        return self.error_response(
            message="Error al actualizar el registro",
            errors=serializer.errors
        )
    
    def destroy(self, request, *args, **kwargs):
        """Sobrescribe el método destroy para respuesta personalizada."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return self.success_response(
            None,
            message="Registro eliminado exitosamente",
            status_code=status.HTTP_204_NO_CONTENT
        )
    
    def list(self, request, *args, **kwargs):
        """Sobrescribe el método list para respuesta personalizada."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return self.success_response(
            serializer.data,
            message="Lista obtenida exitosamente"
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Sobrescribe el método retrieve para respuesta personalizada."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.success_response(
            serializer.data,
            message="Registro obtenido exitosamente"
        )
