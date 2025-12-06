from django.contrib import admin
from django.db.models import Model as DjangoModel
from . import models

# Register your models here.
for attr in dir(models):
    obj = getattr(models, attr)
    if isinstance(obj, type) and issubclass(obj, DjangoModel):
        try:
            admin.site.register(obj)
        except admin.sites.AlreadyRegistered:
            pass