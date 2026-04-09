import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class InicioPage {

  branches = [
    {
      name: 'Casa Blanca Chipipe',
      slug: 'chipipe',
      description: 'Frente a la playa más tranquila de Salinas',
      image: 'assets/img/26.jpeg',
      tags: [
        { icon: 'water-outline', label: 'Playa' },
        { icon: 'people-outline', label: 'Familiar' },
        { icon: 'sunny-outline', label: 'Vista al mar' }
      ]
    },
    {
      name: 'Casa Blanca Palmeras',
      slug: 'palmeras',
      description: 'Zona céntrica cerca de restaurantes y comercio',
      image: 'assets/img/25.jpeg',
      tags: [
        { icon: 'restaurant-outline', label: 'Restaurantes' },
        { icon: 'business-outline', label: 'Centro' },
        { icon: 'moon-outline', label: 'Vida nocturna' }
      ]
    },
    {
      name: 'Casa Blanca Ballenita',
      slug: 'ballenita',
      description: 'Vista panorámica en zona tranquila',
      image: 'assets/img/27.jpeg',
      tags: [
        { icon: 'eye-outline', label: 'Vista' },
        { icon: 'leaf-outline', label: 'Relax' },
        { icon: 'bed-outline', label: 'Tranquilidad' }
      ]
    }
  ];

}