import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root' // hace que este servicio esté disponible globalmente
})

export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable(); // observable para que el componente escuche los cambios

  private counter = 0;

  showToast(message: string, type: ToastType = 'info') {
    const newToast: Toast = {
      id: this.counter++,
      message,
      type
    };

    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, newToast]);

    // El toast desaparece automáticamente a los 3 segundos
    setTimeout(() => this.removeToast(newToast.id), 3000);
  }

  removeToast(id: number) {
    const updatedToasts = this.toastsSubject.getValue().filter(t => t.id !== id);
    this.toastsSubject.next(updatedToasts);
  }
}
