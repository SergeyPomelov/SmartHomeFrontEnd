import {Component} from '@angular/core'
import {Observable, of} from 'rxjs'

const API_SCRIPT = 'resources/js/forecast.js'

@Component({
  selector: 'app-weather-forecast-panel',
  templateUrl: './weather-forecast.component.html',
})
export class WeatherForecastPanelComponent {

  apiLoaded: Observable<boolean> = of(false)

  constructor() {
    this.loadScript()
  }

  public loadScript() {

    if (this.findScript()) return

    const node = document.createElement('script')
    node.src = API_SCRIPT
    node.type = 'text/javascript'
    node.async = true
    document.getElementsByTagName('head')[0].appendChild(node)
    this.apiLoaded = of(true)
  }

  private findScript(): boolean {
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; ++i) {
      if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src')?.includes(API_SCRIPT)) {
        this.apiLoaded = of(true)
        return true
      }
    }
    this.apiLoaded = of(false)
    return false
  }
}
