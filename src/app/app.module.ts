import {APP_BASE_HREF} from '@angular/common'
import {HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule} from '@angular/common/http'
import {NgModule} from '@angular/core'
import {GoogleMapsModule} from '@angular/google-maps'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {ServiceWorkerModule} from '@angular/service-worker'
import {ColorPickerModule} from 'ngx-color-picker'
import {CookieService} from 'ngx-cookie-service'
import {AppRoutingModule} from 'src/app/app-routing.module'
import {BarComponent} from 'src/app/components/bar/bar.component'
import {BlockComponent} from 'src/app/components/blocks/block/block.component'
import {ColorSwitchBlockComponent} from 'src/app/components/blocks/colorSwitchBlock/color-switch-block.component'
import {SceneBlockComponent} from 'src/app/components/blocks/sceneBlock/scene-block.component'
import {SunriseBlockComponent} from 'src/app/components/blocks/sunriseBlock/sunrise-block.component'
import {HeaderComponent} from 'src/app/components/header/header.component'
import {BedRoomPanelComponent} from 'src/app/components/panel/bedroomPanel/bed-room-panel.component'
import {DevicesPanelComponent} from 'src/app/components/panel/devicesPanel/devices-panel.component'
import {GoogleMapPanelComponent} from 'src/app/components/panel/googleMapPanel/google-map-panel.component'
import {KitchenHallwayPanelComponent} from 'src/app/components/panel/hallwayPanel/kitchen-hallway-panel.component'
import {LivingRoomPanelComponent} from 'src/app/components/panel/livingRoomPanel/living-room-panel.component'
import {MiRobotPanelComponent} from 'src/app/components/panel/miRobotPanel/mi-robot-panel.component'
import {PlantPanelComponent} from 'src/app/components/panel/plantPanel/plant-panel.component'
import {PowerPanelComponent} from 'src/app/components/panel/powerPanel/power-panel.component'
import {ServerPanelComponent} from 'src/app/components/panel/serverPanel/server-panel.component'
import {StatePanelComponent} from 'src/app/components/panel/statePanel/state-panel.component'
import {WeatherPanelComponent} from 'src/app/components/panel/weatherPanel/weather-panel.component'
import {AppInterceptor} from 'src/app/http.interseptor'
import {FirstPageComponent} from 'src/app/pages/1/first-page.component'
import {SecondPageComponent} from 'src/app/pages/2/second-page.component'
import {environment} from 'src/environments/environment'
import {AppComponent} from './app.component'

@NgModule({
  declarations: [
    AppComponent,
    FirstPageComponent,
    SecondPageComponent,
    BlockComponent,
    SceneBlockComponent,
    ColorSwitchBlockComponent,
    SunriseBlockComponent,
    BarComponent,
    HeaderComponent,
    BedRoomPanelComponent,
    LivingRoomPanelComponent,
    KitchenHallwayPanelComponent,
    StatePanelComponent,
    MiRobotPanelComponent,
    WeatherPanelComponent,
    ServerPanelComponent,
    PowerPanelComponent,
    DevicesPanelComponent,
    GoogleMapPanelComponent,
    PlantPanelComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AppRoutingModule,
    GoogleMapsModule,
    ColorPickerModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:5000',
    }),
  ],
  providers: [
    CookieService,
    {provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true},
    {provide: APP_BASE_HREF, useValue: '/ui'},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
