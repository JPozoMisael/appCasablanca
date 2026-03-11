import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

type Role = string;

@Directive({
  selector: '[appRoleOnly]',
  standalone: true,
})
export class RoleOnlyDirective {
  private hasView = false;

  @Input('appRoleOnly') set rolesAllowed(roles: Role[] | Role) {
    const arr = Array.isArray(roles) ? roles : [roles];
    this.updateView(arr);
  }

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {}

  private getUserRoles(): Role[] {
    try {
      const raw = localStorage.getItem('roles');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  private updateView(allowed: Role[]) {
    const userRoles = this.getUserRoles();
    const ok = allowed.length === 0 ? true : allowed.some((r) => userRoles.includes(r));

    if (ok && !this.hasView) {
      this.vcr.createEmbeddedView(this.tpl);
      this.hasView = true;
    } else if (!ok && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}
