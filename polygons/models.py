from django.db import models


class FlatPolygon(models.Model):
    section = models.CharField('Секция', max_length=10)
    floor = models.IntegerField('Этаж')
    flat_id = models.CharField('ID / номер квартиры', max_length=50)
    path_d = models.TextField('SVG path (d)')

    class Meta:
        verbose_name = 'Полигон квартиры'
        verbose_name_plural = 'Полигоны квартир'
        unique_together = ('section', 'floor', 'flat_id')
        ordering = ('section', 'floor', 'flat_id')

    def __str__(self):
        return f'Секция {self.section}, этаж {self.floor}, кв. {self.flat_id}'
