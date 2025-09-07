import { RedirectCommand, Routes } from '@angular/router';
import { Signup } from '../auth/signup/signup';
import { Login } from '../auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { AuthGuard } from '../guard/auth.guard';
import { Forgotpassword } from '../auth/forgotpassword/forgotpassword';
import { Ownerdashboard } from '../ownerdashboard/ownerdashboard';
import { Directcomponent } from './directcomponent/directcomponent';
import { Home } from '../ownerdashboard/pages/home/home';
import { Resetpassword } from '../auth/resetpassword/resetpassword';
import { InvoicePrint } from './invoice-print/invoice-print';
import { Inventory } from '../ownerdashboard/pages/inventory/inventory';
import { SalesReportComponent } from '../ownerdashboard/pages/sales-report-component/sales-report-component';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login, },
  { path: 'invoice/:id', component: InvoicePrint },

  { path: 'forgotpassword', component: Forgotpassword },{path:'reset-password',component:Resetpassword},
  {path:'redirect', component:Directcomponent},
  { path: '', redirectTo: '/redirect', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
{
  path: 'admin-dashboard',
  component: Ownerdashboard,
  canActivate: [AuthGuard],
  children: [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: Home
    },
    {
      path: 'Inventory',
      component: Inventory
    },
    {
      path: 'sales',
      component: SalesReportComponent
    },
  ]
}



];
