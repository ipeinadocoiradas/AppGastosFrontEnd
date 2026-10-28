import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly open = input(false);
  readonly closed = output<void>();

  /** Un usuario sin rol de administrador solo ve Cuentas y Movimientos. */
  protected readonly items = computed(() =>
    NAV_ITEMS.filter((item) => !item.adminOnly || this.auth.isAdmin()),
  );
}
