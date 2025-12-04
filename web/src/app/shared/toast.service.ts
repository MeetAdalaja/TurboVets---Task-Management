import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
  duration: number; // ms
}

@Injectable({ providedIn: "root" })
export class ToastService {
  private _toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts.asObservable();

  private counter = 0;

  show(
    message: string,
    options: { title?: string; type?: ToastType; duration?: number } = {}
  ) {
    const id = ++this.counter;
    const toast: Toast = {
      id,
      message,
      title: options.title,
      type: options.type ?? "info",
      duration: options.duration ?? 4000,
    };

    const current = this._toasts.getValue();
    this._toasts.next([...current, toast]);

    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }

  dismiss(id: number) {
    const current = this._toasts.getValue();
    this._toasts.next(current.filter((t) => t.id !== id));
  }

  clear() {
    this._toasts.next([]);
  }
}
