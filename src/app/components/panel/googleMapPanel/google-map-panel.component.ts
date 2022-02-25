import {Component} from '@angular/core'
import {Observable, of} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {environment} from 'src/environments/environment'

const API_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`

@Component({
  selector: 'app-google-map-panel',
  templateUrl: './google-map-panel.component.html',
})
export class GoogleMapPanelComponent {

  apiLoaded: Observable<boolean> = of(false)

  constructor(private http: HttpClient) {

    if (this.findScript()) return

    http.jsonp(API_SCRIPT, 'callback')
    .toPromise()
    .then(
      () => this.apiLoaded = of(true),
    )
    .catch((err) => {
        console.log(err.message)
        this.apiLoaded = of(false)
      },
    )
  }

  private findScript(): boolean {
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; ++i) {
      if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src')?.includes('key=AIzaSyAhKwbAyryjLUwo4U3VZ0Lrfk-P5J4k-YY')) {
        this.apiLoaded = of(true)
        return true
      }
    }
    this.apiLoaded = of(false)
    return false
  }
}
