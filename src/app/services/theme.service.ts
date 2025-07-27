import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // تأكد إن الكود ده بيشتغل في المتصفح فقط
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      this.setTheme(isDark);
    } else {
      // ممكن تحط default في حالة السيرفر مثلاً
      this.setTheme(false); // أو true لو عايز تبدأ بـ dark
      console.warn('localStorage or window is not available (probably SSR)');
    }
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkModeSubject.value;
    this.setTheme(!currentTheme);
  }

  private setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);

    if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }
}
