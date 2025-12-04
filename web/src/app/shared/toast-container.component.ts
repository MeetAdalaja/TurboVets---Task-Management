import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastService, Toast } from "./toast.service";

@Component({
  standalone: true,
  selector: "app-toast-container",
  imports: [CommonModule],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4 sm:justify-end"
    >
      <div class="flex w-full max-w-sm flex-col gap-2 pointer-events-auto">
        <div
          *ngFor="let toast of toasts"
          class="flex items-start gap-3 rounded-xl border px-3 py-2 text-[11px] shadow-xl
                 bg-white/95 text-slate-900
                 dark:bg-slate-900/95 dark:text-slate-100
                 transition-all duration-200 ease-out
                 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.9)]"
          [ngClass]="{
            'border-emerald-400/70 ring-1 ring-emerald-500/20':
              toast.type === 'success',
            'border-rose-400/70 ring-1 ring-rose-500/20':
              toast.type === 'error',
            'border-indigo-400/70 ring-1 ring-indigo-500/20':
              toast.type === 'info',
            'border-amber-400/70 ring-1 ring-amber-500/20':
              toast.type === 'warning'
          }"
        >
          <!-- Icon dot -->
          <div class="mt-0.5">
            <span
              class="inline-block h-2.5 w-2.5 rounded-full"
              [ngClass]="{
                'bg-emerald-400': toast.type === 'success',
                'bg-rose-400': toast.type === 'error',
                'bg-indigo-400': toast.type === 'info',
                'bg-amber-400': toast.type === 'warning'
              }"
            ></span>
          </div>

          <!-- Content -->
          <div class="flex-1 space-y-0.5">
            <p
              *ngIf="toast.title"
              class="text-[11px] font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-300"
            >
              {{ toast.title }}
            </p>
            <p class="text-[11px] text-slate-700 dark:text-slate-200">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full
                   bg-slate-100 text-[11px] text-slate-500 hover:bg-slate-200
                   dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe((t) => (this.toasts = t));
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
