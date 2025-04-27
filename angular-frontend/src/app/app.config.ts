import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr'; // Import toast para alertas

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right',   // 📍 Arriba a la derecha 
      timeOut: 3000,                       // ⏱️ 3 segundos visible
      progressBar: true,                   // 📈 Barra de progreso animada
      progressAnimation: 'increasing',     // 📈 Animación suave
      tapToDismiss: true,                  // 👆 Tocar para cerrar
      enableHtml: true,                    // 🧩 HTML permitido en toasts
      toastClass: 'bg-gray-800 text-white p-4 rounded-md shadow-lg',  
      titleClass: 'text-[#5c8e00] font-bold',  
      messageClass: 'text-gray-300'         
    })
  ]
};
