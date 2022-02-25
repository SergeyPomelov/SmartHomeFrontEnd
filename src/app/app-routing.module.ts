import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'

import {FirstPageComponent} from 'src/app/pages/1/first-page.component'
import {SecondPageComponent} from 'src/app/pages/2/second-page.component'

const appRoutes: Routes = [
  {path: '', redirectTo: '/1', pathMatch: 'full'},
  {path: '1', component: FirstPageComponent, data: {animation: 'FirstPage'}},
  {path: '2', component: SecondPageComponent, data: {animation: 'SecondPage'}},
]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
