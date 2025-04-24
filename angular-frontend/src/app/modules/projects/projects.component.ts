import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  // Lista que contendrá los proyectos del usuario
  projects: any[] = [];

  // Variable para mostrar un indicador de carga mientras se obtienen los datos
  isLoading = true;

  // Mensaje de error si ocurre algún problema al cargar los proyectos
  error = '';

  constructor(
    private http: HttpClient,   // Cliente HTTP para llamar al backend
    private router: Router       // Router para posibles redirecciones
  ) {}

  /**
   * ngOnInit: función que se ejecuta automáticamente al cargar el componente
   */
  ngOnInit(): void {
    // Llamamos al backend para obtener los proyectos del usuario actual
    this.http.get<any[]>('http://localhost:8000/api/projects').subscribe({
      next: (data) => {
        this.projects = data;   // Guardamos los proyectos recibidos
        this.isLoading = false; // Quitamos el indicador de carga
      },
      error: (err) => {
        // Si ocurre un error, lo mostramos al usuario
        this.error = 'Hubo un error al cargar tus proyectos';
        this.isLoading = false;
      }
    });
  }
}
