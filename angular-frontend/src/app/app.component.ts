import { Component } from '@angular/core';
import { ToastComponent } from './shared/components/toast/toast.component'; // Se importa ToastComponent
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent], // Se añade ToastComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-frontend';
}
