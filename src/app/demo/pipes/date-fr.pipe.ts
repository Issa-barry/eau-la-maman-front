import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFr',
  standalone: true
})
export class DateFrPipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    format: 'full' | 'dateSansHeure' | 'moisEnLettre' = 'full',
    avecHeure: boolean = false
  ): string {
    if (!value) return '';
    const date = new Date(value);

    let result = '';

    switch (format) {
      case 'full':
        // Date complète
        result = date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        break;

      case 'dateSansHeure':
        // Date classique
        result = date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        break;

      case 'moisEnLettre':
        // Jour + mois (en lettres courtes) + année
        const jour = date.getDate().toString().padStart(2, '0');
        const mois = date.toLocaleString('fr-FR', { month: 'short' }).replace('.', '');
        const annee = date.getFullYear();
        result = `${jour}/${mois}/${annee}`;
        break;

      default:
        result = date.toLocaleDateString('fr-FR');
    }

    // Si on demande d'ajouter l'heure
    if (avecHeure) {
      const heure = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      result += ` à ${heure}`;
    }

    return result;
  }
}
