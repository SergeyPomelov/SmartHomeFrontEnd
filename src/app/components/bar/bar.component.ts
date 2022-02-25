import {Component} from '@angular/core'
import {DomoticzService} from 'src/app/domoticz.service'
import {Router} from '@angular/router'

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
})
export class BarComponent {

  title = 'Smart UI'
  date: number = Date.now()

  constructor(private router: Router, private domoticzService: DomoticzService) {
    setInterval(() => {
      this.date = Date.now()
    }, 1000)
  }

  wsOffline(): boolean {
    return this.domoticzService.isWsOffline()
  }

  offline(): boolean {
    return this.domoticzService.isOffline()
  }
}
