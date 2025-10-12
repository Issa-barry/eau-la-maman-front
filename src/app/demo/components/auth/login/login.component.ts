import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;

  errorMessage = '';

  errors: { [key: string]: string } = {};
  submited = false;
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private layoutService: LayoutService
  ) { }

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  ngOnInit(): void {
    
  }

  login(): void {
    this.errorMessage = '';
    const email = (this.email || '').trim();
    const password = (this.password || '').trim();


    this.submited = true;
    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        // Remember me: on conserve uniquement l'email (jamais le mot de passe)
        if (this.rememberMe) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }

        this.handlePostLoginRedirect();
        this.submited = false;
      },
      error: (err) => {
        this.submited = false;
        this.loading = false;

        // reset
        this.errors = {};
        this.errorMessage = '';

        // récupère le sac d’erreurs (formats possibles)
        const bag = err?.error?.data ?? err?.error?.errors ?? {};

        // normalise en { [champ]: "message" }
        this.errors = Object.keys(bag).reduce((acc, key) => {
          const v = bag[key];
          acc[key] = Array.isArray(v) ? v.join(' ') : String(v);
          return acc;
        }, {} as Record<string, string>);

        // message global UNIQUEMENT si aucun champ en erreur
        if (Object.keys(this.errors).length === 0) {
          this.errorMessage = err?.error?.message || 'Identifiants incorrects';
        }
      },
    });
  }

  goToResetPassword(): void {
    this.router.navigate(['/auth/forgotpassword']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  // ---------- PRIVÉ ----------
  private handlePostLoginRedirect(): void {
    const qp = this.route.snapshot.queryParamMap;
    const urlAfter =
      qp.get('redirect') || sessionStorage.getItem('redirectUrl') || '/dashboard';
    const pendingJson = sessionStorage.getItem('pendingTransferParams');

    // nettoyage
    sessionStorage.removeItem('redirectUrl');

    if (pendingJson && urlAfter.startsWith('/dashboard/transfert/envoie')) {
      const params = this.safeParse(pendingJson);
      sessionStorage.removeItem('pendingTransferParams');
      this.router.navigate(['/dashboard/transfert/envoie'], {
        queryParams: params,
        replaceUrl: true,
      });
    } else {
      this.router.navigateByUrl(urlAfter, { replaceUrl: true });
    }
  }

  private safeParse(json: string | null): any {
    try {
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }
}
