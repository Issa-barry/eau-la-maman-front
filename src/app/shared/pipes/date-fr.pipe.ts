import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFr',
  standalone: true
})
export class DateFrPipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    format: 'full' | 'dateSansHeure' | 'moisEnLettre' = 'full'
  ): string {
    if (!value) return '';
    const date = new Date(value);

    switch (format) {
      case 'full':
        // 1. date avec heure
        return date.toLocaleString('fr-FR', {
          weekday: 'long',
          year: 'numeric', 
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

      case 'dateSansHeure':
        // 2. date sans heure
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'moisEnLettre':
        // 3. mois en fr, reste en nombre
        const jour = date.getDate().toString().padStart(2, '0');
        const mois = date.toLocaleString('fr-FR', { month: 'short' }); // ex: sep
        const annee = date.getFullYear();
        return `${jour}/${mois}/${annee}`;

      default:
        return date.toLocaleDateString('fr-FR');
    }
  }
}
